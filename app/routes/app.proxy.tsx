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

  /* 
   * When the database is running, we can query it like this:
   * 
   * const pageVersion = await prisma.pageVersion.findFirst({
   *   where: { pageId: pageId },
   *   orderBy: { savedAt: 'desc' }
   * });
   * 
   * const html = renderSettingsToHtml(pageVersion.settings);
   * return json({ html });
   */

  // Placeholder Response for the Theme Extension
  return json({
    html: `
      <div style="font-family: inherit; margin: 2rem 0; padding: 2rem; background: #fafafa; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="margin-top: 0; font-size: 1.5rem;">Product Page Block: ${pageId}</h2>
        <p style="color: #444; line-height: 1.5;">This content is being securely injected from the Shopify App Proxy. Once the builder is complete, this block will render the dynamic layout designed in the React dashboard.</p>
        <button style="background: #202223; color: white; border: none; border-radius: 4px; padding: 0.75rem 1.5rem; font-weight: bold; cursor: pointer; margin-top: 1rem;">
          Dynamic Action
        </button>
      </div>
    `
  });
};
