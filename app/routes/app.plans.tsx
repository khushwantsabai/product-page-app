import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { Page, Frame, Toast } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  // Here we would typically fetch the DB for `Subscription` or check `admin.billing`
  // For now, defaulting to Free.
  const currentPlan = "Free";

  return json({ currentPlan });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const planName = formData.get("planName") as string;
  const planPrice = formData.get("planPrice") as string;
  
  const host = session.shop; 
  // Normally the returnUrl should be dynamically constructed using the app's base URL.
  const returnUrl = `https://${host}/admin/apps/product-page/app/billing/callback`;

  // GraphQL Mutation for appSubscriptionCreate
  const response = await admin.graphql(`
    mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, trialDays: $trialDays) {
        userErrors {
          field
          message
        }
        confirmationUrl
        appSubscription {
          id
        }
      }
    }
  `, {
    variables: {
      name: `Product Page ${planName}`,
      returnUrl,
      trialDays: 7,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: { amount: parseFloat(planPrice), currencyCode: "USD" },
              interval: "EVERY_30_DAYS"
            }
          }
        }
      ]
    }
  });

  const responseJson = await response.json();
  const confirmationUrl = responseJson.data?.appSubscriptionCreate?.confirmationUrl;
  const userErrors = responseJson.data?.appSubscriptionCreate?.userErrors || [];

  if (userErrors.length > 0) {
    return json({ error: userErrors[0].message });
  }

  if (confirmationUrl) {
    return json({ confirmationUrl });
  }

  return json({ error: "Could not create subscription" });
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
    features: ["3 Free Templates", "Basic Features", "Edit Product Text Only", "Responsive Design"],
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
    features: ["15+ Premium Templates", "2 Template Types", "Advanced Customization", "Image & Color Control", "Priority Support"],
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
    features: ["35+ Premium Templates", "Advanced Styling", "Reviews & Ratings", "Delivery & Stock Info", "Premium Support"],
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
    features: ["Unlimited Templates", "Video & 360 Gallery", "Volume Discounts", "Related Products", "All Customization Features", "24/7 Priority Support"],
    bestValue: true
  }
];

export default function Plans() {
  const { currentPlan } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as { confirmationUrl?: string; error?: string } | undefined;
  const submit = useSubmit();
  const navigation = useNavigation();

  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Yearly">("Monthly");

  useEffect(() => {
    if (actionData?.confirmationUrl) {
      // Redirect to Shopify approval screen
      window.top?.location.assign(actionData.confirmationUrl);
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
                    ${billingCycle === "Yearly" && plan.price > 0 ? (plan.price * 0.8).toFixed(0) : plan.price}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>/month</span>
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
                    cursor: (currentPlan === plan.name || isLoading) ? 'not-allowed' : 'pointer',
                    opacity: (currentPlan === plan.name || isLoading) ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {currentPlan === plan.name ? "Current Plan" : plan.name === "Free" ? "Choose Free" : `Upgrade to ${plan.name}`}
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
