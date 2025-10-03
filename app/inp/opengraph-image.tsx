import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "INP - Interaction to Next Paint | WebVitals Demo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Sentry mobile thresholds for INP (in milliseconds)
const INP_THRESHOLDS = {
  good: 200,
  needsImprovement: 500,
} as const;

export default async function Image() {
  const inpColor = "#ab79f5"; // --metric-inp-hex
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
        {/* INP Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "120px",
            height: "120px",
            borderRadius: "60px",
            backgroundColor: mutedBg,
            border: `3px solid ${inpColor}`,
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: inpColor,
            }}
          >
            INP
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Title */}
          <div
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              color: inpColor,
              marginBottom: "8px",
            }}
          >
            Interaction to Next Paint
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "20px",
              color: mutedColor,
              maxWidth: "400px",
            }}
          >
            Response time of page to user interactions
          </div>
        </div>
      </div>

      {/* Visual Demo - Interaction flow */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
          marginBottom: "48px",
        }}
      >
        {/* User interaction */}
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
            User Click
          </div>
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: inpColor,
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            👆
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: "32px",
            color: inpColor,
          }}
        >
          →
        </div>

        {/* Processing */}
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
            Processing
          </div>
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#d9c9f7", // light purple
              borderRadius: "30px",
              border: `2px dashed ${inpColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            ⚙️
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: "32px",
            color: inpColor,
          }}
        >
          →
        </div>

        {/* Visual update */}
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
            Next Paint
          </div>
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: inpColor,
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            🎨
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
            backgroundColor: "#f7f3ff", // very light purple
            borderRadius: "10px",
            border: `1px solid ${inpColor}`,
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: inpColor,
            }}
          >
            200ms
          </div>
          <div
            style={{
              fontSize: "12px",
              color: mutedColor,
            }}
          >
            INP Time
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
            Good: {"<="} {INP_THRESHOLDS.good}ms
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
            Needs Improvement: {INP_THRESHOLDS.good}ms -{" "}
            {INP_THRESHOLDS.needsImprovement}ms
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
            Poor: {">"} {INP_THRESHOLDS.needsImprovement}ms
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
