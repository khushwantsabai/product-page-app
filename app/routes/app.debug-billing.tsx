import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Frame, Card, Text, BlockStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  
  let result = null;
  let errorMsg = null;
  
  try {
    const response = await admin.graphql(`
      mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean) {
        appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test: $test) {
          userErrors {
            field
            message
          }
          appSubscription {
            id
            status
          }
          confirmationUrl
        }
      }
    `,
    {
      variables: {
        name: "Test Debug Plan",
        returnUrl: `https://${session.shop}/admin/apps/${process.env.SHOPIFY_API_KEY}/app/plans`,
        test: true,
        lineItems: [{
          plan: {
            appRecurringPricingDetails: {
              price: { amount: 10.0, currencyCode: "USD" }
            }
          }
        }]
      }
    });

    result = await response.json();
  } catch (err: any) {
    if (err instanceof Response) {
      errorMsg = await err.text();
    } else {
      errorMsg = String(err);
      if (err.response) {
        errorMsg += "\n\n" + JSON.stringify(err.response, null, 2);
      }
    }
  }

  return json({ result, errorMsg });
};

export default function DebugBilling() {
  const { result, errorMsg } = useLoaderData<typeof loader>();

  return (
    <Frame>
      <Page title="Debug Billing API">
        <BlockStack gap="400">
          <Card>
            <Text as="h2" variant="headingMd">Direct GraphQL Result</Text>
            <pre style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: "12px", marginTop: "12px" }}>
              {result ? JSON.stringify(result, null, 2) : "No result"}
            </pre>
          </Card>
          
          <Card>
            <Text as="h2" variant="headingMd">Caught Errors (if any)</Text>
            <pre style={{ whiteSpace: "pre-wrap", background: "#fee", padding: "12px", marginTop: "12px", color: "red" }}>
              {errorMsg ? errorMsg : "No thrown errors"}
            </pre>
          </Card>
        </BlockStack>
      </Page>
    </Frame>
  );
}
