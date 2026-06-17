import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  Box,
  List,
  Icon,
  InlineStack,
  Badge,
  Frame,
  Toast,
} from "@shopify/polaris";
import { CheckIcon, LockIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { useState, useCallback, useEffect } from "react";

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
    features: ["1 Published Page", "Basic Customization", "1 Template Available"],
    lockedFeatures: ["Image Edits & Fonts", "Advanced Styling", "Video Embeds", "A/B Testing & Analytics"]
  },
  {
    name: "Basic",
    price: 20,
    features: ["5 Published Pages", "Basic Customization", "Image Edits & Fonts", "3 Templates Available"],
    lockedFeatures: ["Advanced Styling", "Video Embeds", "A/B Testing & Analytics"]
  },
  {
    name: "Standard",
    price: 35,
    features: ["15 Published Pages", "Basic Customization", "Image Edits & Fonts", "Advanced Styling", "5 Templates Available"],
    lockedFeatures: ["Video Embeds", "A/B Testing & Analytics"]
  },
  {
    name: "Premium",
    price: 60,
    features: ["Unlimited Pages", "Basic Customization", "Image Edits & Fonts", "Advanced Styling", "Video Embeds", "A/B Testing & Analytics", "Priority Support"],
    lockedFeatures: [],
    bestValue: true
  }
];

export default function Plans() {
  const { currentPlan } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as { confirmationUrl?: string; error?: string } | undefined;
  const submit = useSubmit();
  const navigation = useNavigation();

  const [activeToast, setActiveToast] = useState<string | null>(null);

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
    const formData = new FormData();
    formData.append("planName", planName);
    formData.append("planPrice", planPrice.toString());
    submit(formData, { method: "post" });
  };

  const isLoading = navigation.state === "submitting" || navigation.state === "loading";

  return (
    <Frame>
      <Page title="Plan Selection & Billing" backAction={{content: 'Dashboard', url: '/app'}}>
        <Layout>
          {PLANS.map((plan) => (
            <Layout.Section variant="oneThird" key={plan.name}>
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                     <Text as="h3" variant="headingLg">{plan.name}</Text>
                     {plan.bestValue && <Badge tone="success">Best Value</Badge>}
                  </InlineStack>

                  <Text as="p" variant="heading3xl">
                    ${plan.price}
                    <Text as="span" variant="bodyLg" tone="subdued"> / month</Text>
                  </Text>

                  <List>
                    {plan.features.map((feature, idx) => (
                      <List.Item key={idx}>
                        <InlineStack gap="200" blockAlign="center">
                          <Icon source={CheckIcon} tone="success" />
                          <Text as="span" variant="bodyMd">{feature}</Text>
                        </InlineStack>
                      </List.Item>
                    ))}
                    {plan.lockedFeatures.map((feature, idx) => (
                      <List.Item key={`locked-${idx}`}>
                        <InlineStack gap="200" blockAlign="center">
                          <Icon source={LockIcon} tone="subdued" />
                          <Text as="span" variant="bodyMd" tone="subdued">{feature}</Text>
                        </InlineStack>
                      </List.Item>
                    ))}
                  </List>

                  <Box>
                    <Button 
                      fullWidth 
                      disabled={currentPlan === plan.name}
                      variant={plan.bestValue ? "primary" : "secondary"}
                      loading={isLoading}
                      onClick={() => handleSelectPlan(plan.name, plan.price)}
                    >
                      {currentPlan === plan.name ? "Current Plan" : plan.price > 0 ? "Start Free Trial" : "Select Plan"}
                    </Button>
                  </Box>
                </BlockStack>
              </Card>
            </Layout.Section>
          ))}
        </Layout>
      </Page>
      
      {activeToast && (
         <Toast content={activeToast} onDismiss={() => setActiveToast(null)} duration={4000} />
      )}
    </Frame>
  );
}
