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
  Modal,
  List,
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

  const settings = await getSettings(session.shop);
  
  return json({
    ...settings,
    themeInstalled: true,
    activePlan: planName,
    shopDomain: session.shop,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const actionType = formData.get("actionType");

  if (actionType === "editProfile") {
    const brandName = formData.get("brandName") as string;
    const category = formData.get("category") as string;
    await saveSettings(session.shop, { brandName, category });
    return json({ success: true, message: "Profile updated successfully!" });
  }

  if (actionType === "removeTemplates") {
    // Simulated template removal
    return json({ success: true, message: "Templates removed successfully!" });
  }
  
  return json({ success: false, message: "Unknown action" });
};

export default function Settings() {
  const defaultData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as { success?: boolean; message?: string } | undefined;
  const submit = useSubmit();
  const navigation = useNavigation();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [brandName, setBrandName] = useState(defaultData.brandName || "");
  const [category, setCategory] = useState(defaultData.category || "");

  useEffect(() => {
    if (actionData?.success && actionData?.message) {
      setToastMessage(actionData.message);
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
      }
    }
  }, [actionData, isEditModalOpen]);

  const handleSaveProfile = () => {
    const formData = new FormData();
    formData.append("actionType", "editProfile");
    formData.append("brandName", brandName);
    formData.append("category", category);
    submit(formData, { method: "post" });
  };

  const handleRemoveTemplates = () => {
    const formData = new FormData();
    formData.append("actionType", "removeTemplates");
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
                  <Text as="h2" variant="headingMd">Store Details</Text>
                  <List type="bullet">
                    <List.Item>Shop Domain: {defaultData.shopDomain}</List.Item>
                    <List.Item>Brand Name: {defaultData.brandName || "Not set"}</List.Item>
                    <List.Item>Category: {defaultData.category || "Not set"}</List.Item>
                  </List>
                  <Button fullWidth onClick={() => setIsEditModalOpen(true)}>Edit Profile</Button>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd" tone="critical">Reset Customizations</Text>
                  <Text as="p">This will remove all ShopFrame templates from your live theme.</Text>
                  <InlineStack>
                    <Button tone="critical" loading={isSaving && navigation.formData?.get("actionType") === "removeTemplates"} onClick={handleRemoveTemplates}>Remove Templates</Button>
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
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>

      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        primaryAction={{
          content: 'Save',
          onAction: handleSaveProfile,
          loading: isSaving && navigation.formData?.get("actionType") === "editProfile",
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsEditModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Brand Name"
              value={brandName}
              onChange={(val) => setBrandName(val)}
              autoComplete="off"
            />
            <TextField
              label="Category"
              value={category}
              onChange={(val) => setCategory(val)}
              autoComplete="off"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>

      {toastMessage && (
        <Toast content={toastMessage} onDismiss={() => setToastMessage(null)} duration={4000} />
      )}
    </Frame>
  );
}
