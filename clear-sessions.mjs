import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all stale sessions...');
  const result = await prisma.session.deleteMany({});
  console.log(`Successfully deleted ${result.count} stale sessions from the database.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
