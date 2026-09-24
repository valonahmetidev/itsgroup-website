import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "ITS Group";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const fontRegular = await readFile(path.join(process.cwd(), "public/fonts/NotoSans-Regular.ttf"));
  const fontBold = await readFile(path.join(process.cwd(), "public/fonts/NotoSans-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #0b1f1a 0%, #0f6e56 55%, #123c34 100%)",
          color: "#f5f1e8",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.03em" }}>ITS Group</div>
        <div style={{ marginTop: 20, fontSize: 34, opacity: 0.92, maxWidth: 900, lineHeight: 1.35 }}>
          Technology. Security. Connectivity.
        </div>
        <div style={{ marginTop: 48, fontSize: 24, opacity: 0.75 }}>itsgroup.mk</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans", data: fontRegular, weight: 400, style: "normal" },
        { name: "Noto Sans", data: fontBold, weight: 700, style: "normal" },
      ],
    },
  );
}
