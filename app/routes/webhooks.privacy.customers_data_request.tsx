import type { ActionFunctionArgs } from "@remix-run/node";
import crypto from "crypto";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");
  const bodyText = await request.text();

  const generatedHash = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET || "")
    .update(bodyText, "utf-8")
    .digest("base64");

  if (generatedHash !== hmacHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = JSON.parse(bodyText);
    console.log("CUSTOMERS_DATA_REQUEST payload:", payload);
    // Perform customer data extraction here
  } catch (error) {
    console.error("Error parsing payload", error);
  }

  return new Response("OK", { status: 200 });
};
