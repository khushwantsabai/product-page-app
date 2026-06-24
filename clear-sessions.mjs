import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.session.deleteMany();
  console.log('Deleted all sessions');
}
main().catch(console.error).finally(() => prisma.$disconnect());
