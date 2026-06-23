import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

let connectionString = process.env.DATABASE_URL || "";
try {
  // Strip out unsupported query parameters like channel_binding to prevent pg Pool crashes
  const url = new URL(connectionString);
  url.search = "?sslmode=require";
  connectionString = url.toString();
} catch (error) {
  // Ignore parsing errors
}

const adapter = new PrismaNeon({ connectionString });

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient({ adapter });
  }
}

const prisma = global.prismaGlobal ?? new PrismaClient({ adapter });

export default prisma;
