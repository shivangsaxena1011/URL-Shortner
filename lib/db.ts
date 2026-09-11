import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import os from "os";

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: any;
  // eslint-disable-next-line no-var
  var fallbackMemoryDb: LocalData | undefined;
}

// Ensure process.env.DATABASE_URL has a placeholder if missing
// to prevent Prisma from throwing "Environment variable not found: DATABASE_URL" on initialization.
const hasValidDatabaseUrl = Boolean(
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.trim() !== "" &&
  process.env.DATABASE_URL.startsWith("postgres")
);

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/linkshortener?schema=public";
}

// Detect serverless environment (Netlify, Vercel, AWS Lambda)
const isServerless = Boolean(
  process.env.NETLIFY ||
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NOW_REGION
);

const dataDir = isServerless
  ? path.join(os.tmpdir(), "link-shortener-data")
  : path.join(process.cwd(), "data");
const dbFilePath = path.join(dataDir, "db.json");

export interface LocalData {
  users: any[];
  urls: any[];
  clicks: any[];
}

// In-memory persistent cache for serverless / read-only filesystems
if (!global.fallbackMemoryDb) {
  global.fallbackMemoryDb = {
    users: [],
    urls: [],
    clicks: [],
  };
}

function getLocalData(): LocalData {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(dbFilePath)) {
      const content = fs.readFileSync(dbFilePath, "utf-8");
      const parsed = JSON.parse(content);
      global.fallbackMemoryDb = parsed;
      return parsed;
    }
    // Write initial template if possible
    fs.writeFileSync(dbFilePath, JSON.stringify(global.fallbackMemoryDb, null, 2), "utf-8");
  } catch {
    // If disk read/write fails, smoothly return in-memory state
  }
  return global.fallbackMemoryDb || { users: [], urls: [], clicks: [] };
}

function saveLocalData(data: LocalData) {
  global.fallbackMemoryDb = data;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Gracefully ignore filesystem errors in read-only environments
  }
}

// Robust condition matcher that supports Prisma-style where queries
function matchesWhere(item: any, condition: any): boolean {
  if (!condition || typeof condition !== "object") return true;

  for (const [key, val] of Object.entries(condition)) {
    if (key === "OR" && Array.isArray(val)) {
      if (!val.some((subCond) => matchesWhere(item, subCond))) return false;
      continue;
    }
    if (key === "AND" && Array.isArray(val)) {
      if (!val.every((subCond) => matchesWhere(item, subCond))) return false;
      continue;
    }

    const itemVal = item[key];

    if (val === null || val === undefined) {
      if (itemVal !== null && itemVal !== undefined) return false;
      continue;
    }

    if (typeof val === "object") {
      const v = val as any;
      if ("equals" in v) {
        const target = v.equals;
        if (v.mode === "insensitive") {
          if (String(itemVal || "").toLowerCase() !== String(target || "").toLowerCase()) return false;
        } else {
          if (itemVal !== target) return false;
        }
      }
      if ("contains" in v) {
        const target = String(v.contains || "").toLowerCase();
        if (!String(itemVal || "").toLowerCase().includes(target)) return false;
      }
      if ("gt" in v) {
        if (!itemVal || new Date(itemVal).getTime() <= new Date(v.gt).getTime()) return false;
      }
      if ("gte" in v) {
        if (!itemVal || new Date(itemVal).getTime() < new Date(v.gte).getTime()) return false;
      }
      if ("lt" in v) {
        if (!itemVal || new Date(itemVal).getTime() >= new Date(v.lt).getTime()) return false;
      }
      if ("lte" in v) {
        if (!itemVal || new Date(itemVal).getTime() > new Date(v.lte).getTime()) return false;
      }
    } else {
      if (typeof itemVal === "string" && typeof val === "string") {
        if (itemVal.toLowerCase() !== val.toLowerCase()) return false;
      } else {
        if (itemVal !== val) return false;
      }
    }
  }

  return true;
}

