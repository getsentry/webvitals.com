import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "TTFB - Time to First Byte | WebVitals Demo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Sentry mobile thresholds for TTFB (in milliseconds)
const TTFB_THRESHOLDS = {
  good: 800,
  needsImprovement: 1800,
} as const;

export default async function Image() {
  const ttfbColor = "#0099a3"; // --metric-ttfb-hex
  const backgroundColor = "#ffffff"; // --background
  const foregroundColor = "#0a0a0a"; // --foreground
  const mutedColor = "#777777"; // --muted-foreground
  const mutedBg = "#f5f5f5"; // --muted
  const borderColor = "#e0e0e0"; // --border

  // Score colors
  const scoreGood = "#67ad4c"; // --score-good-hex
  const scoreNeeds = "#ff7333"; // --score-needs-improvement-hex
  const scorePoor = "#de1c46"; // --score-poor-hex

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
        color: foregroundColor,
        fontFamily: "system-ui, sans-serif",
        padding: "48px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        {/* TTFB Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "120px",
            height: "120px",
            borderRadius: "60px",
            backgroundColor: mutedBg,
            border: `3px solid ${ttfbColor}`,
          }}
        >
          <div
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              color: ttfbColor,
            }}
          >
            TTFB
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Title */}
          <div
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              color: ttfbColor,
              marginBottom: "8px",
            }}
          >
            Time to First Byte
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "20px",
              color: mutedColor,
              maxWidth: "400px",
            }}
          >
            Server response time for initial request
          </div>
        </div>
      </div>

      {/* Visual Demo - Network request flow */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
          marginBottom: "48px",
        }}
      >
        {/* Browser */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            padding: "20px",
            backgroundColor: mutedBg,
            borderRadius: "10px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: mutedColor,
              marginBottom: "4px",
            }}
          >
            Browser
          </div>
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#66b3b8", // medium teal
              borderRadius: "30px",
              border: `2px solid ${ttfbColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            🌐
          </div>
        </div>

        {/* Request arrow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              color: ttfbColor,
            }}
          >
            →
          </div>
          <div
            style={{
              fontSize: "12px",
              color: mutedColor,
            }}
          >
            Request
          </div>
        </div>

        {/* Server */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            padding: "20px",
            backgroundColor: mutedBg,
            borderRadius: "10px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: mutedColor,
              marginBottom: "4px",
            }}
          >
            Server
          </div>
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#99c7ca", // light teal
              borderRadius: "8px",
              border: `2px dashed ${ttfbColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            🖥️
          </div>
        </div>

        {/* Response arrow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              color: ttfbColor,
            }}
          >
            ←
          </div>
          <div
            style={{
              fontSize: "12px",
              color: mutedColor,
            }}
          >
            First Byte
          </div>
        </div>

        {/* Response received */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            padding: "20px",
            backgroundColor: mutedBg,
            borderRadius: "10px",
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: mutedColor,
              marginBottom: "4px",
            }}
          >
            Response
          </div>
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: ttfbColor,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            📁
          </div>
        </div>

        {/* Timeline indicator */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            padding: "16px",
            backgroundColor: "#f0fafb", // very light teal
            borderRadius: "10px",
            border: `1px solid ${ttfbColor}`,
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: ttfbColor,
            }}
          >
            800ms
          </div>
          <div
            style={{
              fontSize: "12px",
              color: mutedColor,
            }}
          >
            TTFB Time
          </div>
        </div>
      </div>

      {/* Thresholds */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "8px",
              backgroundColor: scoreGood,
            }}
          />
          <span style={{ color: mutedColor, fontSize: "16px" }}>
            Good: {"<="} {TTFB_THRESHOLDS.good / 1000}s
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "8px",
              backgroundColor: scoreNeeds,
            }}
          />
          <span style={{ color: mutedColor, fontSize: "16px" }}>
            Needs Improvement: {TTFB_THRESHOLDS.good / 1000}s -{" "}
            {TTFB_THRESHOLDS.needsImprovement / 1000}s
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "8px",
              backgroundColor: scorePoor,
            }}
          />
          <span style={{ color: mutedColor, fontSize: "16px" }}>
            Poor: {">"} {TTFB_THRESHOLDS.needsImprovement / 1000}s
          </span>
        </div>
      </div>

      {/* WebVitals branding */}
      <div
        style={{
          position: "absolute",
          top: "32px",
          left: "32px",
          fontSize: "18px",
          fontWeight: "500",
          color: mutedColor,
        }}
      >
        WebVitals by Sentry
      </div>
    </div>,
    {
      ...size,
    },
  );
}
