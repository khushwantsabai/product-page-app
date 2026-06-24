import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.session.findMany();
  console.log('Sessions:', sessions.map(s => ({
    shop: s.shop,
    accessToken: s.accessToken.substring(0, 10) + '...',
    expires: s.expires,
    scope: s.scope
  })));
}

main().finally(() => prisma.$disconnect());
