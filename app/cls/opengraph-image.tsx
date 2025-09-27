import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "CLS - Cumulative Layout Shift | WebVitals Demo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Sentry mobile thresholds for CLS
const CLS_THRESHOLDS = {
  good: 0.1,
  needsImprovement: 0.25,
} as const;

export default async function Image() {
  // Convert OKLCH colors to hex equivalents (approximated)
  const clsColor = "#eb63c5"; // --metric-cls-hex
  const backgroundColor = "#ffffff"; // oklch(1 0 0) -> white
  const foregroundColor = "#0a0a0a"; // oklch(0.145 0 0) -> near black
  const mutedColor = "#777777"; // oklch(0.556 0 0) -> gray
  const mutedBg = "#f5f5f5"; // oklch(0.97 0 0) -> light gray
  const borderColor = "#e0e0e0"; // oklch(0.922 0 0) -> border gray

  // Score colors (exact hex values)
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
        {/* CLS Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "120px",
            height: "120px",
            borderRadius: "60px",
            backgroundColor: mutedBg,
            border: `3px solid ${clsColor}`,
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: clsColor,
            }}
          >
            CLS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Title */}
          <div
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              color: clsColor,
              marginBottom: "8px",
            }}
          >
            Cumulative Layout Shift
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "20px",
              color: mutedColor,
              maxWidth: "400px",
            }}
          >
            Measures visual stability and unexpected layout shifts
          </div>
        </div>
      </div>

      {/* Visual Demo - Simplified layout shift blocks */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          alignItems: "center",
          marginBottom: "48px",
        }}
      >
        {/* Before state */}
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
            Stable Layout
          </div>
          <div
            style={{
              width: "200px",
              height: "16px",
              backgroundColor: "#e8b4d0", // clsColor with transparency
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              width: "180px",
              height: "16px",
              backgroundColor: "#f0c9db", // lighter clsColor
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              width: "160px",
              height: "16px",
              backgroundColor: "#f0c9db",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: "32px",
            color: clsColor,
          }}
        >
          →
        </div>

        {/* After state - with shift */}
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
            Layout Shift
          </div>
          {/* New content block that appeared */}
          <div
            style={{
              width: "200px",
              height: "20px",
              backgroundColor: clsColor,
              borderRadius: "4px",
              border: `2px solid ${clsColor}`,
            }}
          />
          {/* Shifted content */}
          <div
            style={{
              width: "200px",
              height: "16px",
              backgroundColor: "#f7dde8", // very light clsColor
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              width: "180px",
              height: "16px",
              backgroundColor: "#fbecf2", // ultra light clsColor
              borderRadius: "4px",
            }}
          />
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
            Good: {"<="} {CLS_THRESHOLDS.good}
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
            Needs Improvement: {CLS_THRESHOLDS.good} -{" "}
            {CLS_THRESHOLDS.needsImprovement}
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
            Poor: {">"} {CLS_THRESHOLDS.needsImprovement}
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
