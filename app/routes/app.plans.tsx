import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { Page, Frame, Toast } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  let graphqlStatus = "pending";
  try {
    await admin.graphql(`{ shop { name } }`);
    graphqlStatus = "SUCCESS";
  } catch (error) {
    graphqlStatus = `FAILED: ${String(error)}`;
  }
  
  let activeSubscriptions: any[] = [];
  try {
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
    activeSubscriptions = responseJson.data?.app?.installation?.activeSubscriptions || [];
  } catch (error) {
    console.error("Failed to fetch active subscriptions in plans:", error);
  }
  
  const activeSub = activeSubscriptions.find((sub: any) => sub.status === "ACTIVE");
  
  let currentPlan = "Free";
  if (activeSub && activeSub.name) {
    if (activeSub.name.toLowerCase().includes("basic")) currentPlan = "Basic";
    if (activeSub.name.toLowerCase().includes("standard")) currentPlan = "Standard";
    if (activeSub.name.toLowerCase().includes("premium")) currentPlan = "Premium";
  }

  return json({ currentPlan, graphqlStatus });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session, billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const planName = formData.get("planName") as string;
  
  const host = session.shop; 
  // Construct the returnUrl dynamically using the API key to ensure correct routing
  const returnUrl = `https://${host}/admin/apps/${process.env.SHOPIFY_API_KEY}/app/templates`;

  try {
    await billing.require({
      plans: [planName as any],
      isTest: true,
      onFailure: async () => billing.request({
        plan: planName as any,
        isTest: true,
      }),
    });
    return json({ success: true });
  } catch (error: any) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error; // This is the redirect to Shopify's payment approval screen!
    }
    
    console.error("Failed to request billing via Shopify API. Full Error:", JSON.stringify(error, null, 2));
    if (error?.response?.errors) {
       console.error("GraphQL Errors:", JSON.stringify(error.response.errors, null, 2));
    }
    
    let errorDetails = error.message || String(error);
    if (error?.response?.errors) {
       errorDetails += ` | GraphQL Error: ${JSON.stringify(error.response.errors)}`;
    }
    if (error instanceof Response) {
      errorDetails = `HTTP ${error.status} ${error.statusText}`;
      try {
        const text = await error.clone().text();
        errorDetails += ` | ${text}`;
      } catch (e) {}
    }
    return json({ error: `API blocked: ${errorDetails}` });
  }
};

const PLANS = [
  {
    name: "Free",
    price: 0,
    subtitle: "Perfect for getting started",
    color: "#111827",
    borderColor: "#E5E7EB",
    btnBg: "#FFFFFF",
    btnText: "#111827",
    btnBorder: "#E5E7EB",
    features: ["Free Templates", "Basic Features", "Edit Product Text Only", "Responsive Design"],
  },
  {
    name: "Basic",
    price: 39,
    subtitle: "Best for small stores",
    color: "#16A34A",
    borderColor: "#16A34A",
    btnBg: "#16A34A",
    btnText: "#FFFFFF",
    btnBorder: "#16A34A",
    features: ["Free, Basic Templates", "2 Template Types", "Advanced Customization", "Image & Color Control", "Priority Support"],
  },
  {
    name: "Standard",
    price: 69,
    subtitle: "Best for growing stores",
    color: "#8B5CF6",
    borderColor: "#8B5CF6",
    btnBg: "#8B5CF6",
    btnText: "#FFFFFF",
    btnBorder: "#8B5CF6",
    features: ["Free, Basic, Standard Templates", "Advanced Styling", "Reviews & Ratings", "Delivery & Stock Info", "Premium Support"],
  },
  {
    name: "Premium",
    price: 99,
    subtitle: "Best for high volume stores",
    color: "#F59E0B",
    borderColor: "#F59E0B",
    btnBg: "#F59E0B",
    btnText: "#FFFFFF",
    btnBorder: "#F59E0B",
    features: ["Unlimited Templates", "Video & 360 Gallery", "Volume Discounts", "All Customization Features", "24/7 Priority Support"],
    bestValue: true
  }
];

