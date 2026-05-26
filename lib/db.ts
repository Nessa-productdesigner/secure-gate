import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaConnectionString: string | undefined;
};

/**
 * Prisma 7 uses the "client" engine which requires a driver adapter.
 * When DATABASE_URL is a prisma+postgres:// (Prisma Local Platform) URL,
 * we decode the embedded api_key to extract the underlying postgres:// URL
 * so the pg Pool can connect directly.
 */
function resolveConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  if (url.startsWith("prisma+postgres://")) {
    try {
      const parsed = new URL(url);
      const apiKey = parsed.searchParams.get("api_key");
      if (apiKey) {
        const decoded = Buffer.from(apiKey, "base64").toString("utf-8");
        const json = JSON.parse(decoded) as { databaseUrl?: string };
        if (json.databaseUrl) {
          return json.databaseUrl;
        }
      }
    } catch {
      // Fall through to returning the raw URL
    }
  }

  return url;
}

function createPrismaClient(connectionString: string): PrismaClient {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
  const connectionString = resolveConnectionString();

  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    globalForPrisma.prismaConnectionString !== connectionString
  ) {
    void globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient(connectionString);
    globalForPrisma.prismaConnectionString = connectionString;
  }

  return globalForPrisma.prisma;
}

export const db = getPrismaClient();
