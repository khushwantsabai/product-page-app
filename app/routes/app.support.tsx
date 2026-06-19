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
  Select,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState, useCallback, useEffect } from "react";

import prisma from "../db.server";

const db = prisma as any;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const tickets = await db.supportTicket.findMany({
    where: { shopDomain: session.shop },
    orderBy: { createdAt: 'desc' },
  });
  return json({ tickets });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const subject = formData.get("subject") as string;
  const priority = formData.get("priority") as string;
  const description = formData.get("description") as string;

  if (!subject || !description) {
    return json({ error: "Please fill out all fields." }, { status: 400 });
  }

  const ticketId = `TKT-${Date.now().toString().slice(-6)}`;
  const ticketData = {
    id: ticketId,
    shopDomain: session.shop,
    email: (session as any).email || "support@mystore.com",
    subject,
    priority,
    description,
    status: "Open",
  };

  await db.supportTicket.create({ data: ticketData });

  return json({ success: true, message: `Support ticket ${ticketId} submitted successfully! We'll reply within 12 hours.` });
};

const FAQS = [
  {
    q: "How do I embed my customized product page templates?",
    a: "Templates created inside the editor are applied to your products automatically. If you want to insert them manually inside custom liquid theme templates, go to the Settings tab, copy the liquid code snippet, and paste it into sections/main-product.liquid."
  },
  {
    q: "Why are trust badges not displaying on my product listings?",
    a: "Trust badges and stock warning features require a Premium Subscription. Make sure you upgrade to a Premium plan on the plans page, and enable the elements inside the layout customization settings."
  },
  {
    q: "How many images can I add to my product galleries?",
    a: "Gallery size limits are plan-specific: Free allows only the main product image. Basic supports up to 3 additional gallery images. Standard allows up to 5 images. Premium supports up to 7 images and 1 embedded product video."
  },
  {
    q: "How do I customize layouts for mobile devices?",
    a: "The builder outputs fully responsive designs. The Side-by-Side (Split) structure is automatically collapsed into a stacked vertical format on small mobile screens to guarantee readability and a clean customer checkout flow."
  }
];

export default function Support() {
  const { tickets } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as { success?: boolean; error?: string; message?: string } | undefined;
  const submit = useSubmit();
  const navigation = useNavigation();

  // Support ticket form states
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [desc, setDesc] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // FAQ interactive state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (actionData?.success && actionData?.message) {
      setToastMessage(actionData.message);
      setSubject("");
      setDesc("");
    } else if (actionData?.error) {
      setToastMessage(actionData.error);
    }
  }, [actionData]);

  const handleSendTicket = () => {
    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("priority", priority);
    formData.append("description", desc);
    submit(formData, { method: "post" });
  };

  const isSubmitting = navigation.state === "submitting";

  return (
    <Frame>
      <Page title="Help & Support" backAction={{ content: 'Dashboard', url: '/app' }}>
        <Layout>
          {/* Main content support forum / ticket creator */}
          <Layout.Section>
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">✉️ Create a Support Ticket</Text>
                  <Text as="p" tone="subdued">Need assistance? Open a direct ticket with our support engineers and developers. We will reply to your registered merchant email address.</Text>
                  
                  <FormLayout>
                    <TextField
                      label="Subject"
                      value={subject}
                      onChange={(val) => setSubject(val)}
                      placeholder="e.g. Layout overflow issue on mobile"
                      autoComplete="off"
                    />
                    
                    <Select
                      label="Priority"
                      options={[
                        { label: 'Low - Questions / Feedback', value: 'Low' },
                        { label: 'Medium - Normal Issue / Bug', value: 'Medium' },
                        { label: 'High - Store checkout broken', value: 'High' }
                      ]}
                      value={priority}
                      onChange={(val) => setPriority(val)}
                    />

                    <TextField
                      label="Describe the issue"
                      value={desc}
                      onChange={(val) => setDesc(val)}
                      placeholder="Please details what happens and which templates/devices are affected..."
                      multiline={5}
                      autoComplete="off"
                    />

                    <Box paddingBlockStart="200">
                      <Button variant="primary" loading={isSubmitting} onClick={handleSendTicket}>Submit Ticket</Button>
                    </Box>
                  </FormLayout>
                </BlockStack>
              </Card>

              {/* FAQ Section */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">❓ Frequently Asked Questions</Text>
                  <Text as="p" tone="subdued">Check out solutions to general support topics before creating a ticket.</Text>
                  <Divider />
                  
                  <BlockStack gap="300">
                    {FAQS.map((faq, idx) => (
                      <div key={idx} style={{ 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '6px', 
                        padding: '12px 16px',
                        cursor: 'pointer',
                        background: activeFaq === idx ? '#F9FAFB' : 'white',
                        transition: 'all 0.15s ease'
                      }} onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}>
                        <InlineStack align="space-between">
                          <Text as="span" variant="bodyMd" fontWeight="semibold" tone={activeFaq === idx ? "success" : "base"}>
                            {faq.q}
                          </Text>
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                            {activeFaq === idx ? "▲" : "▼"}
                          </span>
                        </InlineStack>
                        {activeFaq === idx && (
                          <div style={{ marginTop: '10px', fontSize: '13px', lineHeight: '1.6', color: '#4B5563' }}>
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Sidebar with guides and status */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">


              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">Support SLA</Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone="success">Online</Badge>
                    <Text as="span" variant="bodySm">Avg response: &lt; 12 hours</Text>
                  </InlineStack>
                  <Text as="p" tone="subdued">Our customer engineers are active 24/7/365 to resolve blockages on theme layouts or subscriptions.</Text>
                </BlockStack>
              </Card>

              {tickets && tickets.length > 0 && (
                <Card>
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingMd">Your Support Tickets ({tickets.length})</Text>
                    <Divider />
                    <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                      <BlockStack gap="200">
                        {tickets.map((t: any) => (
                          <div key={t.id} style={{ padding: "10px", border: "1px solid #F3F4F6", borderRadius: "6px", background: "#F9FAFB" }}>
                            <InlineStack align="space-between">
                              <Text as="span" variant="bodySm" fontWeight="bold">{t.id}</Text>
                              <Badge tone={t.priority === "High" ? "critical" : t.priority === "Medium" ? "attention" : "info"}>{t.priority}</Badge>
                            </InlineStack>
                            <div style={{ marginTop: "4px" }}>
                              <Text as="p" variant="bodyMd" fontWeight="semibold">{t.subject}</Text>
                              <Text as="p" variant="bodySm" tone="subdued">{new Date(t.createdAt).toLocaleDateString()}</Text>
                            </div>
                          </div>
                        ))}
                      </BlockStack>
                    </div>
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>

      {toastMessage && (
        <Toast content={toastMessage} onDismiss={() => setToastMessage(null)} duration={4000} />
      )}
    </Frame>
  );
}
