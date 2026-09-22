import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            fontSize: 300,
            fontWeight: 900,
            color: "#0f6e56",
            letterSpacing: "-0.08em",
            lineHeight: 1,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          ITS
        </div>
      </div>
    ),
    { ...size },
  );
}
