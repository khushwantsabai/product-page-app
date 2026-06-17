import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Banner,
  DataTable,
  Box,
  Divider,
  Grid
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // Dummy data for skeleton layout until db is connected
  return json({
    merchantPlan: "Free",
    pagesCreated: 3,
    pagesPublished: 1,
    pageLimit: 5,
    recentPages: [
      ["Summer Sale", "Basic Template", "Published", "2026-11-20"],
      ["Holiday Gift Guide", "Premium Template", "Draft", "2026-11-18"],
      ["New Arrivals", "Free Template", "Published", "2026-11-15"],
    ],
  });
};

export default function Dashboard() {
  const { merchantPlan, pagesCreated, pagesPublished, pageLimit, recentPages } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page fullWidth>
      <BlockStack gap="500">
        
        {/* Hero Banner */}
        <Box padding="800" background="bg-surface-brand" borderRadius="200">
          <BlockStack inlineAlign="center" gap="400">
            <Text as="h1" variant="heading3xl" tone="text-inverse">
              Build stunning product pages that convert — no code needed.
            </Text>
            <Button size="large" variant="primary" onClick={() => navigate("/app/templates")}>
              Create New Page
            </Button>
          </BlockStack>
        </Box>

        {/* Current Plan Badge Row */}
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="300" blockAlign="center">
            <Text as="h2" variant="headingLg">Current Plan:</Text>
            <Badge tone="info">{merchantPlan}</Badge>
          </InlineStack>
        </InlineStack>

        {merchantPlan === "Free" && (
          <Banner title="You're on the Free plan. Upgrade to unlock more templates and customization." tone="info" />
        )}

        {/* Stats Row */}
        <Grid columns={{ sm: 1, md: 3 }}>
          <Grid.Cell>
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">Total pages created</Text>
                <Text as="p" variant="heading3xl">{pagesCreated}</Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell>
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">Pages currently published</Text>
                <Text as="p" variant="heading3xl">{pagesPublished}</Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell>
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">Remaining pages allowed</Text>
                <Text as="p" variant="heading3xl">{pageLimit === -1 ? 'Unlimited' : `${pagesCreated} of ${pageLimit} used`}</Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
        </Grid>

        <Divider />

        {/* Plan Selection Section */}
        <BlockStack gap="400">
          <Text as="h2" variant="headingLg">Available Plans</Text>
          <Grid columns={{ sm: 1, md: 2, lg: 4 }}>
             {/* Free Plan */}
             <Grid.Cell>
                <Card>
                   <BlockStack gap="400">
                      <Text as="h3" variant="headingLg">Free</Text>
                      <Text as="p" variant="heading2xl">$0<Text as="span" variant="bodyMd"> / month</Text></Text>
                      <BlockStack gap="200">
                        <Text as="p">• 1 Published Page</Text>
                        <Text as="p">• Basic Customization</Text>
                        <Text as="p">• 1 Template Available</Text>
                      </BlockStack>
                      <Button disabled={merchantPlan === "Free"} onClick={() => navigate('/app/plans')}>Current Plan</Button>
                   </BlockStack>
                </Card>
             </Grid.Cell>
             
             {/* Basic Plan */}
             <Grid.Cell>
                <Card>
                   <BlockStack gap="400">
                      <Text as="h3" variant="headingLg">Basic</Text>
                      <Text as="p" variant="heading2xl">$20<Text as="span" variant="bodyMd"> / month</Text></Text>
                      <BlockStack gap="200">
                        <Text as="p">• 5 Published Pages</Text>
                        <Text as="p">• Image Edits & Fonts</Text>
                        <Text as="p">• 3 Templates Available</Text>
                      </BlockStack>
                      <Button disabled={merchantPlan === "Basic"} onClick={() => navigate('/app/plans')}>Select Plan</Button>
                   </BlockStack>
                </Card>
             </Grid.Cell>

             {/* Standard Plan */}
             <Grid.Cell>
                <Card>
                   <BlockStack gap="400">
                      <Text as="h3" variant="headingLg">Standard</Text>
                      <Text as="p" variant="heading2xl">$35<Text as="span" variant="bodyMd"> / month</Text></Text>
                      <BlockStack gap="200">
                        <Text as="p">• 15 Published Pages</Text>
                        <Text as="p">• Advanced Styling</Text>
                        <Text as="p">• 5 Templates Available</Text>
                      </BlockStack>
                      <Button disabled={merchantPlan === "Standard"} onClick={() => navigate('/app/plans')}>Select Plan</Button>
                   </BlockStack>
                </Card>
             </Grid.Cell>

             {/* Premium Plan */}
             <Grid.Cell>
                <Card>
                   <BlockStack gap="400">
                      <InlineStack align="space-between">
                         <Text as="h3" variant="headingLg">Premium</Text>
                         <Badge tone="success">Best Value</Badge>
                      </InlineStack>
                      <Text as="p" variant="heading2xl">$60<Text as="span" variant="bodyMd"> / month</Text></Text>
                      <BlockStack gap="200">
                        <Text as="p">• Unlimited Pages</Text>
                        <Text as="p">• Global Controls & Video</Text>
                        <Text as="p">• A/B Testing & Analytics</Text>
                      </BlockStack>
                      <Button disabled={merchantPlan === "Premium"} variant="primary" onClick={() => navigate('/app/plans')}>Select Plan</Button>
                   </BlockStack>
                </Card>
             </Grid.Cell>
          </Grid>
        </BlockStack>

        <Divider />

        {/* Recent Pages Section */}
        <BlockStack gap="400">
          <Text as="h2" variant="headingLg">Recent Pages</Text>
          <Card padding="0">
            <DataTable
              columnContentTypes={["text", "text", "text", "text", "text"]}
              headings={["Page Name", "Template", "Status", "Last Edited", "Action"]}
              rows={recentPages.map((row) => [
                ...row,
                 <Button size="micro" onClick={() => navigate(`/app/editor/${row[0]}`)}>Edit</Button>
              ])}
            />
          </Card>
        </BlockStack>

      </BlockStack>
    </Page>
  );
}
