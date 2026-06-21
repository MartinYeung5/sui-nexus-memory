import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import SiteHeader from "@/components/site-header";
import Providers from "../providers";

export const metadata = {
  title: "Nexus Memory",
  description: "Verifiable Collaborative Memory Layer for Multi-Agents",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className="min-h-screen bg-rice text-ink font-sans">
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <SiteHeader />
            <main className="max-w-7xl mx-auto px-6 py-8 ink-in">{children}</main>
            <footer className="border-t border-wood/20 mt-16 py-6 text-center text-xs text-wood">
              © {new Date().getFullYear()} Nexus Memory · Built on Walrus &amp; Sui
            </footer>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
