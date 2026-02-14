import { Toaster } from "@/components/ui/sonner";
import "./globals.css";


export const metadata = {
  title: "Track Order",
  description: "Manage your orders and track your shipments",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}

        <Toaster position="top-center" />
      </body>
    </html>
  );
}
