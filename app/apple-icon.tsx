import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "white",
        borderRadius: "24px",
      }}
    >
      {/* Top row: LCP, LCP, INP */}
      <div
        style={{
          display: "flex",
          height: "50%",
        }}
      >
        <div
          style={{
            width: "33.33%",
            background: "#f38906",
            borderTopLeftRadius: "24px",
          }}
        />
        <div
          style={{
            width: "33.33%",
            background: "#f38906",
          }}
        />
        <div
          style={{
            width: "33.34%",
            background: "#ab79f5",
            borderTopRightRadius: "24px",
          }}
        />
      </div>
      {/* Bottom row: CLS, FCP, TTFB */}
      <div
        style={{
          display: "flex",
          height: "50%",
        }}
      >
        <div
          style={{
            width: "33.33%",
            background: "#eb63c5",
            borderBottomLeftRadius: "24px",
          }}
        />
        <div
          style={{
            width: "33.33%",
            background: "#52c794",
          }}
        />
        <div
          style={{
            width: "33.34%",
            background: "#0099a3",
            borderBottomRightRadius: "24px",
          }}
        />
      </div>
    </div>,
    {
      ...size,
    },
  );
}