// Local In-Memory / File-backed fallback handler
const localDb = {
  url: {
    async findFirst(args?: any) {
      const db = getLocalData();
      if (!args?.where) return db.urls[0] || null;
      const found = db.urls.find((u) => matchesWhere(u, args.where));
      return found ? { ...found } : null;
    },

    async findUnique(args: any) {
      const db = getLocalData();
      const id = args.where?.id;
      const url = db.urls.find((u) => u.id === id);
      if (!url) return null;

      if (args.include?.clicks) {
        const clicks = db.clicks.filter((c) => c.urlId === id);
        return { ...url, clicks };
      }
      return { ...url };
    },

    async findMany(args?: any) {
      const db = getLocalData();
      let results = [...db.urls];

      if (args?.where) {
        results = results.filter((u) => matchesWhere(u, args.where));
      }

      // Handle custom sorting
      if (args?.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0] as [string, "asc" | "desc"];
        results.sort((a, b) => {
          let aVal = a[field];
          let bVal = b[field];
          if (field === "createdAt" || field === "updatedAt" || field === "expiresAt") {
            aVal = aVal ? new Date(aVal).getTime() : 0;
            bVal = bVal ? new Date(bVal).getTime() : 0;
          }
          if (aVal < bVal) return direction === "asc" ? -1 : 1;
          if (aVal > bVal) return direction === "asc" ? 1 : -1;
          return 0;
        });
      } else {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      if (args?.skip !== undefined && args?.take !== undefined) {
        results = results.slice(args.skip, args.skip + args.take);
      }

      // Handle select fields if specified
      if (args?.select) {
        return results.map((item) => {
          const selected: any = {};
          for (const key of Object.keys(args.select)) {
            selected[key] = item[key];
          }
          return selected;
        });
      }

      return results.map((r) => ({ ...r }));
    },

    async count(args?: any) {
      const db = getLocalData();
      if (!args?.where) return db.urls.length;
      return db.urls.filter((u) => matchesWhere(u, args.where)).length;
    },

    async create(args: any) {
      const db = getLocalData();
      const record = {
        id: "loc_" + Math.random().toString(36).substring(2, 9),
        ...args.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clickCount: 0,
      };
      db.urls.unshift(record);
      saveLocalData(db);
      return { ...record };
    },

    async update(args: any) {
      const db = getLocalData();
      const index = db.urls.findIndex((u) => u.id === args.where.id);
      if (index === -1) throw new Error("URL not found");

      const item = { ...db.urls[index] };
      const data = args.data;

      if (data.clickCount?.increment) {
        item.clickCount = (item.clickCount || 0) + data.clickCount.increment;
      }
      if (data.originalUrl !== undefined) item.originalUrl = data.originalUrl;
      if (data.isActive !== undefined) item.isActive = data.isActive;
      if (data.expiresAt !== undefined) item.expiresAt = data.expiresAt;
      item.updatedAt = new Date().toISOString();

      db.urls[index] = item;
      saveLocalData(db);
      return { ...item };
    },

    async delete(args: any) {
      const db = getLocalData();
      db.urls = db.urls.filter((u) => u.id !== args.where.id);
      db.clicks = db.clicks.filter((c) => c.urlId !== args.where.id);
      saveLocalData(db);
      return { id: args.where.id };
    },
  },

  click: {
    async create(args: any) {
      const db = getLocalData();
      const record = {
        id: "clk_" + Math.random().toString(36).substring(2, 9),
        ...args.data,
        timestamp: new Date().toISOString(),
      };
      db.clicks.push(record);
      saveLocalData(db);
      return { ...record };
    },
  },

  user: {
    async findUnique(args: any) {
      const db = getLocalData();
      if (args.where?.email) {
        const u = db.users.find((u) => u.email.toLowerCase() === args.where.email.toLowerCase());
        return u ? { ...u } : null;
      }
      if (args.where?.id) {
        const u = db.users.find((u) => u.id === args.where.id);
        return u ? { ...u } : null;
      }
      return null;
    },

    async create(args: any) {
      const db = getLocalData();
      const record = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        ...args.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(record);
      saveLocalData(db);
      return { ...record };
    },
  },

  async $transaction(operations: any[]) {
    return Promise.all(operations);
  },
};

let rawPrisma: PrismaClient | null = null;
let fallbackActive = !hasValidDatabaseUrl;

if (hasValidDatabaseUrl) {
  try {
    rawPrisma = new PrismaClient({
      log: ["error"],
    });
  } catch {
    fallbackActive = true;
  }
}

// Resilient proxy: executes query via Prisma if available;
// if DATABASE_URL is missing or database is unreachable, seamlessly handles
// all queries with local persistent storage so URLs and redirects NEVER fail.
function createResilientModel(modelName: "url" | "click" | "user") {
  return new Proxy(
    {},
    {
      get(_, prop: string) {
        return async (...args: any[]) => {
          if (!fallbackActive && rawPrisma && hasValidDatabaseUrl) {
            try {
              return await (rawPrisma as any)[modelName][prop](...args);
            } catch (err: any) {
              if (!fallbackActive) {
                console.warn(
                  `⚠️ [Database] Falling back to resilient local storage: ${err?.message?.split("\n")[0] || err}`
                );
                fallbackActive = true;
              }
              return await (localDb as any)[modelName][prop](...args);
            }
          }
          return await (localDb as any)[modelName][prop](...args);
        };
      },
    }
  );
}

export const prisma =
  global.prismaInstance || {
    url: createResilientModel("url"),
    click: createResilientModel("click"),
    user: createResilientModel("user"),
    async $transaction(ops: any[]) {
      if (!fallbackActive && rawPrisma && hasValidDatabaseUrl) {
        try {
          return await rawPrisma.$transaction(ops);
        } catch {
          fallbackActive = true;
          return Promise.all(ops);
        }
      }
      return Promise.all(ops);
    },
  };

if (process.env.NODE_ENV !== "production") {
  global.prismaInstance = prisma;
}

export default prisma;
