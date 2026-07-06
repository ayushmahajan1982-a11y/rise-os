export default function GlobalVFX() {
  return (
    <svg
      aria-hidden="true"
      className="vfx-grain fixed inset-0 z-[9999] h-screen w-screen pointer-events-none opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="film-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.92"
          numOctaves="4"
          seed="17"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#film-grain)" />
    </svg>
  );
}
