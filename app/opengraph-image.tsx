import { ImageResponse } from "next/og";

export const alt = "AI Tarot 三張牌互動反思體驗，由 Timeflow 製作";
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
          background: "linear-gradient(135deg, #080d1d 0%, #11172e 52%, #1a1834 100%)",
          color: "#f5f4f8",
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
            border: "1px solid rgba(190, 211, 239, .22)",
            borderRadius: "50%",
            right: -80,
            top: -190,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", width: "65%" }}>
          <div
            style={{
              color: "#b9c9ea",
              fontSize: 20,
              letterSpacing: 5,
              marginBottom: 50,
            }}
          >
            AI TAROT / INTERACTIVE REFLECTION
          </div>
          <div style={{ display: "flex", fontSize: 80, lineHeight: 1.05, fontWeight: 500 }}>
            Leave a question.
          </div>
          <div style={{ display: "flex", fontSize: 37, color: "#c8c9d8", marginTop: 20 }}>
            See another way through three cards.
          </div>
          <div style={{ display: "flex", marginTop: "auto", fontSize: 22, color: "#8491a0" }}>
            A Timeflow Experience
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
                border: "1px solid rgba(225, 232, 248, .28)",
                background: index === 1 ? "#242945" : "#171d36",
                color: "#c6d4f0",
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
