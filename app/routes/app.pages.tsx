import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData, useNavigate, Form } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { TEMPLATE_MOCKS } from "./app.editor.$id";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Fetch active plan
  const response = await admin.graphql(`
    query {
      app {
        installation {
          activeSubscriptions {
            name
            status
          }
        }
      }
    }
  `);
  const responseJson = await response.json();
  const activeSubscriptions = responseJson.data?.app?.installation?.activeSubscriptions || [];
  const activeSub = activeSubscriptions.find((sub: any) => sub.status === "ACTIVE");

  let activePlan = "free";
  if (activeSub?.name) {
    if (activeSub.name.toLowerCase().includes("basic")) activePlan = "basic";
    if (activeSub.name.toLowerCase().includes("standard")) activePlan = "standard";
    if (activeSub.name.toLowerCase().includes("premium")) activePlan = "premium";
  }

  return json({ activePlan, shop: session.shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, redirect } = await authenticate.admin(request);
  const formData = await request.formData();
  const templateId = String(formData.get("templateId"));
  const templateName = String(formData.get("templateName"));
  const actionType = String(formData.get("actionType"));

  if (actionType === "edit") {
    // Just redirect to editor, don't create DB record yet
    return redirect(`/app/editor/new?templateId=${encodeURIComponent(templateId)}&templateName=${encodeURIComponent(templateName)}`);
  }

  if (actionType === "publish") {
    // Load mock data for the template so it's not empty when published
    const defaultSettings = TEMPLATE_MOCKS[templateId] || TEMPLATE_MOCKS['1'] || {};

    await prisma.productPage.create({
      data: {
        shopId: session.shop,
        templateId,
        planId: "free",
        name: `Untitled ${templateName}`,
        status: "Published",
        settings: JSON.stringify(defaultSettings),
      },
    });

    // Redirect to dashboard with a success message (could use toast via session, but simple redirect works)
    return redirect(`/app?published=true`);
  }

  return null;
};

const PLAN_LEVELS: Record<string, number> = { free: 0, basic: 1, standard: 2, premium: 3 };

const TEMPLATES = [
  { id: "1", name: "Minimal Clean",       plan: "Free",     brand: "free",     emoji: "🪴", desc: "Clean, minimal layout for any product." },
  { id: "2", name: "Modern Electronics",  plan: "Basic",    brand: "basic",    emoji: "💻", desc: "Bold stacked layout for tech products." },
  { id: "5", name: "Fashion Store",       plan: "Basic",    brand: "basic",    emoji: "👗", desc: "Stylish layout for clothing & fashion." },
  { id: "3", name: "Luxury Watch",        plan: "Standard", brand: "standard", emoji: "⌚", desc: "Elegant split-layout for premium goods." },
  { id: "6", name: "Sporty Shoes",        plan: "Standard", brand: "standard", emoji: "👟", desc: "Dynamic layout for sports & footwear." },
  { id: "4", name: "Beauty Glow",         plan: "Premium",  brand: "premium",  emoji: "✨", desc: "Rich visual layout for beauty brands." },
];

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  free:     { bg: "#F3F4F6", color: "#374151" },
  basic:    { bg: "#D1FAE5", color: "#065F46" },
  standard: { bg: "#EDE9FE", color: "#5B21B6" },
  premium:  { bg: "#FEF3C7", color: "#92400E" },
};

export default function Pages() {
  const { activePlan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#FAFAFA", minHeight: "100vh", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
        <button
          onClick={() => navigate("/app")}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "#6B7280", fontSize: "14px", fontWeight: 500 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>
      </div>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>Choose a Template</h1>
      <p style={{ fontSize: "15px", color: "#6B7280", marginBottom: "32px" }}>
        Select a template to open the editor. Save as draft or publish directly.
      </p>

      {/* Template Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {TEMPLATES.map((tpl) => {
          const locked = PLAN_LEVELS[tpl.brand] > PLAN_LEVELS[activePlan];
          const badge = BADGE_COLORS[tpl.brand];
          return (
            <div
              key={tpl.id}
              style={{
                background: "white",
                borderRadius: "14px",
                border: locked ? "1px solid #E5E7EB" : "1px solid #D1FAE5",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                opacity: locked ? 0.75 : 1,
                transition: "box-shadow 0.2s",
              }}
            >
              {/* Icon + Plan badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "36px" }}>{tpl.emoji}</span>
                <span style={{ background: badge.bg, color: badge.color, fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px" }}>
                  {tpl.plan}
                </span>
              </div>

              {/* Name + desc */}
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>{tpl.name}</h3>
                <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>{tpl.desc}</p>
              </div>

              {/* Actions */}
              {locked ? (
                <button
                  onClick={() => navigate("/app/plans")}
                  style={{ marginTop: "auto", padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#9CA3AF", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  🔒 Upgrade to {tpl.plan}
                </button>
              ) : (
                <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                  {/* Edit (Save as Draft) */}
                  <Form method="post" style={{ flex: 1 }}>
                    <input type="hidden" name="templateId" value={tpl.id} />
                    <input type="hidden" name="templateName" value={tpl.name} />
                    <input type="hidden" name="actionType" value="edit" />
                    <button
                      type="submit"
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", background: "white", color: "#374151", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
                    >
                      ✏️ Edit
                    </button>
                  </Form>

                  {/* Publish directly */}
                  <Form method="post" style={{ flex: 1 }}>
                    <input type="hidden" name="templateId" value={tpl.id} />
                    <input type="hidden" name="templateName" value={tpl.name} />
                    <input type="hidden" name="actionType" value="publish" />
                    <button
                      type="submit"
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "#16A34A", color: "white", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
                    >
                      🚀 Publish
                    </button>
                  </Form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
