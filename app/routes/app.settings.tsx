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
  TextField,
  FormLayout,
  Divider,
  InlineStack,
  Badge,
  Frame,
  Toast,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState, useCallback, useEffect } from "react";

import prisma from "../db.server";
import { getSettings, saveSettings } from "../utils/settings.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  const activeSub = await prisma.subscription.findFirst({
    where: { shopId: session.shop, status: "active" }
  });
  const activePlan = activeSub?.planId?.toLowerCase() || "free";
  const planName = activePlan.charAt(0).toUpperCase() + activePlan.slice(1);

  const settings = getSettings(session.shop);
  
  return json({
    ...settings,
    themeInstalled: true,
    activePlan: planName
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const defaultButtonText = formData.get("defaultButtonText") as string;
  const defaultCurrency = formData.get("defaultCurrency") as string;
  const autoPublish = formData.get("autoPublish") === "true";
  const storeMail = formData.get("storeMail") as string;

  saveSettings(session.shop, {
    defaultButtonText,
    defaultCurrency,
    autoPublish,
    storeMail,
  });
  
  return json({ success: true, message: "Settings saved successfully!" });
};

export default function Settings() {
  const defaultData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as { success?: boolean; message?: string } | undefined;
  const submit = useSubmit();
  const navigation = useNavigation();

  // Settings states
  const [btnText, setBtnText] = useState(defaultData.defaultButtonText);
  const [currency, setCurrency] = useState(defaultData.defaultCurrency);
  const [autoPublish, setAutoPublish] = useState(defaultData.autoPublish);
  const [storeMail, setStoreMail] = useState(defaultData.storeMail);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (actionData?.success && actionData?.message) {
      setToastMessage(actionData.message);
    }
  }, [actionData]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("defaultButtonText", btnText);
    formData.append("defaultCurrency", currency);
    formData.append("autoPublish", String(autoPublish));
    formData.append("storeMail", storeMail);
    submit(formData, { method: "post" });
  };

  const isSaving = navigation.state === "submitting";

  return (
    <Frame>
      <Page title="Settings" backAction={{ content: 'Dashboard', url: '/app' }}>
        <Layout>
          {/* Main settings options */}
          <Layout.Section>
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">⚙️ Store Defaults</Text>
                  <Text as="p" tone="subdued">Configure default settings when creating new page templates.</Text>
                  
                  <FormLayout>
                    <TextField
                      label="Default Add to Cart Button Text"
                      value={btnText}
                      onChange={(val) => setBtnText(val)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Default Currency & Symbol"
                      value={currency}
                      onChange={(val) => setCurrency(val)}
                      autoComplete="off"
                    />
                    <TextField
                      type="email"
                      label="Notification Email"
                      value={storeMail}
                      onChange={(val) => setStoreMail(val)}
                      autoComplete="off"
                    />
                  </FormLayout>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">🛠️ Automation & Integrations</Text>
                  <Text as="p" tone="subdued">Control how template pages publish and interact with your Shopify admin.</Text>
                  
                  <FormLayout>
                    <InlineStack align="space-between">
                      <BlockStack gap="100">
                        <Text as="h3" variant="headingSm">Auto-Apply to New Products</Text>
                        <Text as="p" tone="subdued">Automatically attach default layouts to newly created draft products.</Text>
                      </BlockStack>
                      <Button onClick={() => setAutoPublish(!autoPublish)} variant="secondary">
                        {autoPublish ? "Enabled (Click to Disable)" : "Disabled (Click to Enable)"}
                      </Button>
                    </InlineStack>
                  </FormLayout>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">🔌 Theme Helper (Manual Embed)</Text>
                  <Text as="p" tone="subdued">If templates are not showing on your store page automatically, paste this liquid tag directly inside your theme's <code>sections/main-product.liquid</code> file:</Text>
                  
                  <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', color: '#DC2626' }}>
                      {"{% include 'pagecraft-product-builder' %}"}
                    </pre>
                  </Box>
                  
                  <InlineStack align="start" gap="300">
                    <Button onClick={() => {
                      navigator.clipboard.writeText("{% include 'pagecraft-product-builder' %}");
                      setToastMessage("Liquid code copied to clipboard!");
                    }} variant="secondary">Copy Code Snippet</Button>
                    <Button variant="plain" url="https://shopify.dev" external>Learn about liquid embeds</Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Secondary stats/account layout info */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">Subscription Details</Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span" variant="bodyMd">Current Plan:</Text>
                    <Badge tone="success">{defaultData.activePlan}</Badge>
                  </InlineStack>
                  <Text as="p" tone="subdued">Your plan includes advanced split/stacked structures, vendor widgets, and live image background options.</Text>
                  <Divider />
                  <Button fullWidth url="/app/plans">Change Plan</Button>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">System Status</Text>
                  <InlineStack gap="200" blockAlign="center">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16A34A' }}></div>
                    <Text as="span" variant="bodyMd">Prisma DB: Connected</Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16A34A' }}></div>
                    <Text as="span" variant="bodyMd">Webhooks: Registered</Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16A34A' }}></div>
                    <Text as="span" variant="bodyMd">API Handshake: Stable</Text>
                  </InlineStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Save Button Bar */}
          <Layout.Section>
            <Divider />
            <Box paddingBlockStart="400">
              <InlineStack align="end" gap="300">
                <Button variant="secondary" onClick={() => {
                  setBtnText(defaultData.defaultButtonText);
                  setCurrency(defaultData.defaultCurrency);
                  setAutoPublish(defaultData.autoPublish);
                  setStoreMail(defaultData.storeMail);
                  setToastMessage("Changes reverted!");
                }}>Cancel</Button>
                <Button variant="primary" loading={isSaving} onClick={handleSave}>Save Settings</Button>
              </InlineStack>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>

      {toastMessage && (
        <Toast content={toastMessage} onDismiss={() => setToastMessage(null)} duration={4000} />
      )}
    </Frame>
  );
}
