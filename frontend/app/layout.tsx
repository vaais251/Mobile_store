import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientProvider } from "@/components/providers/client-provider";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "PhoneMarket — Buy & Sell Phones with Trust",
    description:
        "Pakistan's admin-mediated phone marketplace. Browse verified listings, negotiate safely, and trade phones with complete transparency.",
    keywords: ["phone", "marketplace", "Pakistan", "buy", "sell", "mobile"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen font-sans">
                <ClientProvider>{children}</ClientProvider>
            </body>
        </html>
    );
}
