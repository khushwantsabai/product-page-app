import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");

  if (!chargeId) {
    return redirect("/app/plans");
  }

  // Fetch the subscription details from Shopify to confirm it's active
  let subscription: any = null;
  try {
    const response = await admin.graphql(`
      query getSubscription($id: ID!) {
        node(id: $id) {
          ... on AppSubscription {
            id
            name
            status
            currentPeriodEnd
            trialDays
          }
        }
      }
    `, {
      variables: {
        id: `gid://shopify/AppSubscription/${chargeId}`
      }
    });

    const responseJson = await response.json();
    subscription = responseJson.data?.node;
  } catch (error) {
    console.error("Failed to fetch subscription details:", error);
  }

  if (subscription && subscription.status === "ACTIVE") {
    // Determine which plan this is based on the subscription name
    const planName = subscription.name.replace("Product Page ", "");
    
    // Check if plan exists in our DB, else create a dummy reference or skip
    // We'll update the shop's active plan in our database
    await prisma.shop.upsert({
      where: { shopDomain: session.shop },
      create: {
        shopDomain: session.shop,
        planId: planName,
      },
      update: {
        planId: planName,
      }
    });

    // Also update/create the subscription record
    await prisma.subscription.create({
      data: {
        shopId: session.shop,
        planId: planName,
        shopifyChargeId: chargeId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null,
      }
    });

    // Redirect back to plans page with a success parameter
    return redirect(`/app/plans?charge_id=${chargeId}&success=1`);
  }

  // If something went wrong or it's not active, just redirect to plans
  return redirect("/app/plans?error=activation_failed");
};
