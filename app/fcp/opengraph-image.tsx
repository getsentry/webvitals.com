import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "FCP - First Contentful Paint | WebVitals Demo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Sentry mobile thresholds for FCP (in milliseconds)
const FCP_THRESHOLDS = {
  good: 1800,
  needsImprovement: 3000,
} as const;

export default async function Image() {
  const fcpColor = "#52c794"; // --metric-fcp-hex
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
        {/* FCP Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "120px",
            height: "120px",
            borderRadius: "60px",
            backgroundColor: mutedBg,
            border: `3px solid ${fcpColor}`,
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: fcpColor,
            }}
          >
            FCP
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Title */}
          <div
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              color: fcpColor,
              marginBottom: "8px",
            }}
          >
            First Contentful Paint
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "20px",
              color: mutedColor,
              maxWidth: "400px",
            }}
          >
            Time when first text or image appears on screen
          </div>
        </div>
      </div>

      {/* Visual Demo - Paint timeline */}
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
            Empty Page
          </div>
          {/* Empty blocks */}
          <div
            style={{
              width: "200px",
              height: "16px",
              backgroundColor: "#f5f5f5", // light gray
              borderRadius: "4px",
              border: `1px dashed ${borderColor}`,
            }}
          />
          <div
            style={{
              width: "180px",
              height: "16px",
              backgroundColor: "#f5f5f5", // light gray
              borderRadius: "4px",
              border: `1px dashed ${borderColor}`,
            }}
          />
          <div
            style={{
              width: "160px",
              height: "16px",
              backgroundColor: "#f5f5f5", // light gray
              borderRadius: "4px",
              border: `1px dashed ${borderColor}`,
            }}
          />
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: "32px",
            color: fcpColor,
          }}
        >
          →
        </div>

        {/* FCP state - first content painted */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
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
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            First Content
          </div>
          {/* First content block painted */}
          <div
            style={{
              width: "200px",
              height: "16px",
              backgroundColor: fcpColor,
              borderRadius: "4px",
              border: `2px solid ${fcpColor}`,
            }}
          />
          {/* Still loading */}
          <div
            style={{
              width: "180px",
              height: "16px",
              backgroundColor: "#f5f5f5", // light gray
              borderRadius: "4px",
              border: `1px dashed ${borderColor}`,
            }}
          />
          <div
            style={{
              width: "160px",
              height: "16px",
              backgroundColor: "#f5f5f5", // light gray
              borderRadius: "4px",
              border: `1px dashed ${borderColor}`,
            }}
          />
        </div>

        {/* Timeline indicator */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            padding: "16px",
            backgroundColor: "#f0fdf4", // very light green
            borderRadius: "10px",
            border: `1px solid ${fcpColor}`,
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: fcpColor,
            }}
          >
            1.8s
          </div>
          <div
            style={{
              fontSize: "12px",
              color: mutedColor,
            }}
          >
            FCP Time
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
            Good: {"<="} {FCP_THRESHOLDS.good / 1000}s
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
            Needs Improvement: {FCP_THRESHOLDS.good / 1000}s -{" "}
            {FCP_THRESHOLDS.needsImprovement / 1000}s
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
            Poor: {">"} {FCP_THRESHOLDS.needsImprovement / 1000}s
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
