import { BillingInterval } from "@shopify/shopify-app-remix/server";

export const billingConfig: any = {
  "Basic": {
    amount: 19.0,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    trialDays: 7,
  },
  "Premium": {
    amount: 49.0,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    trialDays: 7,
  },
  "Enterprise": {
    amount: 99.0,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    trialDays: 7,
  },
};
