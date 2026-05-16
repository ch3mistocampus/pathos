/**
 * The hero centerpiece: a translucent science pedestal with a molecular
 * structure suspended above it. Pure SVG so it themes cleanly, requires no
 * assets, and renders crisply at any size.
 */
export function ArenaPedestal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 460"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A translucent scientific pedestal supporting a glowing molecular structure"
    >
      <defs>
        <radialGradient id="ped-glow" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#dbe9ff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#cadcf6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#cadcf6" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="ped-disc" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#dde7f5" stopOpacity="0.75" />
        </linearGradient>

        <linearGradient id="ped-column" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#f2f6fc" />
          <stop offset="55%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e5edf8" />
        </linearGradient>

        <linearGradient id="ped-floor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e4ecf8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#e4ecf8" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="atom-blue" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#d2e0ff" />
          <stop offset="55%" stopColor="#4d7dd6" />
          <stop offset="100%" stopColor="#163880" />
        </radialGradient>

        <radialGradient id="atom-cyan" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e1f4ff" />
          <stop offset="60%" stopColor="#5aaad5" />
          <stop offset="100%" stopColor="#1c5e83" />
        </radialGradient>

        <radialGradient id="atom-violet" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ece2ff" />
          <stop offset="55%" stopColor="#8c7ed0" />
          <stop offset="100%" stopColor="#3b3470" />
        </radialGradient>

        <radialGradient id="atom-pale" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#c8d3e6" />
          <stop offset="100%" stopColor="#6c7d99" />
        </radialGradient>

        <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dx="0" dy="6" result="off" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Floor wash */}
      <ellipse cx="260" cy="400" rx="220" ry="40" fill="url(#ped-floor)" />

      {/* Faint horizon grid for scientific texture */}
      <g stroke="#cad8ec" strokeWidth="0.6" opacity="0.55">
        <line x1="40" y1="396" x2="480" y2="396" />
        <line x1="80" y1="412" x2="440" y2="412" />
        <line x1="120" y1="428" x2="400" y2="428" />
      </g>

      {/* Lower base ellipse */}
      <ellipse
        cx="260"
        cy="380"
        rx="140"
        ry="28"
        fill="url(#ped-disc)"
        stroke="#cfdbef"
        strokeWidth="1"
        filter="url(#soft-shadow)"
      />

      {/* Column body */}
      <path
        d="M150 370 L150 318 Q150 300 175 295 L345 295 Q370 300 370 318 L370 370 Z"
        fill="url(#ped-column)"
        stroke="#cfdbef"
        strokeWidth="1"
      />
      {/* Column top disc */}
      <ellipse
        cx="260"
        cy="295"
        rx="110"
        ry="18"
        fill="url(#ped-disc)"
        stroke="#cfdbef"
        strokeWidth="1"
      />
      {/* Inset rim — adds the "glass" perception */}
      <ellipse
        cx="260"
        cy="295"
        rx="92"
        ry="12"
        fill="#eaf1fb"
        opacity="0.55"
      />

      {/* Ambient bloom behind the molecule */}
      <circle cx="260" cy="200" r="170" fill="url(#ped-glow)" />

      {/* Inner halo ring */}
      <circle
        cx="260"
        cy="200"
        r="92"
        fill="none"
        stroke="#c8d6f0"
        strokeWidth="0.8"
        opacity="0.7"
      />

      {/* Molecule: 7 atoms wired into a small graph.
          Bonds drawn first so atoms sit on top. */}
      <g stroke="#1f3a6e" strokeWidth="1.6" strokeOpacity="0.55">
        <line x1="260" y1="160" x2="218" y2="186" />
        <line x1="260" y1="160" x2="302" y2="186" />
        <line x1="218" y1="186" x2="218" y2="232" />
        <line x1="302" y1="186" x2="302" y2="232" />
        <line x1="218" y1="232" x2="260" y2="258" />
        <line x1="302" y1="232" x2="260" y2="258" />
        <line x1="218" y1="186" x2="302" y2="186" strokeDasharray="3 3" />
        <line x1="260" y1="160" x2="260" y2="120" />
        <line x1="260" y1="258" x2="260" y2="298" strokeDasharray="3 3" />
      </g>

      <g>
        {/* central atom */}
        <circle cx="260" cy="160" r="14" fill="url(#atom-blue)" />
        {/* shoulders */}
        <circle cx="218" cy="186" r="12" fill="url(#atom-cyan)" />
        <circle cx="302" cy="186" r="12" fill="url(#atom-violet)" />
        {/* lower shoulders */}
        <circle cx="218" cy="232" r="10" fill="url(#atom-pale)" />
        <circle cx="302" cy="232" r="10" fill="url(#atom-pale)" />
        {/* base atom */}
        <circle cx="260" cy="258" r="12" fill="url(#atom-blue)" />
        {/* satellite atom */}
        <circle cx="260" cy="120" r="7" fill="url(#atom-cyan)" opacity="0.85" />
      </g>

      {/* Faint corner ticks for measurement feel */}
      <g stroke="#9bb1d3" strokeWidth="0.8" opacity="0.6">
        <path d="M40 60 h10 M40 60 v10" />
        <path d="M480 60 h-10 M480 60 v10" />
        <path d="M40 440 h10 M40 440 v-10" />
        <path d="M480 440 h-10 M480 440 v-10" />
      </g>
    </svg>
  );
}
