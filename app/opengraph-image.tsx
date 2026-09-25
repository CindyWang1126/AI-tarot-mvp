import { ImageResponse } from "next/og";

export const alt = "AI Tarot Interactive Reflection Experience by Timeflow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#07111f",
          color: "#f3f0e8",
          padding: "72px 82px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            border: "1px solid rgba(154, 201, 230, .25)",
            borderRadius: "50%",
            right: -80,
            top: -190,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", width: "65%" }}>
          <div
            style={{
              color: "#9ac9e6",
              fontSize: 20,
              letterSpacing: 5,
              marginBottom: 50,
            }}
          >
            AI × STRUCTURED TAROT KNOWLEDGE
          </div>
          <div style={{ display: "flex", fontSize: 80, lineHeight: 1.05, fontWeight: 500 }}>
            AI Tarot
          </div>
          <div style={{ display: "flex", fontSize: 37, color: "#b9c4d0", marginTop: 20 }}>
            Interactive Reflection Experience
          </div>
          <div style={{ display: "flex", marginTop: "auto", fontSize: 22, color: "#8491a0" }}>
            A Timeflow AI Experience
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginLeft: "auto" }}>
          {["I", "II", "III"].map((number, index) => (
            <div
              key={number}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 128,
                height: 220,
                borderRadius: 15,
                border: "1px solid rgba(225, 238, 248, .36)",
                background: index === 1 ? "#142c43" : "#0d2033",
                color: "#9ac9e6",
                fontSize: 34,
                transform: `translateY(${index === 1 ? -24 : 18}px) rotate(${index === 0 ? -7 : index === 2 ? 7 : 0}deg)`,
              }}
            >
              {number}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
