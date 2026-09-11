import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: any;
}

// Ensure data directory exists for local fallback storage
const dataDir = path.join(process.cwd(), "data");
const dbFilePath = path.join(dataDir, "db.json");

interface LocalData {
  users: any[];
  urls: any[];
  clicks: any[];
}

function getLocalData(): LocalData {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dbFilePath)) {
      const initial: LocalData = { users: [], urls: [], clicks: [] };
      fs.writeFileSync(dbFilePath, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(dbFilePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("[Local DB] Read error:", err);
    return { users: [], urls: [], clicks: [] };
  }
}

function saveLocalData(data: LocalData) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[Local DB] Write error:", err);
  }
}

// Local In-Memory / File-backed fallback handler
const localDb = {
  url: {
    async findFirst(args?: any) {
      const db = getLocalData();
      if (!args?.where) return db.urls[0] || null;

      const { OR, shortCode, customAlias } = args.where;

      const found = db.urls.find((u) => {
        if (OR && Array.isArray(OR)) {
          return OR.some((condition) => {
            if (condition.shortCode) {
              const val = condition.shortCode?.equals || condition.shortCode;
              if (String(u.shortCode).toLowerCase() === String(val).toLowerCase()) return true;
            }
            if (condition.customAlias) {
              const val = condition.customAlias?.equals || condition.customAlias;
              if (u.customAlias && String(u.customAlias).toLowerCase() === String(val).toLowerCase()) return true;
            }
            return false;
          });
        }
        if (shortCode) {
          const val = shortCode?.equals || shortCode;
          if (String(u.shortCode).toLowerCase() === String(val).toLowerCase()) return true;
        }
        if (customAlias) {
          const val = customAlias?.equals || customAlias;
          if (u.customAlias && String(u.customAlias).toLowerCase() === String(val).toLowerCase()) return true;
        }
        return false;
      });

      return found || null;
    },

    async findUnique(args: any) {
      const db = getLocalData();
      const id = args.where.id;
      const url = db.urls.find((u) => u.id === id);
      if (!url) return null;

      if (args.include?.clicks) {
        const clicks = db.clicks.filter((c) => c.urlId === id);
        return { ...url, clicks };
      }
      return url;
    },

    async findMany(args?: any) {
      const db = getLocalData();
      let results = [...db.urls];

      if (args?.where) {
        const { userId, search } = args.where;
        if (userId) {
          results = results.filter((u) => u.userId === userId);
        }
        if (search) {
          const s = search.toLowerCase();
          results = results.filter(
            (u) =>
              u.shortCode.toLowerCase().includes(s) ||
              (u.customAlias && u.customAlias.toLowerCase().includes(s)) ||
              u.originalUrl.toLowerCase().includes(s)
          );
        }
      }

      // Sort
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (args?.skip !== undefined && args?.take !== undefined) {
        return results.slice(args.skip, args.skip + args.take);
      }
      return results;
    },

    async count(args?: any) {
      const db = getLocalData();
      if (!args?.where) return db.urls.length;
      const { userId } = args.where;
      if (userId) {
        return db.urls.filter((u) => u.userId === userId).length;
      }
      return db.urls.length;
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
      return record;
    },

    async update(args: any) {
      const db = getLocalData();
      const index = db.urls.findIndex((u) => u.id === args.where.id);
      if (index === -1) throw new Error("URL not found");

      const item = db.urls[index];
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
      return item;
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
      return record;
    },
  },

  user: {
    async findUnique(args: any) {
      const db = getLocalData();
      if (args.where?.email) {
        return db.users.find((u) => u.email.toLowerCase() === args.where.email.toLowerCase()) || null;
      }
      if (args.where?.id) {
        return db.users.find((u) => u.id === args.where.id) || null;
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
      return record;
    },
  },

  async $transaction(operations: any[]) {
    return Promise.all(operations);
  },
};

let rawPrisma: PrismaClient | null = null;
let fallbackActive = false;

try {
  rawPrisma = new PrismaClient({
    log: ["error"],
  });
} catch {
  fallbackActive = true;
}

// Resilient proxy: tries PostgreSQL via Prisma; if database is unreachable,
// seamlessly falls back to local persistent store so shortening ALWAYS works.
function createResilientModel(modelName: "url" | "click" | "user") {
  return new Proxy(
    {},
    {
      get(_, prop: string) {
        return async (...args: any[]) => {
          if (!fallbackActive && rawPrisma) {
            try {
              return await (rawPrisma as any)[modelName][prop](...args);
            } catch (err: any) {
              const msg = String(err?.message || "");
              if (
                msg.includes("Can't reach database server") ||
                msg.includes("ECONNREFUSED") ||
                msg.includes("P1001") ||
                msg.includes("does not exist in the current database")
              ) {
                if (!fallbackActive) {
                  console.warn(
                    `⚠️ [Database] PostgreSQL is unreachable on localhost:5432. Automatically switching to local persistent storage (data/db.json) for seamless demonstration.`
                  );
                  fallbackActive = true;
                }
                return await (localDb as any)[modelName][prop](...args);
              }
              throw err;
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
      if (!fallbackActive && rawPrisma) {
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
