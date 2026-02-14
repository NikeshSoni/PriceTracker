
import AddProductForm from "@/components/AddProductForm";
import AuthButton from "@/components/AuthButton";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/utils/supabase/server";
import { Bell, LogInIcon, Rabbit, Shield, TrendingDown } from "lucide-react";
import { getProducts } from "./action";

export default async function Home() {


  const supabse = await createClient()

  const { data: { user } } = await supabse.auth.getUser();

  const products = user ? await getProducts() : [];

  const FEATURES = [
    {
      icon: Rabbit,
      title: "Lightning Fast",
      description:
        "Deal Drop extracts prices in seconds, handling JavaScript and dynamic content",
    },
    {
      icon: Shield,
      title: "Always Reliable",
      description:
        "Works across all major e-commerce sites with built-in anti-bot protection",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description:
        "Get notified instantly when prices drop below your target",
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50">
      <header className="bg-white/80 backgrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1>Track Order</h1>
          </div>

          <AuthButton user={user} />
        </div>
      </header>


      <section className=" py-20 px-4 ">
        <div className="max-w-7xl mx-auto text-center">
          <div className="">
            Code By ❤️ Me Nikesh
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">Never miss a price drop</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">Track your orders and get notified when prices drop</p>

          {/* Add Product Form */}

          <AddProductForm user={user} />


          {products.length === 0 && (
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
              {FEATURES.map(({ icon: Icon, title, description }) => {
                <div key={title}
                  className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto ">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>

                  <h3 className="text-[5rem] font-bold  text-gray-900 mb-2 ">{title}</h3>
                  <p className="text-sm text-gray-600 ">{description}</p>
                </div>
              })}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="p-4 bg-white rounded-lg shadow-md">
                <feature.icon className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-medium">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Products Grid */}
      {user && products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Your Tracked Products
            </h3>
            <span className="text-sm text-gray-500">
              {products.length} {products.length === 1 ? "product" : "products"}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {user && products.length === 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
            <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products yet
            </h3>

            <p className="text-gray-600">
              Add your first product above to start tracking prices!
            </p>
          </div>
        </section>
      )}

    </main>
  );
}
