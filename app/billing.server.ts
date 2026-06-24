import { BillingInterval, BillingReplacementBehavior } from "@shopify/shopify-app-remix/server";

export const BASIC_PLAN = "Basic";
export const STANDARD_PLAN = "Standard";
export const PREMIUM_PLAN = "Premium";

export const BASIC_PLAN_ANNUAL = "Basic (Yearly)";
export const STANDARD_PLAN_ANNUAL = "Standard (Yearly)";
export const PREMIUM_PLAN_ANNUAL = "Premium (Yearly)";

export const billingConfig: any = {
  [BASIC_PLAN]: {
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    lineItems: [
      {
        amount: 39.0,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      },
    ],
    trialDays: 7,
  },
  [BASIC_PLAN_ANNUAL]: {
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    lineItems: [
      {
        amount: 374.4,
        currencyCode: "USD",
        interval: BillingInterval.Annual,
      },
    ],
    trialDays: 7,
  },
  [STANDARD_PLAN]: {
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    lineItems: [
      {
        amount: 69.0,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      },
    ],
    trialDays: 7,
  },
  [STANDARD_PLAN_ANNUAL]: {
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    lineItems: [
      {
        amount: 662.4,
        currencyCode: "USD",
        interval: BillingInterval.Annual,
      },
    ],
    trialDays: 7,
  },
  [PREMIUM_PLAN]: {
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    lineItems: [
      {
        amount: 99.0,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      },
    ],
    trialDays: 7,
  },
  [PREMIUM_PLAN_ANNUAL]: {
    replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
    lineItems: [
      {
        amount: 950.4,
        currencyCode: "USD",
        interval: BillingInterval.Annual,
      },
    ],
    trialDays: 7,
  },
};
