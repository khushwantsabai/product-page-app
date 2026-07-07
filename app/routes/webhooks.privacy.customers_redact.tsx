import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, payload } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  console.log("CUSTOMERS_REDACT payload:", payload);
  // Perform customer data deletion here
  return new Response("OK", { status: 200 });
};
