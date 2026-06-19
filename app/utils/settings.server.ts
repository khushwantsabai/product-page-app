import prisma from "../db.server";

export interface MerchantSettings {
  defaultButtonText: string;
  defaultCurrency: string;
  autoPublish: boolean;
  storeMail: string;
  brandName?: string;
  category?: string;
}

const DEFAULT_SETTINGS: MerchantSettings = {
  defaultButtonText: "Add to Cart",
  defaultCurrency: "USD ($)",
  autoPublish: true,
  storeMail: "support@mystore.com",
  brandName: "",
  category: "",
};

export async function getSettings(shopDomain: string): Promise<MerchantSettings> {
  try {
    const record = await prisma.merchantSettings.findUnique({
      where: { shopDomain },
    });
    if (!record) return { ...DEFAULT_SETTINGS };
    return {
      defaultButtonText: record.defaultButtonText,
      defaultCurrency: record.defaultCurrency,
      autoPublish: record.autoPublish,
      storeMail: record.storeMail,
      brandName: record.brandName,
      category: record.category,
    };
  } catch (error) {
    console.error(`Error reading settings for ${shopDomain}:`, error);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(
  shopDomain: string,
  settings: Partial<MerchantSettings>
): Promise<MerchantSettings> {
  try {
    const existing = await getSettings(shopDomain);
    const updated = { ...existing, ...settings };

    await prisma.merchantSettings.upsert({
      where: { shopDomain },
      update: {
        defaultButtonText: updated.defaultButtonText,
        defaultCurrency: updated.defaultCurrency,
        autoPublish: updated.autoPublish,
        storeMail: updated.storeMail,
        brandName: updated.brandName ?? "",
        category: updated.category ?? "",
      },
      create: {
        shopDomain,
        defaultButtonText: updated.defaultButtonText,
        defaultCurrency: updated.defaultCurrency,
        autoPublish: updated.autoPublish,
        storeMail: updated.storeMail,
        brandName: updated.brandName ?? "",
        category: updated.category ?? "",
      },
    });

    return updated;
  } catch (error) {
    console.error(`Error saving settings for ${shopDomain}:`, error);
    return { ...DEFAULT_SETTINGS, ...settings };
  }
}
