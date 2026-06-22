import { useState } from "react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
  BlockStack,
  InlineStack,
  Box,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return json({ errors, polarisTranslations });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return json({
    errors,
  });
};

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <PolarisAppProvider i18n={loaderData.polarisTranslations}>
      <Page>
        <Box paddingBlockStart="1000" paddingBlockEnd="1000">
          <InlineStack align="center">
            <Box maxWidth="600px" width="100%">
              <BlockStack gap="800" inlineAlign="center">
                
                {/* Custom Theme Styles */}
                <style>{`
                  .Polaris-Button--toneSuccess {
                    background: #11a34a !important;
                    color: white !important;
                    border: none !important;
                  }
                  .Polaris-Button--toneSuccess:hover {
                    background: #0e8a3e !important;
                  }
                  body, html, .Polaris-Page {
                    background-color: #ffffff !important;
                  }
                `}</style>

                {/* Branding & Header */}
                <BlockStack gap="400" inlineAlign="center">
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <img src="/logo.png?v=4" alt="Pagecraft Builder" style={{ height: '140px', objectFit: 'contain' }} />
                  </div>
                  <Text variant="bodyLg" as="p" tone="subdued" alignment="center">
                    Design high-converting product pages effortlessly.
                  </Text>
                </BlockStack>

                {/* Login Card */}
                <Box minWidth="400px">
                  <Card>
                    <Box padding="500">
                      <Form method="post">
                        <FormLayout>
                          <BlockStack gap="400">
                            <Text variant="headingMd" as="h2" alignment="center">
                              Log in to your store
                            </Text>
                            <TextField
                              type="text"
                              name="shop"
                              label="Shop domain"
                              helpText="e.g: my-shop-domain.myshopify.com"
                              value={shop}
                              onChange={setShop}
                              autoComplete="on"
                              error={errors.shop}
                            />
                            <Button submit variant="primary" size="large" tone="success">
                              Log in
                            </Button>
                          </BlockStack>
                        </FormLayout>
                      </Form>
                    </Box>
                  </Card>
                </Box>

                {/* Features Section */}
                <Box paddingBlockStart="600">
                  <InlineStack align="space-evenly" gap="600">
                    <Box maxWidth="160px">
                      <BlockStack gap="200" inlineAlign="center">
                        <Text variant="headingSm" as="h3">Drag & Drop</Text>
                        <Text variant="bodySm" as="p" tone="subdued" alignment="center">
                          Build pages visually without any coding skills.
                        </Text>
                      </BlockStack>
                    </Box>
                    <Box maxWidth="160px">
                      <BlockStack gap="200" inlineAlign="center">
                        <Text variant="headingSm" as="h3">High Converting</Text>
                        <Text variant="bodySm" as="p" tone="subdued" alignment="center">
                          Optimized templates that drive more sales.
                        </Text>
                      </BlockStack>
                    </Box>
                    <Box maxWidth="160px">
                      <BlockStack gap="200" inlineAlign="center">
                        <Text variant="headingSm" as="h3">Lightning Fast</Text>
                        <Text variant="bodySm" as="p" tone="subdued" alignment="center">
                          Pages load instantly for the best user experience.
                        </Text>
                      </BlockStack>
                    </Box>
                  </InlineStack>
                </Box>

              </BlockStack>
            </Box>
          </InlineStack>
        </Box>
      </Page>
    </PolarisAppProvider>
  );
}
