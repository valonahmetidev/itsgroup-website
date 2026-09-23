import { lineTotal, type InquiryItem } from "@/components/Inquiry";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { formatQuantity } from "@/lib/units";
import type { ProformaCustomer } from "@/lib/proforma-types";

/** A4 at 96dpi — matches jsPDF portrait page when margins are 0. */
const PDF_WIDTH_PX = 794;
const PDF_HEIGHT_PX = 1123;

/** Intrinsic /logo.png dimensions (verified from asset). */
const LOGO_NATURAL_WIDTH = 1774;
const LOGO_NATURAL_HEIGHT = 887;
const LOGO_DISPLAY_HEIGHT = 44;
const LOGO_DISPLAY_WIDTH = Math.round((LOGO_DISPLAY_HEIGHT * LOGO_NATURAL_WIDTH) / LOGO_NATURAL_HEIGHT);

const pdfLabels: Record<Locale, { documentNo: string; date: string; billTo: string; contact: string }> = {
  mk: { documentNo: "Број на документ", date: "Датум", billTo: "Клиент", contact: "Контакт" },
  sq: { documentNo: "Nr. dokumenti", date: "Data", billTo: "Klienti", contact: "Kontakt" },
  en: { documentNo: "Document no.", date: "Date", billTo: "Client", contact: "Contact" },
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fontFaceCss(origin: string) {
  const regular = `${origin}/fonts/NotoSans-Regular.ttf`;
  const bold = `${origin}/fonts/NotoSans-Bold.ttf`;
  return `
    @font-face {
      font-family: "Noto Sans PDF";
      src: url("${regular}") format("truetype");
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: "Noto Sans PDF";
      src: url("${bold}") format("truetype");
      font-weight: 700;
      font-style: normal;
    }
  `;
}

function createDocumentNumber() {
  const stamp = new Date();
  const y = stamp.getFullYear();
  const m = String(stamp.getMonth() + 1).padStart(2, "0");
  const d = String(stamp.getDate()).padStart(2, "0");
  const suffix = String(stamp.getTime()).slice(-4);
  return `PF-${y}${m}${d}-${suffix}`;
}

function formatDocumentDate(locale: Locale) {
  const tag = locale === "mk" ? "mk-MK" : locale === "sq" ? "sq-AL" : "en-GB";
  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" }).format(new Date());
}

function customerLines(customer: ProformaCustomer) {
  return [customer.company.trim(), customer.name.trim(), customer.phone.trim(), customer.email.trim()].filter(Boolean);
}

export function buildProformaHtml({
  customer,
  items,
  locale,
  dict,
  siteName,
  sitePhone,
  siteDomain,
  logoUrl,
  assetOrigin,
}: {
  customer: ProformaCustomer;
  items: InquiryItem[];
  locale: Locale;
  dict: Dictionary;
  siteName: string;
  sitePhone: string;
  siteDomain: string;
  logoUrl: string;
  assetOrigin: string;
}) {
  const labels = pdfLabels[locale];
  const documentNo = createDocumentNumber();
  const dateValue = formatDocumentDate(locale);
  const total = items.reduce((sum, item) => sum + (lineTotal(item) ?? 0), 0);
  const clientLines = customerLines(customer);
  const contactLines = [siteName, sitePhone, siteDomain].filter(Boolean);

  const rows = items
    .map((item, index) => {
      const line = lineTotal(item);
      return `
        <tr>
          <td class="num">${String(index + 1).padStart(2, "0")}</td>
          <td class="name">${escapeHtml(item.name)}</td>
          <td class="qty">${escapeHtml(formatQuantity(item.quantity, item.unit, locale))}</td>
          <td class="price">${escapeHtml(formatPrice(line ?? item.price, locale, dict))}</td>
        </tr>`;
    })
    .join("");

  return `
    <div class="proforma">
      <style>
        ${fontFaceCss(assetOrigin)}
        .proforma {
          width: ${PDF_WIDTH_PX}px;
          max-width: ${PDF_WIDTH_PX}px;
          min-height: ${PDF_HEIGHT_PX}px;
          color: #15181d;
          font-family: "Noto Sans PDF", "Noto Sans", system-ui, sans-serif;
          font-size: 11px;
          line-height: 1.5;
          background: #ffffff;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .proforma * { box-sizing: border-box; }
        .page-body { flex: 1 1 auto; display: flex; flex-direction: column; }
        .page-main { flex: 1 1 auto; }
        .header {
          background: linear-gradient(135deg, #0b0d11 0%, #12161c 55%, #0f1a17 100%);
          color: #fff;
          padding: 28px 32px 24px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: center;
        }
        .brand {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
          align-items: flex-start;
        }
        .brand-logo {
          width: ${LOGO_DISPLAY_WIDTH}px;
          height: ${LOGO_DISPLAY_HEIGHT}px;
          flex: 0 0 auto;
          background: url("${escapeHtml(logoUrl)}") no-repeat left center;
          background-size: contain;
        }
        .brand .domain {
          color: #8fa39a;
          font-size: 10px;
          letter-spacing: 0.04em;
        }
        .meta {
          min-width: 0;
          text-align: right;
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .meta h1 {
          margin: 0 0 12px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          line-height: 1.2;
          color: #d8e8e2;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: auto auto;
          gap: 10px 18px;
          justify-content: end;
        }
        .meta .label {
          color: #7f948b;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .meta .value {
          font-size: 11px;
          font-weight: 700;
          margin-top: 2px;
          word-break: break-word;
          color: #ffffff;
        }
        .accent-bar {
          height: 4px;
          background: linear-gradient(90deg, #0f6e56 0%, #18a07c 50%, #0f6e56 100%);
        }
        .cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 24px 32px 8px;
        }
        .card {
          background: #f7f8fa;
          border: 1px solid #e6e9ee;
          border-radius: 14px;
          padding: 16px 18px;
          min-height: 96px;
          min-width: 0;
          border-left: 3px solid #0f6e56;
        }
        .card h2 {
          margin: 0 0 10px;
          color: #0f6e56;
          font-size: 8px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 700;
        }
        .card p { margin: 0 0 5px; word-break: break-word; color: #4a515c; }
        .card p.primary { font-size: 13px; font-weight: 700; color: #15181d; }
        .content { padding: 8px 32px 28px; }
        .content h2 {
          margin: 0 0 14px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #15181d;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        col.num { width: 4%; }
        col.name { width: 58%; }
        col.qty { width: 12%; }
        col.price { width: 26%; }
        thead th {
          background: #0f6e56;
          color: #fff;
          padding: 11px 10px;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-align: center;
          vertical-align: middle;
          font-weight: 700;
        }
        thead th:first-child { border-radius: 10px 0 0 10px; }
        thead th:last-child { border-radius: 0 10px 10px 0; }
        thead th.num { width: 4%; padding-left: 8px; padding-right: 4px; }
        thead th.name { width: 58%; }
        thead th.qty { width: 12%; padding-left: 4px; padding-right: 8px; }
        thead th.price { width: 26%; }
        tbody td {
          padding: 10px 8px;
          vertical-align: top;
          font-size: 10px;
          border-bottom: 1px solid #eceef2;
        }
        tbody tr:last-child td { border-bottom: none; }
        tbody td.num {
          color: #8b919a;
          font-weight: 700;
          padding-left: 8px;
          padding-right: 4px;
          white-space: nowrap;
        }
        tbody td.name {
          text-align: left;
          vertical-align: middle;
          font-weight: 500;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        tbody td.qty {
          text-align: right;
          color: #6e737d;
          font-weight: 700;
          padding-left: 4px;
          padding-right: 8px;
          white-space: nowrap;
          font-size: 9.5px;
        }
        tbody td.price {
          text-align: right;
          font-weight: 700;
          color: #0f6e56;
          word-break: break-word;
          overflow-wrap: anywhere;
          font-size: 9.5px;
          line-height: 1.35;
        }
        .total-wrap {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .total {
          background: linear-gradient(135deg, #0b0d11 0%, #12161c 100%);
          color: #fff;
          border-radius: 14px;
          padding: 16px 20px;
          width: 260px;
          max-width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .total .label {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #18a07c;
          font-weight: 700;
        }
        .total .value {
          margin-top: 6px;
          font-size: 22px;
          font-weight: 700;
          text-align: right;
          word-break: break-word;
          color: #18a07c;
        }
        .note {
          margin-top: 18px;
          background: #f7f8fa;
          border: 1px solid #e6e9ee;
          border-radius: 12px;
          padding: 14px 16px;
          color: #6e737d;
          font-size: 9px;
          line-height: 1.55;
        }
        .footer {
          margin-top: auto;
          padding: 16px 32px 24px;
          border-top: 1px solid #e6e9ee;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #8b919a;
          font-size: 8px;
        }
        .footer span { min-width: 0; word-break: break-word; }
      </style>

      <header class="header">
        <div class="brand">
          <div class="brand-logo" role="img" aria-label="ITS Group"></div>
          <span class="domain">${escapeHtml(siteDomain)}</span>
        </div>
        <div class="meta">
          <h1>${escapeHtml(dict.quote.proformaTitle)}</h1>
          <div class="meta-grid">
            <div>
              <div class="label">${escapeHtml(labels.documentNo)}</div>
              <div class="value">${escapeHtml(documentNo)}</div>
            </div>
            <div>
              <div class="label">${escapeHtml(labels.date)}</div>
              <div class="value">${escapeHtml(dateValue)}</div>
            </div>
          </div>
        </div>
      </header>
      <div class="accent-bar" aria-hidden="true"></div>

      <div class="page-body">
        <div class="page-main">
          <section class="cards">
            <article class="card">
              <h2>${escapeHtml(labels.billTo)}</h2>
              ${clientLines
                .map((line, index) => `<p class="${index === 0 ? "primary" : ""}">${escapeHtml(line)}</p>`)
                .join("")}
            </article>
            <article class="card">
              <h2>${escapeHtml(labels.contact)}</h2>
              ${contactLines
                .map((line, index) => `<p class="${index === 0 ? "primary" : ""}">${escapeHtml(line)}</p>`)
                .join("")}
            </article>
          </section>

          <section class="content">
            <h2>${escapeHtml(dict.quote.itemsHeading)}</h2>
            <table>
              <colgroup>
                <col class="num" />
                <col class="name" />
                <col class="qty" />
                <col class="price" />
              </colgroup>
              <thead>
                <tr>
                  <th class="num">#</th>
                  <th class="name">${escapeHtml(dict.quote.itemsHeading)}</th>
                  <th class="qty">${escapeHtml(dict.product.quantity)}</th>
                  <th class="price">${escapeHtml(dict.quote.productPrice)}</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>

            <div class="total-wrap">
              <div class="total">
                <div class="label">${escapeHtml(dict.quote.total)}</div>
                <div class="value">${escapeHtml(formatPrice(total > 0 ? total : null, locale, dict))}</div>
              </div>
            </div>

            <p class="note">${escapeHtml(dict.quote.proformaNote)}</p>
          </section>
        </div>

        <footer class="footer">
          <span>${escapeHtml(dict.meta.siteName)}</span>
          <span>${escapeHtml(siteDomain)}</span>
        </footer>
      </div>
    </div>
  `;
}

async function waitForFonts() {
  await document.fonts.load('400 11px "Noto Sans PDF"');
  await document.fonts.load('700 11px "Noto Sans PDF"');
  await document.fonts.ready;
  await new Promise((resolve) => window.setTimeout(resolve, 350));
}

async function waitForLogo(url: string) {
  await new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

export async function downloadProformaPdf({
  customer,
  items,
  locale,
  dict,
  siteName,
  sitePhone,
  siteDomain,
}: {
  customer: ProformaCustomer;
  items: InquiryItem[];
  locale: Locale;
  dict: Dictionary;
  siteName: string;
  sitePhone: string;
  siteDomain: string;
}) {
  const origin = window.location.origin;
  const logoUrl = `${origin}/logo.png`;
  const html = buildProformaHtml({
    customer,
    items,
    locale,
    dict,
    siteName,
    sitePhone,
    siteDomain,
    logoUrl,
    assetOrigin: origin,
  });

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = [
    "position:fixed",
    "left:0",
    "top:0",
    `width:${PDF_WIDTH_PX}px`,
    "opacity:0",
    "pointer-events:none",
    "z-index:-1",
    "overflow:visible",
  ].join(";");
  host.innerHTML = html;
  document.body.appendChild(host);

  const element = host.querySelector(".proforma") as HTMLElement | null;
  if (!element) {
    document.body.removeChild(host);
    throw new Error("Proforma template failed to render");
  }

  await Promise.all([waitForFonts(), waitForLogo(logoUrl)]);

  const html2pdf = (await import("html2pdf.js")).default;
  const safeName = customer.name.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "proforma";
  const captureWidth = element.scrollWidth;
  const captureHeight = element.scrollHeight;

  try {
    await html2pdf()
      .set({
        margin: 0,
        filename: `ITS-proforma-${safeName}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: captureWidth,
          height: captureHeight,
          windowWidth: captureWidth,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  } finally {
    document.body.removeChild(host);
  }
}