export default function Plans() {
  const { currentPlan, graphqlStatus } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as { confirmationUrl?: string; error?: string } | undefined;
  const submit = useSubmit();
  const navigation = useNavigation();

  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Yearly">("Monthly");

  useEffect(() => {
    if (actionData?.confirmationUrl) {
      // Redirect to Shopify approval screen
      window.open(actionData.confirmationUrl, "_top");
    } else if (actionData?.error) {
       setActiveToast(actionData.error);
    }
  }, [actionData]);

  // Check URL hash or query params for successful activation callback if redirected here
  useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     if (params.get('charge_id')) {
        setActiveToast("Plan activated successfully!");
     }
  }, []);

  const handleSelectPlan = (planName: string, planPrice: number) => {
    const finalPrice = billingCycle === "Yearly" ? (planPrice * 0.8).toFixed(2) : planPrice.toString();
    const formData = new FormData();
    formData.append("planName", planName + (billingCycle === "Yearly" ? " (Yearly)" : ""));
    formData.append("planPrice", finalPrice);
    submit(formData, { method: "post" });
  };

  const isLoading = navigation.state === "submitting" || navigation.state === "loading";

  return (
    <Frame>
      <Page fullWidth backAction={{content: 'Dashboard', url: '/app'}}>
        <div style={{ marginBottom: "20px", padding: "10px", background: "#fff3cd", color: "#856404", borderRadius: "4px" }}>
          <strong>Diagnostic Info:</strong> Token Status = {graphqlStatus}
        </div>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 0' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>Choose Your Plan</h1>
            
            <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <button
                onClick={() => setBillingCycle("Monthly")}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: billingCycle === "Monthly" ? '#ECFDF5' : 'transparent',
                  color: billingCycle === "Monthly" ? '#10B981' : '#6B7280',
                  fontWeight: billingCycle === "Monthly" ? 600 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("Yearly")}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: billingCycle === "Yearly" ? '#ECFDF5' : 'transparent',
                  color: billingCycle === "Yearly" ? '#10B981' : '#6B7280',
                  fontWeight: billingCycle === "Yearly" ? 600 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', alignItems: 'stretch' }}>
            {PLANS.map((plan) => (
              <div 
                key={plan.name} 
                style={{
                  position: 'relative',
                  border: `2px solid ${plan.borderColor}`,
                  borderRadius: '12px',
                  padding: '32px 24px',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: plan.bestValue ? '0 10px 25px -5px rgba(245, 158, 11, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s',
                }}
              >
                {plan.bestValue && (
                  <div style={{
                    position: 'absolute',
                    top: '-14px',
                    right: '24px',
                    background: plan.color,
                    color: '#FFFFFF',
                    padding: '4px 16px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    Best Value
                  </div>
                )}
                
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: plan.color, margin: '0 0 12px 0' }}>{plan.name}</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '42px', fontWeight: 800, color: '#111827', lineHeight: '1' }}>
                    ${billingCycle === "Yearly" && plan.price > 0 ? (plan.price * 12 * 0.8).toFixed(0) : plan.price}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    {billingCycle === "Yearly" ? "/year" : "/month"}
                  </span>
                </div>
                
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 32px 0' }}>{plan.subtitle}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, marginBottom: '32px' }}>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                        <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontSize: '14px', color: '#4B5563' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.name, plan.price)}
                  disabled={currentPlan === plan.name || isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${plan.btnBorder}`,
                    background: plan.btnBg,
                    color: plan.btnText,
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: (currentPlan === plan.name || isLoading) ? 'default' : 'pointer',
                    opacity: (currentPlan === plan.name || isLoading) ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {currentPlan === plan.name ? "Current Plan" : plan.name === "Free" ? "Choose Free" : (PLANS.findIndex(p => p.name === currentPlan) > PLANS.findIndex(p => p.name === plan.name) ? `Switch to ${plan.name}` : `Upgrade to ${plan.name}`)}
                </button>
              </div>
            ))}
          </div>

        </div>
      </Page>
      
      {activeToast && (
         <Toast content={activeToast} onDismiss={() => setActiveToast(null)} duration={4000} />
      )}
    </Frame>
  );
}
