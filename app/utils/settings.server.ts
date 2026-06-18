import fs from "fs";
import path from "path";

const SETTINGS_DIR = path.join(process.cwd(), "db_settings");

export interface MerchantSettings {
  defaultButtonText: string;
  defaultCurrency: string;
  autoPublish: boolean;
  storeMail: string;
}

const DEFAULT_SETTINGS: MerchantSettings = {
  defaultButtonText: "Add to Cart",
  defaultCurrency: "USD ($)",
  autoPublish: true,
  storeMail: "support@mystore.com",
};

function ensureDirExists() {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  }
}

export function getSettings(shopDomain: string): MerchantSettings {
  ensureDirExists();
  const filePath = path.join(SETTINGS_DIR, `${shopDomain.replace(/[^a-zA-Z0-9.-]/g, "_")}.json`);
  
  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(rawData) };
  } catch (error) {
    console.error(`Error reading settings for ${shopDomain}:`, error);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(shopDomain: string, settings: Partial<MerchantSettings>): MerchantSettings {
  ensureDirExists();
  const filePath = path.join(SETTINGS_DIR, `${shopDomain.replace(/[^a-zA-Z0-9.-]/g, "_")}.json`);
  
  const currentSettings = getSettings(shopDomain);
  const updatedSettings = { ...currentSettings, ...settings };

  try {
    fs.writeFileSync(filePath, JSON.stringify(updatedSettings, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error saving settings for ${shopDomain}:`, error);
  }

  return updatedSettings;
}
