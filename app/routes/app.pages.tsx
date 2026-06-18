import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  Box,
  Divider,
  InlineStack,
  Badge,
  Frame,
  Toast,
  IndexTable,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useState, useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  const pages = await prisma.productPage.findMany({
    where: { shopId: session.shop },
    orderBy: { updatedAt: "desc" }
  });

  return json({
    pages: pages.map(p => ({
      id: p.id,
      name: p.name,
      templateId: p.templateId,
      status: p.status,
      updatedAt: p.updatedAt.toISOString(),
    }))
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  const pageId = formData.get("pageId") as string;

  if (actionType === "delete") {
    await prisma.productPage.delete({
      where: { id: pageId, shopId: session.shop }
    });
    return json({ success: true, message: "Page deleted successfully!" });
  } else if (actionType === "toggle-status") {
    const page = await prisma.productPage.findUnique({
      where: { id: pageId, shopId: session.shop }
    });
    if (!page) return json({ error: "Page not found" }, { status: 404 });
    const newStatus = page.status === "Published" ? "Draft" : "Published";
    
    await prisma.productPage.update({
      where: { id: pageId },
      data: { status: newStatus }
    });
    
    return json({ success: true, message: `Page status updated to ${newStatus}!` });
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

const TEMPLATE_NAMES: Record<string, string> = {
  "1": "Minimal Clean",
  "2": "Modern Electronics",
  "3": "Luxury Watch",
  "4": "Beauty Glow",
  "5": "Fashion Store",
  "6": "Sporty Shoes",
};

export default function Pages() {
  const { pages } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as { success?: boolean; error?: string; message?: string } | undefined;
  const navigate = useNavigate();
  const submit = useSubmit();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (actionData?.success && actionData?.message) {
      setToastMessage(actionData.message);
    } else if (actionData?.error) {
      setToastMessage(actionData.error);
    }
  }, [actionData]);

  const handleToggleStatus = (pageId: string) => {
    const formData = new FormData();
    formData.append("actionType", "toggle-status");
    formData.append("pageId", pageId);
    submit(formData, { method: "post" });
  };

  const handleDelete = (pageId: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      const formData = new FormData();
      formData.append("actionType", "delete");
      formData.append("pageId", pageId);
      submit(formData, { method: "post" });
    }
  };

  const resourceName = {
    singular: 'custom product page',
    plural: 'custom product pages',
  };

  const rowMarkup = pages.map(
    ({ id, name, templateId, status, updatedAt }, index) => {
      const templateName = TEMPLATE_NAMES[templateId] || "Custom Layout";
      const isPublished = status === "Published";
      
      return (
        <IndexTable.Row
          id={id}
          key={id}
          position={index}
        >
          <IndexTable.Cell>
            <div style={{ padding: '12px 6px' }}>
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {name || "Untitled Page"}
              </Text>
            </div>
          </IndexTable.Cell>
          <IndexTable.Cell>{templateName}</IndexTable.Cell>
          <IndexTable.Cell>
            <Badge tone={isPublished ? "success" : "attention"}>
              {status}
            </Badge>
          </IndexTable.Cell>
          <IndexTable.Cell>
            {new Date(updatedAt).toLocaleDateString()} {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </IndexTable.Cell>
          <IndexTable.Cell>
            <InlineStack gap="200" align="end">
              <Button onClick={() => navigate(`/app/editor/${id}`)} variant="secondary" size="slim">
                Edit
              </Button>
              <Button 
                onClick={() => handleToggleStatus(id)} 
                variant="secondary" 
                size="slim"
                tone={isPublished ? "critical" : "success"}
              >
                {isPublished ? "Unpublish" : "Publish"}
              </Button>
              <Button onClick={() => handleDelete(id)} variant="plain" tone="critical" size="slim">
                Delete
              </Button>
            </InlineStack>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  return (
    <Frame>
      <Page 
        title="Customize Product Pages" 
        backAction={{ content: 'Dashboard', url: '/app' }}
        primaryAction={{
          content: 'Create Page from Template',
          onAction: () => navigate('/app/templates'),
        }}
      >
        <Layout>
          <Layout.Section>
            {pages.length === 0 ? (
              <Card>
                <Box padding="800">
                  <BlockStack gap="400" align="center">
                    <div style={{ fontSize: "56px", textAlign: "center" }}>🎨</div>
                    <Text as="h2" variant="headingLg" alignment="center">No Custom Pages Created Yet</Text>
                    <Text as="p" tone="subdued" alignment="center">
                      Create beautiful, high-converting product pages using our responsive templates and drag-and-drop elements.
                    </Text>
                    <Box paddingBlockStart="200" style={{ display: 'flex', justifyContent: 'center' }}>
                      <Button variant="primary" onClick={() => navigate('/app/templates')}>
                        Browse Templates
                      </Button>
                    </Box>
                  </BlockStack>
                </Box>
              </Card>
            ) : (
              <Card padding="0">
                <IndexTable
                  resourceName={resourceName}
                  itemCount={pages.length}
                  headings={[
                    { title: 'Page Name' },
                    { title: 'Base Template' },
                    { title: 'Status' },
                    { title: 'Last Updated' },
                    { title: 'Actions', alignment: 'end' },
                  ]}
                  selectable={false}
                >
                  {rowMarkup}
                </IndexTable>
              </Card>
            )}
          </Layout.Section>
        </Layout>
      </Page>
      {toastMessage && (
        <Toast content={toastMessage} onDismiss={() => setToastMessage(null)} duration={4000} />
      )}
    </Frame>
  );
}
