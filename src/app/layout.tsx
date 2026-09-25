import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { publicGaId } from "@/lib/ga";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { InquiryProvider } from "@/components/Inquiry";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { getServerCurrencyContext } from "@/lib/currency-server";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
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

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "ITS Group | Technology & home catalog — Kumanovo, North Macedonia",
    template: "%s · ITS Group",
  },
  description: site.seoDescription,
  applicationName: site.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: "ITS Group",
    description: site.seoDescription,
    locale: "mk_MK",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { currency, rates } = await getServerCurrencyContext();
  const gaId = publicGaId();

  return (
    <html lang="mk" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <OrganizationJsonLd />
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
            </InquiryProvider>
          </CurrencyProvider>
        </LocaleProvider>
        <Analytics gaId={gaId} />
      </body>
    </html>
  );
}
