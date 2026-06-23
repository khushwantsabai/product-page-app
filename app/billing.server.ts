import { BillingInterval } from "@shopify/shopify-app-remix/server";

// Plan name constants — exported so routes can reference them by name
export const BASIC_PLAN = "Basic";
export const STANDARD_PLAN = "Standard";
export const PREMIUM_PLAN = "Premium";

export const billingConfig: any = {
  [BASIC_PLAN]: {
    lineItems: [
      {
        amount: 19.0,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      },
    ],
    trialDays: 7,
  },
  [STANDARD_PLAN]: {
    lineItems: [
      {
        amount: 69.0,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      },
    ],
    trialDays: 7,
  },
  [PREMIUM_PLAN]: {
    lineItems: [
      {
        amount: 99.0,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      },
    ],
    trialDays: 7,
  },
};
