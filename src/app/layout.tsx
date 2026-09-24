import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { InquiryProvider } from "@/components/Inquiry";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { getServerCurrencyContext } from "@/lib/currency-server";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "ITS Group",
    template: "%s · ITS Group",
  },
  description: site.description,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { currency, rates } = await getServerCurrencyContext();

  return (
    <html lang="mk" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )its-theme=([^;]*)/);var d=!m||m[1]==="dark";if(d)document.documentElement.classList.add("dark");document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}})();`,
          }}
        />
        <LocaleProvider>
          <CurrencyProvider initialCurrency={currency} initialRates={rates}>
            <InquiryProvider>
              <SiteHeader />
              <main>{children}</main>
              <Footer />
              <CookieConsent />
              <Analytics />
            </InquiryProvider>
          </CurrencyProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
