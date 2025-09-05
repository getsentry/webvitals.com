export default function Background() {
  return (
    <div
      className="absolute inset-0 opacity-70"
      style={{
        backgroundImage: `
        linear-gradient(currentColor 1px, transparent 1px),
        linear-gradient(90deg, currentColor 1px, transparent 1px)
      `,
        backgroundSize: "50px 50px",
        color: "rgb(128 128 128 / 0.15)",
        maskImage:
          "radial-gradient(circle at center, black 0%, transparent 70%)",
        WebkitMaskImage:
          "radial-gradient(circle at center, black 0%, transparent 70%)",
      }}
    ></div>
  );
}
