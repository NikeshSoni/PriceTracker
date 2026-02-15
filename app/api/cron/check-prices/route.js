import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeProduct } from "@/lib/firecrawl";
import { sendPriceDropAlert } from "@/lib/email";

export async function GET() {
    return NextResponse.json({
        messgae: "Price check endpoint is working. use POST to trigger."
    })
}

export async function POST(request) {

    try {
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        //  use service role to bypass RLS 

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
        )

        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("*")

        if (productsError) throw productsError;

        console.log(`Found ${products.length} products to check`);

        const result = {
            total: products.length,
            updated: 0,
            failed: 0,
            priceChanges: 0,
            alertsSent: 0,
        }

        for (const product of products) {
            try {
                const productData = await scrapeProduct(product.url);
                if (!productData.currentPrice) {
                    result.failed++;
                    continue;
                }

                const newPrice = parseFloat(productData.currentPrice);
                const oldPrice = parseFloat(product.current_price);

                await supabase.from("products").update({
                    current_price: newPrice,
                    currency: productData.currencyCode || product.currency,
                    name: productData.productName || product.name,
                    image_url: productData.productImageUrl || product.image_url,
                    updated_at: new Date().toISOString(),
                }).eq("id", product.id);

                if (oldPrice !== newPrice) {
                    await supabase.from("price_history").insert({
                        product_id: product.id,
                        price: newPrice,
                        currency: productData.currencyCode || product.currency,
                    });
                    result.priceChanges++;

                    if (newPrice < oldPrice) {
                        if (!product.user_id) {
                            console.warn(`Product ${product.id} has no user_id, skipping email`);
                        } else {
                            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(product.user_id);

                            if (userError) {
                                console.error(`Failed to get user for product ${product.id}:`, userError.message);
                            } else {
                                const user = userData?.user;
                                const userEmail = user?.email;
                                if (userEmail) {
                                    const emailResult = await sendPriceDropAlert(
                                        userEmail,
                                        product,
                                        oldPrice,
                                        newPrice
                                    );
                                    if (emailResult?.success) {
                                        result.alertsSent++;
                                    } else {
                                        const errMsg = typeof emailResult?.error === "object" ? JSON.stringify(emailResult.error) : (emailResult?.error ?? "unknown");
                                        console.error("Price drop email failed for product", product.id, errMsg);
                                    }
                                }
                            }
                        }
                    }
                }

                result.updated++

            } catch (error) {
                console.log(`Error processing product ${product.id}:`, error);
                result.failed++;
            }
        }

        return NextResponse.json({
            success: true,
            message: "price check complated",
            result,
        })

    } catch (error) {
        console.error("Cron jon error:", error);

        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}



// curl.exe -X POST https://price-trackerdelta.vercel.app/api/cron/check-prices -H "Authorization: Bearer 4902bd26553f0175f312dd7320a1a9a737ed9ced146f0cf31ebd533a724ff55d"
// curl.exe -X POST https://localhost:3000/api/cron/check-prices -H "Authorization: Bearer 4902bd26553f0175f312dd7320a1a9a737ed9ced146f0cf31ebd533a724ff55d


// https://price-trackerdelta.vercel.app/