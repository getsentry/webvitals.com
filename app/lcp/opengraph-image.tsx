import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "LCP - Largest Contentful Paint | WebVitals Demo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Sentry mobile thresholds for LCP (in milliseconds)
const LCP_THRESHOLDS = {
  good: 2500,
  needsImprovement: 4000,
} as const;

export default async function Image() {
  const lcpColor = "#f38906"; // --metric-lcp-hex
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
        {/* LCP Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "120px",
            height: "120px",
            borderRadius: "60px",
            backgroundColor: mutedBg,
            border: `3px solid ${lcpColor}`,
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: lcpColor,
            }}
          >
            LCP
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Title */}
          <div
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              color: lcpColor,
              marginBottom: "8px",
            }}
          >
            Largest Contentful Paint
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "20px",
              color: mutedColor,
              maxWidth: "400px",
            }}
          >
            Time when largest content element becomes visible
          </div>
        </div>
      </div>

      {/* Visual Demo - Loading progression */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          alignItems: "center",
          marginBottom: "48px",
        }}
      >
        {/* Loading state */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "20px",
            backgroundColor: mutedBg,
            borderRadius: "10px",
            border: `1px solid ${borderColor}`,
            width: "200px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: mutedColor,
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            Loading Content
          </div>
          {/* Small text elements */}
          <div
            style={{
              width: "100%",
              height: "12px",
              backgroundColor: "#ffcc80", // light orange
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              width: "80%",
              height: "12px",
              backgroundColor: "#ffcc80", // light orange
              borderRadius: "4px",
            }}
          />
          {/* Large image placeholder */}
          <div
            style={{
              width: "100%",
              height: "60px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              border: `1px dashed ${borderColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: mutedColor,
            }}
          >
            Loading...
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: "32px",
            color: lcpColor,
          }}
        >
          →
        </div>

        {/* LCP state - largest element loaded */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "20px",
            backgroundColor: mutedBg,
            borderRadius: "10px",
            border: `1px solid ${borderColor}`,
            width: "200px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: mutedColor,
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            LCP Element
          </div>
          {/* Small text elements */}
          <div
            style={{
              width: "100%",
              height: "12px",
              backgroundColor: "#ffcc80", // light orange
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              width: "80%",
              height: "12px",
              backgroundColor: "#ffcc80", // light orange
              borderRadius: "4px",
            }}
          />
          {/* Largest element - fully loaded */}
          <div
            style={{
              width: "100%",
              height: "60px",
              backgroundColor: lcpColor,
              borderRadius: "4px",
              border: `3px solid ${lcpColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            LARGEST
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
            backgroundColor: "#fff3e6", // very light orange
            borderRadius: "10px",
            border: `1px solid ${lcpColor}`,
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: lcpColor,
            }}
          >
            2.5s
          </div>
          <div
            style={{
              fontSize: "12px",
              color: mutedColor,
            }}
          >
            LCP Time
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
            Good: {"<="} {LCP_THRESHOLDS.good / 1000}s
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
            Needs Improvement: {LCP_THRESHOLDS.good / 1000}s -{" "}
            {LCP_THRESHOLDS.needsImprovement / 1000}s
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
            Poor: {">"} {LCP_THRESHOLDS.needsImprovement / 1000}s
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
