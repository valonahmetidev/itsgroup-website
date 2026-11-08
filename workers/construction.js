const page = `<!doctype html>
<html lang="mk">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>ITS Group</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #0c0e12;
    color: #f4f1ea;
    font-family: "Segoe UI", system-ui, sans-serif;
  }
  main { width: min(36rem, calc(100% - 2.5rem)); }
  p.mark {
    margin: 0;
    color: #0f6e56;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  h1 { margin: 0.75rem 0 0; font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.05; }
  p.lead { margin: 1.25rem 0 0; max-width: 32rem; color: rgba(244, 241, 234, 0.72); line-height: 1.6; }
  a {
    display: inline-block;
    margin-top: 1.75rem;
    color: #f4f1ea;
    font-weight: 650;
    text-underline-offset: 0.2em;
  }
</style>
<main>
  <p class="mark">ITS Group</p>
  <h1>Страницата се подготвува.</h1>
  <p class="lead">Каталогот накратко не е достапен. За нарачка или прашање, јавете се директно.</p>
  <a href="tel:+38976302228">+389 76 302 228</a>
</main>
`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === "www.itsgroup.mk") {
      url.hostname = "itsgroup.mk";
      return Response.redirect(url.toString(), 308);
    }

    return new Response(page, {
      status: 503,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "retry-after": "3600",
      },
    });
  },
};
