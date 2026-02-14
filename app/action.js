"use server";
import { scrapeProduct } from "@/lib/firecrawl";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
    redirect("/")
}

export async function addProduct(formData) {

    console.log(formData, "formData");


    const url = formData.get("url")

    if (!url) {
        return { error: "Url is required" }
    }

    try {
        const supabase = await createClient();

        const { data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return { error: "Not Authenticated" }
        }

        const productData = await scrapeProduct(url);

        console.log(productData.productName, "productData");


        if (!productData.productName) {
            console.log(productData, "productData");
            return { error: "Could not extract product name from this URL." }
        }

        const rawPrice = String(productData.currentPrice || "").trim();
        if (!rawPrice) {
            return { error: "Could not extract price from this URL." }
        }
        // Parse price: handle "₹ 499", "499", "$19.99" etc.
        const priceStr = rawPrice.replace(/[^\d.]/g, "") || "0";
        const newPrice = parseFloat(priceStr);
        if (!Number.isFinite(newPrice) || newPrice < 0) {
            return { error: "Could not read price from this page. Try a different product or site." }
        }

        const currency = productData.currencyCode || "USD";

        const { data: existingProduct } = await supabase
            .from("products")
            .select("id, current_price")
            .eq("user_id", user.id)
            .eq("url", url)
            .single();

        const isUpdate = !!existingProduct;

        // upsert product (Insert or update based on user_id + url)

        const { data: product, error } = await supabase.from("products").upsert({
            user_id: user.id,
            url,
            name: productData.productName,
            current_price: newPrice,
            currency: currency,
            image_url: productData.productImageUrl,
            updated_at: new Date().toISOString(),
        },
            {
                onConflict: "user_id,url", // unique consistent on user_id + url
                ignoreDuplicates: false,   // always update if exists 
            }
        )
            .select()
            .single()


        if (error) throw error;

        //  Add to price history if its a new product Or price changed 

        const shouldAddHistory =
            !isUpdate || existingProduct.current_price !== newPrice;


        if (shouldAddHistory) {
            await supabase.from("price_history").insert({
                product_id: product.id,
                price: newPrice,
                currency: currency
            })
        }

        revalidatePath("/");

        return {
            success: true,
            product,
            message: isUpdate ? "Product update with latest price!" : "Product added successfully!"
        }
    } catch (error) {
        console.error("Add product error", error);
        return { error: error.message || "Failed to add product" }

    }
}

export async function deleteProduct(productId) {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", productId);

        if (error) throw error;

        revalidatePath("/")
        return { success: true }


    } catch (error) {
        return { error: error.message }
    }
}

export async function getProducts(userId) {
    try {
      const supabase = await createClient();
  
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (userId) {
        query = query.eq("user_id", userId);
      }
  
      const { data, error } = await query;
  
      if (error) throw error;
  
      return data || [];
    } catch (error) {
      console.error("Get product error:", error);
      return [];
    }
  }
  


// export async function getProducts() {
//     try {
//       const supabase = await createClient();
//       const { data, error } = await supabase
//         .from("products")
//         .select("*")
//         .order("created_at", { ascending: false });

//       if (error) throw error;
//       return data || [];
//     } catch (error) {
//       console.error("Get products error:", error);
//       return [];
//     }
//   }

export async function getPriceHistory(productId) {

    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("price_history")
            .select("*")
            .eq("product_id", productId)
            .order("checked_at", { ascending: true })

        if (error) throw error;
        return data || []

    } catch (error) {
        console.error("Get price history error:", error);
        return []
    }

}