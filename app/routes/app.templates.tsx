import type { ActionFunctionArgs, LoaderFunctionArgs, LinksFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import templatesStyles from "../styles/templates.css?url";
import { authenticate } from "../shopify.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: templatesStyles }];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const templateId = String(formData.get("templateId"));
  const templateName = String(formData.get("templateName"));

  // Go directly to editor — DB record only created on Save/Publish
  return redirect(
    `/app/editor/new?templateId=${encodeURIComponent(templateId)}&templateName=${encodeURIComponent(templateName)}`
  );
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

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
  const activeSubscriptions =
    responseJson.data?.app?.installation?.activeSubscriptions || [];
  const activeSub = activeSubscriptions.find(
    (sub: any) => sub.status === "ACTIVE"
  );

  let activePlan = "free";
  if (activeSub?.name) {
    if (activeSub.name.toLowerCase().includes("basic")) activePlan = "basic";
    if (activeSub.name.toLowerCase().includes("standard")) activePlan = "standard";
    if (activeSub.name.toLowerCase().includes("premium")) activePlan = "premium";
  }

  return json({ activePlan });
};

const PLAN_LEVELS: Record<string, number> = {
  free: 0,
  basic: 1,
  standard: 2,
  premium: 3,
};

const TEMPLATES = [
  { id: "1", name: "Minimal Clean",       plan: "free",     label: "Free",     icon: "🪴" },
  { id: "2", name: "Modern Electronics",  plan: "basic",    label: "Basic",    icon: "💻" },
  { id: "5", name: "Fashion Store",       plan: "basic",    label: "Basic",    icon: "👗" },
  { id: "3", name: "Luxury Watch",        plan: "standard", label: "Standard", icon: "⌚" },
  { id: "6", name: "Sporty Shoes",        plan: "standard", label: "Standard", icon: "👟" },
  { id: "4", name: "Beauty Glow",         plan: "premium",  label: "Premium",  icon: "✨" },
];

const BADGE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  free:     { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
  basic:    { bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  standard: { bg: "#EDE9FE", color: "#5B21B6", border: "#DDD6FE" },
  premium:  { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
};

export default function Templates() {
  const { activePlan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="templates-container">
      {/* Header */}
      <div className="templates-header">
        <div>
          <h1 className="templates-title">Choose a Template</h1>
          <p className="templates-subtitle">
            Select a template below to open the editor and start customizing.
          </p>
        </div>
        <button className="templates-top-btn" onClick={() => navigate("/app")}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Template List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "720px" }}>
        {TEMPLATES.map((tpl) => {
          const badge = BADGE_COLORS[tpl.plan];
          const locked = PLAN_LEVELS[tpl.plan] > PLAN_LEVELS[activePlan];

          return (
            <div
              key={tpl.id}
              style={{
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                opacity: locked ? 0.65 : 1,
                transition: "box-shadow 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Left — icon + name */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: badge.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0,
                  }}
                >
                  {tpl.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "4px",
                    }}
                  >
                    {tpl.name}
                  </div>
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: "2px 10px",
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {tpl.label} Plan
                  </span>
                </div>
              </div>

              {/* Right — action button */}
              {locked ? (
                <button
                  type="button"
                  onClick={() => navigate("/app/plans")}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    background: "#F3F4F6",
                    color: "#6B7280",
                    border: "1px solid #E5E7EB",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  🔒 Upgrade
                </button>
              ) : (
                <Form method="post" style={{ margin: 0 }}>
                  <input type="hidden" name="templateId" value={tpl.id} />
                  <input type="hidden" name="templateName" value={tpl.name} />
                  <button
                    type="submit"
                    style={{
                      padding: "9px 24px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      background: "#16A34A",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLButtonElement).style.background = "#15803D")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLButtonElement).style.background = "#16A34A")
                    }
                  >
                    Edit Template →
                  </button>
                </Form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
