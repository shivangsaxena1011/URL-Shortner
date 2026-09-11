import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting development database seeding...");

  // Clean up existing demo data if any
  await prisma.click.deleteMany();
  await prisma.url.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await bcrypt.hash("demo123456", 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo Student",
      email: "demo@college.edu",
      passwordHash,
    },
  });

  console.log(`👤 Created Demo User: ${demoUser.email} (Password: demo123456)`);

  const now = new Date();

  // URL 1: Tech Portfolio with Custom Alias and Rich Analytics
  const url1 = await prisma.url.create({
    data: {
      userId: demoUser.id,
      originalUrl: "https://github.com/topics/nextjs",
      shortCode: "tech24",
      customAlias: "portfolio",
      clickCount: 18,
      isActive: true,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // URL 2: College Portal (Random short code, active)
  const url2 = await prisma.url.create({
    data: {
      userId: demoUser.id,
      originalUrl: "https://en.wikipedia.org/wiki/Computer_science",
      shortCode: "csProj",
      clickCount: 9,
      isActive: true,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // URL 3: Expired link for demoing expiration error
  const url3 = await prisma.url.create({
    data: {
      userId: demoUser.id,
      originalUrl: "https://news.ycombinator.com",
      shortCode: "expiredEx",
      customAlias: "hackernews-old",
      clickCount: 4,
      isActive: true,
      expiresAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // expired 1 day ago
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  // Seed realistic clicks for URL 1
  const referrers = ["Direct", "Google", "GitHub", "X (Twitter)", "LinkedIn", "Reddit"];
  const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
  const devices = ["desktop", "desktop", "mobile", "desktop", "mobile", "tablet"];
  const osList = ["Windows", "macOS", "iOS", "Android", "Linux"];
  const countries = ["US", "IN", "GB", "DE", "CA", "FR"];

  for (let i = 0; i < 18; i++) {
    const daysAgo = Math.floor(i / 3);
    const clickTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 + (i * 3600000));
    await prisma.click.create({
      data: {
        urlId: url1.id,
        timestamp: clickTime,
        referrer: referrers[i % referrers.length],
        browser: browsers[i % browsers.length],
        device: devices[i % devices.length],
        operatingSystem: osList[i % osList.length],
        country: countries[i % countries.length],
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
  }

  // Seed clicks for URL 2
  for (let i = 0; i < 9; i++) {
    const daysAgo = Math.floor(i / 3);
    const clickTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 + (i * 7200000));
    await prisma.click.create({
      data: {
        urlId: url2.id,
        timestamp: clickTime,
        referrer: referrers[i % referrers.length],
        browser: browsers[i % browsers.length],
        device: devices[i % devices.length],
        operatingSystem: osList[i % osList.length],
        country: countries[i % countries.length],
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
    });
  }

  console.log("✅ Database seeding completed with 3 sample URLs and realistic clicks.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
