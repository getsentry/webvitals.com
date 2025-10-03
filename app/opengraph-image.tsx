import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "WebVitals - Analyze Your Site's Performance";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff", // --background
        color: "#0a0a0a", // --foreground
        fontFamily: "system-ui, sans-serif",
        padding: "48px",
      }}
    >
      {/* Main heading */}
      <div
        style={{
          fontSize: "64px",
          fontWeight: "bold",
          color: "#0a0a0a",
          textAlign: "center",
          marginBottom: "16px",
        }}
      >
        WebVitals
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: "24px",
          color: "#777777", // --muted-foreground
          textAlign: "center",
          marginBottom: "48px",
          maxWidth: "600px",
        }}
      >
        Analyze Your Site's Performance with Real User Data
      </div>

      {/* Core Web Vitals grid */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* LCP */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 20px",
            backgroundColor: "#f5f5f5", // --muted
            borderRadius: "10px",
            border: "1px solid #e0e0e0", // --border
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#f38906", // --metric-lcp-hex
              marginBottom: "4px",
            }}
          >
            LCP
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#777777",
            }}
          >
            Loading
          </div>
        </div>

        {/* FCP */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#52c794", // --metric-fcp-hex
              marginBottom: "4px",
            }}
          >
            FCP
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#777777",
            }}
          >
            Paint
          </div>
        </div>

        {/* CLS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#eb63c5", // --metric-cls-hex
              marginBottom: "4px",
            }}
          >
            CLS
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#777777",
            }}
          >
            Stability
          </div>
        </div>

        {/* INP */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ab79f5", // --metric-inp-hex
              marginBottom: "4px",
            }}
          >
            INP
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#777777",
            }}
          >
            Response
          </div>
        </div>

        {/* TTFB */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#0099a3", // --metric-ttfb-hex
              marginBottom: "4px",
            }}
          >
            TTFB
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#777777",
            }}
          >
            Server
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          position: "absolute",
          bottom: "48px",
          fontSize: "16px",
          color: "#777777",
          textAlign: "center",
        }}
      >
        Interactive Demos • Real-time Analysis • WebVitals by Sentry
      </div>
    </div>,
    {
      ...size,
    },
  );
}
