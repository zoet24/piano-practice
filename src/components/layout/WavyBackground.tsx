// export const WavyBackground: React.FC = () => {
//   return (
//     <svg
//       className="absolute inset-0 w-full h-full -z-10 opacity-75"
//       preserveAspectRatio="none"
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 1440 900"
//     >
//       {/* Top section (taller to fill gaps behind the wave) */}
//       <rect
//         x="0"
//         y="0"
//         width="1440"
//         height="400"
//         fill="var(--color-keys-active)"
//       />

//       {/* Bottom section (taller to fill gaps behind the wave) */}
//       <rect
//         x="0"
//         y="500"
//         width="1440"
//         height="400"
//         fill="var(--color-keys-left)"
//       />

//       {/* Middle section (wavy top and bottom, rendered on top) */}
//       <path
//         d="
//         M0,300
//         C360,250 1080,350 1440,300
//         L1440,600
//         C1080,650 360,550 0,600
//         Z
//       "
//         fill="var(--color-keys-right)"
//       />
//     </svg>
//   );
// };

export const WavyBackground: React.FC = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full -z-10 opacity-75"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 900"
    >
      {/* Left section (taller to fill gaps behind the wave) */}
      <rect
        x="0"
        y="0"
        width="480"
        height="900"
        fill="var(--color-keys-active)"
      />

      {/* Right section (taller to fill gaps behind the wave) */}
      <rect
        x="960"
        y="0"
        width="480"
        height="900"
        fill="var(--color-keys-left)"
      />

      {/* Middle section (wavy left and right, rendered on top) */}
      <path
        d="
            M380,0
            C320,350 440,650 380,900
            L1060,900
            C1120,650 1000,350 1060,0
            Z
        "
        fill="var(--color-keys-right)"
      />
    </svg>
  );
};
