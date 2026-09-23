import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { Footer } from "@/components/Footer";
import { InquiryProvider } from "@/components/Inquiry";
import { LocaleProvider } from "@/components/LocaleProvider";
import { SiteHeader } from "@/components/SiteHeader";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mk" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )its-theme=([^;]*)/);var d=!m||m[1]==="dark";if(d)document.documentElement.classList.add("dark");document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}})();`,
          }}
        />
        <LocaleProvider>
          <InquiryProvider>
            <SiteHeader />
            <main>{children}</main>
            <Footer />
          </InquiryProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
