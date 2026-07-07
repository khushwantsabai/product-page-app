import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, payload } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  console.log("SHOP_REDACT payload:", payload);
  // 48 hours after a store uninstalls your app, Shopify sends this webhook.
  // Perform cleanup here (e.g., delete store data from database).
  return new Response("OK", { status: 200 });
};
