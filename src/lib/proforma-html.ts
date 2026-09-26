import type { InquiryItem } from "@/components/Inquiry";
import { computeProformaTotals, lineTotal } from "@/lib/proforma-pricing";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { DisplayCurrency, ExchangeRateSnapshot } from "@/lib/currency";
import { formatPrice } from "@/lib/format";
import { formatQuantity } from "@/lib/units";
import { defaultProformaRenderOptions, type ProformaRenderOptions } from "@/lib/proforma-document";
import type { ProformaCustomer } from "@/lib/proforma-types";

/** A4 at 96dpi — matches jsPDF portrait page when margins are 0. */
const PDF_WIDTH_PX = 794;

/** Intrinsic /its_logo.svg dimensions. */
const LOGO_NATURAL_WIDTH = 1558;
const LOGO_NATURAL_HEIGHT = 785;
const LOGO_ASPECT_RATIO = LOGO_NATURAL_WIDTH / LOGO_NATURAL_HEIGHT;
/** Fixed height so html2canvas/jsPDF match the on-screen header band beside the meta card. */
const HEADER_LOGO_HEIGHT_PX = 112;
const HEADER_LOGO_WIDTH_PX = Math.round(HEADER_LOGO_HEIGHT_PX * LOGO_ASPECT_RATIO);

const pdfLabels: Record<
  Locale,
  {
    documentNo: string;
    date: string;
    billTo: string;
    contact: string;
    signatureCustomer: string;
    signatureCompany: string;
    validUntil: string;
    poReference: string;
    bankDetails: string;
    subtotal: string;
    lineDiscounts: string;
    generalDiscount: string;
  }
