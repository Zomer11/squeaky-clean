import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e39b12",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 118,
            height: 90,
            background: "#f5c518",
            borderRadius: 999,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
