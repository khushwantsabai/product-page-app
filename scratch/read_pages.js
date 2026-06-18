import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const pages = await prisma.productPage.findMany();
  console.log("PAGES:", JSON.stringify(pages, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