> = {
  mk: {
    documentNo: "Број на документ",
    date: "Датум",
    billTo: "Клиент",
    contact: "Контакт",
    signatureCustomer: "Потпис на клиент",
    signatureCompany: "Овластено лице",
    validUntil: "Валидна до",
    poReference: "Референца / PO",
    bankDetails: "Платежни податоци",
    subtotal: "Меѓузбир",
    lineDiscounts: "Попуст по ставки",
    generalDiscount: "Општ попуст",
  },
  sq: {
    documentNo: "Nr. dokumenti",
    date: "Data",
    billTo: "Klienti",
    contact: "Kontakt",
    signatureCustomer: "Nënshkrimi i klientit",
    signatureCompany: "Personi i autorizuar",
    validUntil: "E vlefshme deri",
    poReference: "Referenca / PO",
    bankDetails: "Të dhënat bankare",
    subtotal: "Nëntotali",
    lineDiscounts: "Zbritje sipas rreshtave",
    generalDiscount: "Zbritje e përgjithshme",
  },
  en: {
    documentNo: "Document no.",
    date: "Date",
    billTo: "Client",
    contact: "Contact",
    signatureCustomer: "Client signature",
    signatureCompany: "Authorized signatory",
    validUntil: "Valid until",
    poReference: "Reference / PO",
    bankDetails: "Bank details",
    subtotal: "Subtotal",
    lineDiscounts: "Line discounts",
    generalDiscount: "General discount",
  },
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

function formatDocumentDate(locale: Locale, value?: string) {
  const tag = locale === "mk" ? "mk-MK" : locale === "sq" ? "sq-AL" : "en-GB";
  const date = value ? new Date(value) : new Date();
  if (value && Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" }).format(date);
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
  currency = "MKD",
  rates,
  documentNo,
  documentDate,
  options,
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
  currency?: DisplayCurrency;
  rates?: ExchangeRateSnapshot["rates"];
  documentNo?: string;
  documentDate?: string;
  options?: ProformaRenderOptions;
}) {
  const priceLabel = (amount: number | null) => formatPrice(amount, locale, dict, currency, rates);
  const labels = pdfLabels[locale];
  const renderOptions = { ...defaultProformaRenderOptions(), ...options };
  const resolvedDocumentNo = documentNo?.trim() || createDocumentNumber();
  const dateValue = formatDocumentDate(locale, documentDate);
  const totals = computeProformaTotals(items, renderOptions.generalDiscountPercent);
  const total = totals.total;
  const clientLines = customerLines(customer);
  const contactLines = [siteName, sitePhone, siteDomain].filter(Boolean);

  const rows = items
    .map((item, index) => {
      const line = lineTotal(item);
      const discountNote =
        item.discountPercent && item.discountPercent > 0 ? ` (−${item.discountPercent}%)` : "";
      return `
        <tr>
          <td class="num">${String(index + 1).padStart(2, "0")}</td>
          <td class="name">${escapeHtml(item.name + discountNote)}</td>
          <td class="qty">${escapeHtml(formatQuantity(item.quantity, item.unit, locale))}</td>
          <td class="price">${escapeHtml(priceLabel(line ?? item.price))}</td>
        </tr>`;
    })
    .join("");

  const metaExtras: string[] = [];
  if (renderOptions.showValidUntil && renderOptions.validUntil.trim()) {
    metaExtras.push(`
      <div>
        <div class="label">${escapeHtml(labels.validUntil)}</div>
        <div class="value">${escapeHtml(formatDocumentDate(locale, renderOptions.validUntil))}</div>
      </div>`);
  }
  if (renderOptions.poReference.trim()) {
    metaExtras.push(`
      <div>
        <div class="label">${escapeHtml(labels.poReference)}</div>
        <div class="value">${escapeHtml(renderOptions.poReference.trim())}</div>
      </div>`);
  }

  const signatureBlocks: string[] = [];
  if (renderOptions.showCustomerSignature) {
    const caption = renderOptions.customerSignatureLabel.trim() || labels.signatureCustomer;
    signatureBlocks.push(`
      <div class="signature">
        <div class="signature-line"></div>
        <p class="signature-label">${escapeHtml(caption)}</p>
      </div>`);
  }
  if (renderOptions.showCompanySignature) {
    const caption = renderOptions.companySignatureLabel.trim() || labels.signatureCompany;
    signatureBlocks.push(`
      <div class="signature">
        <div class="signature-line"></div>
        <p class="signature-label">${escapeHtml(caption)}</p>
      </div>`);
  }
  const signaturesHtml =
    signatureBlocks.length > 0 ? `<div class="signatures">${signatureBlocks.join("")}</div>` : "";

  const bankHtml =
    renderOptions.showBankDetails && renderOptions.bankDetails.trim()
      ? `<section class="bank"><h2>${escapeHtml(labels.bankDetails)}</h2><p>${escapeHtml(renderOptions.bankDetails.trim())}</p></section>`
      : "";

  const noteHtml = renderOptions.showProformaNote
    ? `<p class="note">${escapeHtml(dict.quote.proformaNote)}</p>`
    : "";

  return `
    <div class="proforma">
      <style>
        ${fontFaceCss(assetOrigin)}
        .proforma {
          width: ${PDF_WIDTH_PX}px;
          max-width: ${PDF_WIDTH_PX}px;
          color: #15181d;
          font-family: "Noto Sans PDF", "Noto Sans", system-ui, sans-serif;
          font-size: 11px;
          line-height: 1.5;
          background: #ffffff;
          overflow: hidden;
        }
        .proforma * { box-sizing: border-box; }
        .page-body { display: block; }
        .page-main { display: block; }
        .header {
          background: #ffffff;
          color: #15181d;
          padding: 14px 32px 10px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: center;
          border-bottom: 1px solid #e6e9ee;
        }
        .brand {
          position: relative;
          min-width: 0;
          padding-bottom: 14px;
        }
        .brand-logo {
          width: ${HEADER_LOGO_WIDTH_PX}px;
          height: ${HEADER_LOGO_HEIGHT_PX}px;
          max-width: 100%;
          background: url("${escapeHtml(logoUrl)}") no-repeat left center;
          background-size: contain;
        }
        .brand .domain {
          position: absolute;
          left: 0;
          bottom: 0;
          color: #4a515c;
          font-size: 9px;
          letter-spacing: 0.04em;
          line-height: 1.2;
        }
        .meta {
          min-width: 0;
          text-align: right;
          padding: 14px 16px;
          border-radius: 14px;
          background: #f7f8fa;
          border: 1px solid #e6e9ee;
        }
        .meta h1 {
          margin: 0 0 12px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          line-height: 1.2;
          color: #0f6e56;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: auto auto;
          gap: 10px 18px;
          justify-content: end;
        }
        .meta .label {
          color: #6b7280;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .meta .value {
          font-size: 11px;
          font-weight: 700;
          margin-top: 2px;
          word-break: break-word;
          color: #15181d;
        }
        .accent-bar {
          height: 4px;
          background: linear-gradient(90deg, #0f6e56 0%, #18a07c 50%, #0f6e56 100%);
        }
        .cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          padding: 20px 32px 6px;
        }
        .card {
          background: #f7f8fa;
          border: 1px solid #e6e9ee;
          border-radius: 14px;
          padding: 14px 16px;
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
        .content { padding: 6px 32px 16px; }
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
          vertical-align: middle;
          font-weight: 700;
        }
        thead th:first-child { border-radius: 10px 0 0 10px; }
        thead th:last-child { border-radius: 0 10px 10px 0; }
        thead th.num { width: 4%; padding-left: 8px; padding-right: 4px; text-align: left; }
        thead th.name { width: 58%; text-align: left; }
        thead th.qty { width: 12%; padding-left: 4px; padding-right: 8px; text-align: right; }
        thead th.price { width: 26%; text-align: right; }
        tbody td {
          padding: 8px 8px;
          vertical-align: middle;
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
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          margin-top: 14px;
        }
        .total {
          background: linear-gradient(135deg, #0f6e56 0%, #18a07c 100%);
          color: #ffffff;
          border-radius: 14px;
          padding: 14px 18px;
          width: 260px;
          max-width: 100%;
        }
        .total.sub {
          background: #f4f7f6;
          color: #1a1a1a;
          padding: 10px 16px;
        }
        .total.sub .label {
          color: rgba(26, 26, 26, 0.55);
        }
        .total.sub .value {
          font-size: 14px;
          color: #0f6e56;
        }
        .total .label {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.88);
          font-weight: 700;
        }
        .total .value {
          margin-top: 6px;
          font-size: 22px;
          font-weight: 700;
          text-align: right;
          word-break: break-word;
          color: #ffffff;
        }
        .note {
          margin-top: 12px;
          background: #f7f8fa;
          border: 1px solid #e6e9ee;
          border-radius: 12px;
          padding: 14px 16px;
          color: #6e737d;
          font-size: 9px;
          line-height: 1.55;
        }
        .footer {
          margin-top: 12px;
          padding: 12px 32px 18px;
          border-top: 1px solid #e6e9ee;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #8b919a;
          font-size: 8px;
        }
        .footer span { min-width: 0; word-break: break-word; }
        .meta-grid.extra { margin-top: 10px; }
        .bank {
          margin-top: 12px;
          background: #f7f8fa;
          border: 1px solid #e6e9ee;
          border-radius: 12px;
          padding: 12px 14px;
        }
        .bank h2 {
          margin: 0 0 6px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6e737d;
        }
        .bank p {
          margin: 0;
          font-size: 9px;
          line-height: 1.5;
          color: #3d424a;
          white-space: pre-wrap;
        }
        .signatures {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .signature-line {
          border-bottom: 1px solid #1a1d21;
          height: 28px;
        }
        .signature-label {
          margin: 6px 0 0;
          font-size: 8px;
          color: #6e737d;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
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
              <div class="value">${escapeHtml(resolvedDocumentNo)}</div>
            </div>
            <div>
              <div class="label">${escapeHtml(labels.date)}</div>
              <div class="value">${escapeHtml(dateValue)}</div>
            </div>
          </div>
          ${metaExtras.length > 0 ? `<div class="meta-grid extra">${metaExtras.join("")}</div>` : ""}
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
              ${
                totals.subtotal > 0 && (totals.lineDiscountAmount > 0 || totals.generalDiscountAmount > 0)
                  ? `
              <div class="total sub">
                <div class="label">${escapeHtml(labels.subtotal)}</div>
                <div class="value">${escapeHtml(priceLabel(totals.subtotal))}</div>
              </div>`
                  : ""
              }
              ${
                totals.lineDiscountAmount > 0
                  ? `
              <div class="total sub">
                <div class="label">${escapeHtml(labels.lineDiscounts)}</div>
                <div class="value">−${escapeHtml(priceLabel(totals.lineDiscountAmount))}</div>
              </div>`
                  : ""
              }
              ${
                totals.generalDiscountAmount > 0
                  ? `
              <div class="total sub">
                <div class="label">${escapeHtml(labels.generalDiscount)} (${totals.generalDiscountPercent}%)</div>
                <div class="value">−${escapeHtml(priceLabel(totals.generalDiscountAmount))}</div>
              </div>`
                  : ""
              }
              <div class="total">
                <div class="label">${escapeHtml(dict.quote.total)}</div>
                <div class="value">${escapeHtml(priceLabel(total > 0 ? total : null))}</div>
              </div>
            </div>

            ${noteHtml}
            ${bankHtml}
            ${signaturesHtml}
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

export type ProformaPdfInput = {
  customer: ProformaCustomer;
  items: InquiryItem[];
  locale: Locale;
  dict: Dictionary;
  siteName: string;
  sitePhone: string;
  siteDomain: string;
  currency?: DisplayCurrency;
  rates?: ExchangeRateSnapshot["rates"];
  documentNo?: string;
  documentDate?: string;
  options?: ProformaRenderOptions;
};

function proformaFilename(customer: ProformaCustomer, documentNo?: string) {
  if (documentNo?.trim()) {
    const safe = documentNo.trim().replace(/[^\w-]/g, "-");
    return `${safe}.pdf`;
  }
  const safeName = customer.name.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "proforma";
  return `ITS-proforma-${safeName}.pdf`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function renderProformaPdfElement(input: ProformaPdfInput) {
  const origin = window.location.origin;
  const logoUrl = `${origin}/its_logo.svg`;
  const html = buildProformaHtml({
    ...input,
    logoUrl,
    assetOrigin: origin,
    currency: input.currency ?? "MKD",
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
  return { host, element };
}

export async function generateProformaPdfBlob(input: ProformaPdfInput) {
  const filename = proformaFilename(input.customer, input.documentNo);
  const { host, element } = await renderProformaPdfElement(input);
  const captureWidth = element.scrollWidth;
  const captureHeight = element.scrollHeight;

  try {
    const html2pdf = (await import("html2pdf.js")).default;
    const blob = await html2pdf()
      .set({
        margin: 0,
        filename,
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
      .outputPdf("blob");

    return { blob: blob as Blob, filename };
  } finally {
    document.body.removeChild(host);
  }
}

export async function downloadProformaPdf(input: ProformaPdfInput) {
  const { blob, filename } = await generateProformaPdfBlob(input);
  downloadBlob(blob, filename);
}
