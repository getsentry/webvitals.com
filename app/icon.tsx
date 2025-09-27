import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "white",
          borderRadius: "4px",
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
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}