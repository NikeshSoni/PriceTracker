import Firecrawl from "@mendable/firecrawl-js";

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

/** Get product name from extracted object (handles different e-commerce site key names) */
function getProductName(extracted) {
  if (!extracted || typeof extracted !== "object") return "";
  const candidates = [
    extracted.productName,
    extracted.product_name,
    extracted.title,
    extracted.name,
    extracted.productTitle,
    extracted.product_title,
    extracted.itemName,
    extracted.item_name,
  ];
  const value = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
  return value ? value.trim() : "";
}

/** Fallback: derive a readable name from URL path slug (e.g. Meesho product URLs) */
function productNameFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const slug = path.split("/").filter(Boolean).pop() || "";
    if (!slug) return "";
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .slice(0, 200);
  } catch {
    return "";
  }
}

export async function scrapeProduct(url) {
  try {
    const result = await firecrawl.scrape(url, {
      formats: [
        {
          type: "json",
          schema: {
            type: "object",
            properties: {
              productName: { type: "string" },
              product_name: { type: "string" },
              title: { type: "string" },
              name: { type: "string" },
              currentPrice: { type: "string" },
              current_price: { type: "string" },
              price: { type: "string" },
              currencyCode: { type: "string" },
              currency_code: { type: "string" },
              productImageUrl: { type: "string" },
              product_image_url: { type: "string" },
              image: { type: "string" },
            },
          },
          prompt:
            "Extract from this e-commerce product page: the main product title or name (as productName or title), the current selling price (as currentPrice or price), currency code (e.g. INR, USD), and the main product image URL. Sites may use different labels; capture the visible product name and price.",
        },
      ],
    });

    const extracted = result?.json;
    const productName =
      getProductName(extracted) || productNameFromUrl(url);

    if (!productName) {
      throw new Error("No data extracted from URL");
    }

    const price =
      extracted?.currentPrice ??
      extracted?.current_price ??
      extracted?.price ??
      "";
    const currencyCode =
      extracted?.currencyCode ??
      extracted?.currency_code ??
      "USD";
    const productImageUrl =
      extracted?.productImageUrl ??
      extracted?.product_image_url ??
      extracted?.image ??
      "";

    return {
      productName,
      currentPrice: String(price),
      currencyCode,
      productImageUrl: productImageUrl || "",
    };
  } catch (error) {
    const details = error.response?.data?.error ?? error.response?.data?.details ?? error.message;
    console.error("Firecrawl scrape error:", error.response?.data ?? error);
    throw new Error(`Failed to scrape product: ${typeof details === "string" ? details : JSON.stringify(details)}`);
  }
}