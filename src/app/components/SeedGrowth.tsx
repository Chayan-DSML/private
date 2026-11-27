const SEED_MIN = 100;
const SEED_MAX = 1_000_000;

function pourStyle(duration: string, delay = "0s") {
  return {
    animationName: "seed-pour",
    animationDuration: duration,
    animationTimingFunction: "ease-in",
    animationIterationCount: "infinite",
    animationDelay: delay,
  };
}

function growth(amount: number) {
  const span = Math.log(SEED_MAX / SEED_MIN);
  const progress = Math.min(1, Math.max(0, Math.log(Math.max(amount, SEED_MIN) / SEED_MIN) / span));
  return {
    progress,
    sprout: Math.min(1, Math.max(0, (progress - 0.04) / 0.22)),
    plant: Math.min(1, Math.max(0, (progress - 0.26) / 0.24)),
    tree: Math.min(1, Math.max(0, (progress - 0.5) / 0.28)),
    fruit: Math.min(1, Math.max(0, (progress - 0.8) / 0.2)),
    pour: `${(4.4 - progress * 3.2).toFixed(2)}s`,
  };
}

export function SeedGrowth({ amount, light = false }: { amount: number; light?: boolean }) {
  const stage = growth(amount);
  return (
    <figure className="mx-auto w-full max-w-sm text-center">
      <style>{`
        @keyframes seed-pour {
          0% { transform: translateY(-6px); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateY(78px); opacity: 0; }
        }
      `}</style>
      <svg viewBox="20 10 180 230" className="mx-auto h-56 w-full" aria-hidden="true">
        <ellipse cx="110" cy="214" rx="78" ry="16" fill="#e2e8f0" />
        <path d="M48 206c18 16 106 16 124 0 4 10-8 22-62 22s-66-12-62-22z" fill="#cbd5e1" />
        <g style={pourStyle(stage.pour)}>
          <ellipse cx="118" cy="28" rx="4" ry="7" fill="#00d2eb" />
        </g>
        <g style={pourStyle(stage.pour, "0.35s")}>
          <ellipse cx="108" cy="18" rx="3.2" ry="6" fill="#4adff3" />
        </g>
        <g style={pourStyle(stage.pour, "0.7s")}>
          <ellipse cx="128" cy="22" rx="3" ry="5.5" fill="#0097b3" />
        </g>
        <g
          style={{
            transform: `translateY(${18 - stage.sprout * 18}px) scale(${0.7 + stage.sprout * 0.3})`,
            transformOrigin: "110px 200px",
            opacity: 1 - stage.tree * 0.85,
            transition: "transform 700ms ease, opacity 700ms ease",
          }}
        >
          <ellipse cx="110" cy="198" rx="8" ry="5" fill="#007892" />
          <path
            d="M110 198 C108 176 112 160 110 142"
            fill="none"
            stroke="#00d2eb"
            strokeWidth={3 + stage.plant * 3}
            strokeLinecap="round"
            style={{ opacity: stage.sprout, transition: "opacity 500ms ease" }}
          />
          <ellipse
            cx="98"
            cy="156"
            rx={10 * stage.plant}
            ry={6 * stage.plant}
            fill="#00d2eb"
            transform="rotate(-28 98 156)"
          />
          <ellipse
            cx="124"
            cy="150"
            rx={12 * stage.plant}
            ry={7 * stage.plant}
            fill="#14d4ee"
            transform="rotate(24 124 150)"
          />
        </g>
        <g
          style={{
            opacity: stage.tree,
            transform: `scale(${0.72 + stage.tree * 0.28})`,
            transformOrigin: "110px 204px",
            transition: "opacity 700ms ease, transform 700ms ease",
          }}
        >
          <path d="M110 204 V118" stroke="#005c70" strokeWidth="8" strokeLinecap="round" />
          <path d="M110 160 C86 150 74 132 78 118" fill="none" stroke="#007892" strokeWidth="4" strokeLinecap="round" />
          <path d="M110 146 C136 136 150 118 146 104" fill="none" stroke="#007892" strokeWidth="4" strokeLinecap="round" />
          <circle cx="110" cy="108" r="36" fill="#00d2eb" />
          <circle cx="84" cy="124" r="24" fill="#14d4ee" />
          <circle cx="138" cy="122" r="26" fill="#0097b3" />
          <circle cx="118" cy="92" r="20" fill="#4adff3" />
          <g style={{ opacity: stage.fruit, transition: "opacity 600ms ease" }}>
            <circle cx="96" cy="118" r="7" fill="#f6c453" />
            <circle cx="128" cy="104" r="7" fill="#e3a008" />
            <circle cx="122" cy="136" r="6.5" fill="#f6c453" />
          </g>
        </g>
      </svg>
      <figcaption className={`px-4 text-sm font-medium ${light ? "text-slate-200" : "text-slate-600"}`}>
        The more you fund, the faster this seed becomes a plant, then a tree, then fruit.
      </figcaption>
    </figure>
  );
}
