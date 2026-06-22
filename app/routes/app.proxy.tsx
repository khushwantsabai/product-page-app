import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server"; // eslint-disable-line

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // authenticate.public.appProxy securely validates the request came from Shopify
  const { session } = await authenticate.public.appProxy(request);
  
  const url = new URL(request.url);
  const pageId = url.searchParams.get("pageId");

  if (!pageId) {
    return json({ error: "Missing pageId" }, { status: 400 });
  }

  try {
    const page = await prisma.productPage.findUnique({
      where: { id: pageId, shopId: session.shop },
    });

    if (!page) {
      return json({ html: `<p style="padding: 20px; text-align: center; border: 1px dashed #ccc;">Product Page (ID: ${pageId}) not found or unpublished.</p>` });
    }

    // Try parsing settings, otherwise fallback
    let settingsObj: any = {};
    try {
      settingsObj = JSON.parse(page.settings as string);
    } catch(e) {}

    const title = settingsObj.title || page.name;
    const desc = settingsObj.description || "No description set in builder.";

    return json({
      html: `
        <div style="font-family: inherit; margin: 2rem 0; padding: 2rem; background: #fafafa; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="margin-top: 0; font-size: 1.5rem; color: #111827;">${title}</h2>
          <p style="color: #4B5563; line-height: 1.6;">${desc}</p>
          <div style="margin-top: 24px;">
            <p style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; font-weight: bold;">(App Proxy Rendered Successfully)</p>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error("Error fetching product page:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
