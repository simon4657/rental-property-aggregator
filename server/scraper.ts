/**
 * Web Scraper Service for Rental Properties
 * 
 * This module provides a framework for scraping rental property data from various sources.
 * Due to anti-scraping measures on most rental websites, this serves as a template
 * that can be customized based on specific website structures.
 */

import * as db from "./db";

export interface ScrapedProperty {
  propertyUrl: string;
  address: string;
  city: string;
  district: string;
  floor?: string;
  price: number;
  rooms?: string;
  age?: number;
  hasElevator?: boolean;
  nearMrt?: string;
  source: string;
  notes?: string;
}

/**
 * Check if a property already exists in the database by URL
 */
async function propertyExists(url: string): Promise<boolean> {
  const properties = await db.getProperties();
  return properties.some(p => p.propertyUrl === url);
}

/**
 * Parse city and district from address string
 */
function parseLocation(address: string): { city: string; district: string } {
  // Common Taiwan cities
  const cities = [
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
    "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣",
    "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
    "台東縣", "澎湖縣", "金門縣", "連江縣"
  ];

  let city = "";
  let district = "";

  // Find city
  for (const c of cities) {
    if (address.includes(c)) {
      city = c;
      break;
    }
  }

  // Extract district (usually follows city name)
  if (city) {
    const afterCity = address.split(city)[1];
    const districtMatch = afterCity?.match(/^([^\d]+?[區鄉鎮市])/);
    if (districtMatch) {
      district = districtMatch[1];
    }
  }

  return { city, district };
}

/**
 * Scrape properties from 591.com.tw
 * Note: This is a template. Actual implementation requires handling:
 * - Authentication/cookies
 * - Rate limiting
 * - Dynamic content loading
 * - Anti-bot measures
 */
export async function scrape591(region?: string): Promise<ScrapedProperty[]> {
  console.log(`[Scraper] Starting 591 scraper for region: ${region || "all"}`);
  
  // This is a placeholder implementation
  // In production, you would:
  // 1. Use a headless browser (Puppeteer/Playwright) or HTTP client with proper headers
  // 2. Handle pagination
  // 3. Parse HTML/JSON responses
  // 4. Extract property details
  
  const scrapedProperties: ScrapedProperty[] = [];
  
  // Example: You would make HTTP requests here
  // const response = await fetch('https://rent.591.com.tw/...');
  // const html = await response.text();
  // Parse and extract data...
  
  console.log(`[Scraper] 591 scraper completed. Found ${scrapedProperties.length} properties`);
  return scrapedProperties;
}

/**
 * Scrape properties from Sinyi (信義房屋)
 */
export async function scrapeSinyi(region?: string): Promise<ScrapedProperty[]> {
  console.log(`[Scraper] Starting Sinyi scraper for region: ${region || "all"}`);
  
  const scrapedProperties: ScrapedProperty[] = [];
  
  // Similar implementation as above
  
  console.log(`[Scraper] Sinyi scraper completed. Found ${scrapedProperties.length} properties`);
  return scrapedProperties;
}

/**
 * Scrape properties from Yungching (永慶房仲)
 */
export async function scrapeYungching(region?: string): Promise<ScrapedProperty[]> {
  console.log(`[Scraper] Starting Yungching scraper for region: ${region || "all"}`);
  
  const scrapedProperties: ScrapedProperty[]= [];
  
  // Similar implementation as above
  
  console.log(`[Scraper] Yungching scraper completed. Found ${scrapedProperties.length} properties`);
  return scrapedProperties;
}

/**
 * Main scraper function that orchestrates all scrapers
 */
export async function scrapeAll(options?: {
  sources?: ("591" | "sinyi" | "yungching")[];
  region?: string;
  userId?: number;
}): Promise<{
  total: number;
  new: number;
  duplicate: number;
  errors: number;
}> {
  const sources = options?.sources || ["591", "sinyi", "yungching"];
  const region = options?.region;
  const userId = options?.userId;
  
  let totalScraped = 0;
  let newProperties = 0;
  let duplicates = 0;
  let errors = 0;

  console.log(`[Scraper] Starting scrape job for sources: ${sources.join(", ")}`);

  for (const source of sources) {
    try {
      let properties: ScrapedProperty[] = [];

      switch (source) {
        case "591":
          properties = await scrape591(region);
          break;
        case "sinyi":
          properties = await scrapeSinyi(region);
          break;
        case "yungching":
          properties = await scrapeYungching(region);
          break;
      }

      totalScraped += properties.length;

      // Save properties to database
      for (const property of properties) {
        try {
          // Check for duplicates
          if (await propertyExists(property.propertyUrl)) {
            duplicates++;
            continue;
          }

          // Parse location if not provided
          if (!property.city || !property.district) {
            const location = parseLocation(property.address);
            property.city = property.city || location.city;
            property.district = property.district || location.district;
          }

          // Save to database
          await db.createProperty({
            ...property,
            createdBy: userId,
          });

          newProperties++;
        } catch (error) {
          console.error(`[Scraper] Error saving property: ${error}`);
          errors++;
        }
      }
    } catch (error) {
      console.error(`[Scraper] Error scraping ${source}: ${error}`);
      errors++;
    }
  }

  console.log(`[Scraper] Scrape job completed. Total: ${totalScraped}, New: ${newProperties}, Duplicates: ${duplicates}, Errors: ${errors}`);

  return {
    total: totalScraped,
    new: newProperties,
    duplicate: duplicates,
    errors,
  };
}

/**
 * Import properties from CSV data
 */
export async function importFromCSV(csvData: string, userId?: number): Promise<{
  success: number;
  errors: number;
  errorMessages: string[];
}> {
  const lines = csvData.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  
  let success = 0;
  let errors = 0;
  const errorMessages: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].split(",").map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Map CSV columns to database fields
      const property = {
        propertyUrl: row["公寓網址"] || row["propertyUrl"] || "",
        address: row["地址"] || row["address"] || "",
        city: row["縣市"] || row["city"] || "",
        district: row["行政區"] || row["district"] || "",
        floor: row["樓層數"] || row["floor"],
        price: parseInt(row["租金價格"] || row["price"] || "0"),
        rooms: row["房間數"] || row["rooms"],
        age: row["屋齡"] ? parseInt(row["屋齡"]) : undefined,
        hasElevator: row["是否有電梯"] === "是" || row["hasElevator"] === "true",
        nearMrt: row["靠近捷運"] || row["nearMrt"],
        source: row["來源"] || row["source"] || "CSV匯入",
        notes: row["備註"] || row["notes"],
        createdBy: userId,
      };

      // Validate required fields
      if (!property.propertyUrl || !property.address || !property.city || !property.district || !property.price) {
        errorMessages.push(`第 ${i + 1} 行：缺少必填欄位`);
        errors++;
        continue;
      }

      // Check for duplicates
      if (await propertyExists(property.propertyUrl)) {
        errorMessages.push(`第 ${i + 1} 行：物件已存在`);
        errors++;
        continue;
      }

      await db.createProperty(property);
      success++;
    } catch (error) {
      errorMessages.push(`第 ${i + 1} 行：${error}`);
      errors++;
    }
  }

  return { success, errors, errorMessages };
}

