import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const session = await prisma.session.findFirst({
    where: { shop: 'product-plus-r9u3or2t.myshopify.com' }
  });
  
  const query = `
    mutation {
      appSubscriptionCreate(
        name: "Basic",
        returnUrl: "https://${session.shop}/admin/apps/06fec0d0f3013071adbb80cf7190b42b/app/plans",
        test: true,
        lineItems: [{
          plan: {
            appRecurringPricingDetails: {
              price: { amount: 39.0, currencyCode: USD },
              interval: EVERY_30_DAYS
            }
          }
        }]
      ) {
        userErrors { field message }
        confirmationUrl
      }
    }
  `;
  
  const res = await fetch(`https://${session.shop}/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': session.accessToken
    },
    body: JSON.stringify({ query })
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main().finally(() => prisma.$disconnect());
