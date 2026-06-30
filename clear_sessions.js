import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.session.deleteMany();
  console.log(`Deleted ${result.count} stale sessions.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
