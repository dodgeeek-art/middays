import React from 'react';

interface CartoonSVGProps extends React.SVGProps<SVGSVGElement> {
  children?: React.ReactNode;
  size?: number | string;
  animClass?: string;
}

// Modern, zen-like SVG wrapper for standardising sizes, colors, and responsive scalability
const CartoonSVG = ({ children, size = 100, animClass = "anim-float", ...props }: CartoonSVGProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="#3A413A" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`overflow-visible ${animClass}`}
      style={{ width: size, height: size, display: 'inline-block' }}
      {...props}
    >
      <style>{`
        @keyframes float-zen {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(0.8deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes breathe-zen {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes sway-zen {
          0% { transform: rotate(-1.5deg); }
          50% { transform: rotate(1.5deg); }
          100% { transform: rotate(-1.5deg); }
        }
        .anim-float {
          transform-origin: center;
          animation: float-zen 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .anim-breathe {
          transform-origin: center;
          animation: breathe-zen 7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .anim-sway {
          transform-origin: center;
          animation: sway-zen 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
      {children}
    </svg>
  );
};

// A - Apple (Sage/clay colors, gentle floating)
const Apple = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-float" {...props}>
    {/* Stem */}
    <path d="M 50 25 C 50 18, 55 12, 58 12" stroke="#3A413A" strokeWidth="2.5" />
    {/* Leaf */}
    <path d="M 50 18 C 55 14, 66 16, 62 23 C 58 24, 52 21, 50 18 Z" fill="#C8D3C4" />
    {/* Body */}
    <path d="M 50 32 C 43 27, 26 29, 26 54 C 26 75, 42 82, 50 75 C 58 82, 74 75, 74 54 C 74 29, 57 27, 50 32 Z" fill="#E5B6A8" />
    {/* Highlight */}
    <path d="M 33 46 C 30 52, 32 60, 32 60" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
  </CartoonSVG>
);

// B - Bear (Beige/cream tones, slow breathing)
const Bear = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    {/* Ears */}
    <circle cx="32" cy="34" r="10" fill="#95A5A6" />
    <circle cx="32" cy="34" r="5" fill="#FAF5EB" />
    <circle cx="68" cy="34" r="10" fill="#95A5A6" />
    <circle cx="68" cy="34" r="5" fill="#FAF5EB" />
    {/* Head */}
    <circle cx="50" cy="56" r="25" fill="#E8E4D9" />
    {/* Snout */}
    <ellipse cx="50" cy="63" rx="10" ry="7" fill="#FAF9F5" />
    <ellipse cx="50" cy="60" rx="4" ry="2.5" fill="#3A413A" />
    {/* Eyes */}
    <circle cx="41" cy="51" r="2" fill="#3A413A" />
    <circle cx="59" cy="51" r="2" fill="#3A413A" />
    {/* Smile */}
    <path d="M 46 66 Q 50 69 54 66" fill="none" strokeWidth="1.5" />
  </CartoonSVG>
);

// C - Cat (Clay colors, gentle swaying)
const Cat = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    {/* Ears */}
    <polygon points="26,38 18,18 36,28" fill="#E5B6A8" />
    <polygon points="29,34 23,23 33,29" fill="#FAF5EB" />
    <polygon points="74,38 82,18 64,28" fill="#E5B6A8" />
    <polygon points="71,34 77,23 67,29" fill="#FAF5EB" />
    {/* Face */}
    <circle cx="50" cy="56" r="24" fill="#FAF5EB" />
    {/* Eyes */}
    <circle cx="41" cy="50" r="2" fill="#3A413A" />
    <circle cx="59" cy="50" r="2" fill="#3A413A" />
    {/* Snout */}
    <polygon points="50,58 47,55 53,55" fill="#E5B6A8" />
    {/* Whiskers */}
    <path d="M 28 56 L 16 54 M 28 60 L 14 60 M 28 64 L 16 66" fill="none" strokeWidth="1.5" />
    <path d="M 72 56 L 84 54 M 72 60 L 86 60 M 72 64 L 84 66" fill="none" strokeWidth="1.5" />
  </CartoonSVG>
);

// D - Dog (Slate & cream, breathing)
const Dog = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    {/* Face */}
    <circle cx="50" cy="54" r="24" fill="#E8E4D9" />
    {/* Ears */}
    <path d="M 28 40 C 20 40, 16 52, 20 62 C 24 70, 31 62, 31 52 Z" fill="#95A5A6" />
    <path d="M 72 40 C 80 40, 84 52, 80 62 C 76 70, 69 62, 69 52 Z" fill="#95A5A6" />
    {/* Snout */}
    <ellipse cx="50" cy="62" rx="9" ry="6" fill="#FAF9F5" />
    <ellipse cx="50" cy="59" rx="4" ry="2.5" fill="#3A413A" />
    {/* Eyes */}
    <circle cx="41" cy="48" r="2" fill="#3A413A" />
    <circle cx="59" cy="48" r="2" fill="#3A413A" />
    {/* Tongue */}
    <path d="M 50 64 Q 50 71 46 71 Q 42 71 42 66" fill="#E5B6A8" strokeWidth="1.5" />
  </CartoonSVG>
);

// E - Elephant (Slate blue-grey, breathing)
const Elephant = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    {/* Ears */}
    <circle cx="28" cy="48" r="17" fill="#BDC3C7" />
    <circle cx="28" cy="48" r="10" fill="#EAE5D9" />
    <circle cx="72" cy="48" r="17" fill="#BDC3C7" />
    <circle cx="72" cy="48" r="10" fill="#EAE5D9" />
    {/* Body */}
    <circle cx="50" cy="54" r="22" fill="#95A5A6" />
    {/* Eyes */}
    <circle cx="41" cy="48" r="2" fill="#3A413A" />
    <circle cx="59" cy="48" r="2" fill="#3A413A" />
    {/* Trunk */}
    <path d="M 50 60 C 47 70, 56 72, 60 72 C 64 72, 64 66, 62 66" fill="none" strokeWidth="4.5" stroke="#95A5A6" />
  </CartoonSVG>
);

// F - Fish (Sage green, floating)
const Fish = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-float" {...props}>
    {/* Tail */}
    <path d="M 32 50 L 12 34 L 12 66 Z" fill="#C8D3C4" />
    {/* Body */}
    <ellipse cx="54" cy="50" rx="28" ry="20" fill="#8E9F85" />
    {/* Eye */}
    <circle cx="68" cy="44" r="4.5" fill="#FAF9F5" strokeWidth="2" />
    <circle cx="69" cy="44" r="1.8" fill="#3A413A" />
    {/* Fins */}
    <path d="M 44 31 C 48 22, 56 22, 58 31" fill="#C8D3C4" />
    <path d="M 48 69 C 48 76, 54 76, 56 69" fill="#C8D3C4" />
  </CartoonSVG>
);

// G - Gift (Minimalist box, swaying)
const Gift = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    {/* Box */}
    <rect x="24" y="38" width="52" height="48" rx="4" fill="#FAF5EB" />
    {/* Lid */}
    <rect x="20" y="28" width="60" height="11" rx="2" fill="#E8E4D9" />
    {/* Ribbon */}
    <rect x="45" y="28" width="10" height="58" fill="#8E9F85" />
    {/* Ribbon Bow */}
    <path d="M 45 28 C 34 18, 36 10, 47 15 C 50 17, 48 24, 45 28 Z" fill="#8E9F85" />
    <path d="M 55 28 C 66 18, 64 10, 53 15 C 50 17, 52 24, 55 28 Z" fill="#8E9F85" />
  </CartoonSVG>
);

// H - Heart (Zen peach-clay, breathing)
const Heart = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    <path d="M 50 82 C 18 52, 12 24, 50 38 C 88 24, 82 52, 50 82 Z" fill="#E5B6A8" />
    {/* Simple line reflection */}
    <path d="M 33 46 A 15 15 0 0 1 45 39" fill="none" stroke="#FFF" strokeWidth="2" />
  </CartoonSVG>
);

// I - Ice Cream (Rose scoop, cream cone, floating)
const IceCream = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-float" {...props}>
    {/* Cone */}
    <polygon points="50,90 28,50 72,50" fill="#FAF5EB" />
    <path d="M 36 50 L 58 90 M 64 50 L 42 90 M 50 50 L 50 90" stroke="#E8E4D9" strokeWidth="1.5" />
    {/* Scoop */}
    <path d="M 30 50 C 30 36, 38 26, 50 26 C 62 26, 70 36, 70 50 C 70 56, 30 56, 30 50 Z" fill="#E5B6A8" />
    {/* Cherry */}
    <circle cx="50" cy="20" r="6.5" fill="#8E9F85" />
    <path d="M 50 14 Q 54 6 60 10" fill="none" strokeWidth="1.8" />
  </CartoonSVG>
);

// J - Juice (Sage beverage, cream glass, swaying)
const Juice = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    {/* Glass base */}
    <rect x="30" y="34" width="40" height="54" rx="6" fill="#FAF9F5" />
    {/* Liquid */}
    <rect x="34" y="46" width="32" height="38" rx="2" fill="#C8D3C4" />
    {/* Straw */}
    <path d="M 46 34 L 46 14 L 56 10" fill="none" strokeWidth="3" stroke="#8E9F85" />
    {/* Orange slice decoration */}
    <circle cx="50" cy="62" r="10" fill="#E5B6A8" />
    <circle cx="50" cy="62" r="6" fill="#FAF9F5" />
  </CartoonSVG>
);

// K - Key (Wheat/gold outline, floating)
const Key = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-float" {...props}>
    <circle cx="32" cy="50" r="16" fill="#FAF5EB" />
    <circle cx="32" cy="50" r="7" fill="#FAF9F5" strokeWidth="2" />
    <rect x="48" y="45" width="32" height="10" rx="1" fill="#FAF5EB" />
    <rect x="66" y="55" width="6" height="12" rx="1" fill="#FAF5EB" />
    <rect x="74" y="55" width="6" height="12" rx="1" fill="#FAF5EB" />
  </CartoonSVG>
);

// L - Lion (Ochre/sand tones, breathing)
const Lion = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    {/* Mane */}
    <circle cx="50" cy="54" r="32" fill="#E5B6A8" strokeDasharray="10 6" />
    <circle cx="50" cy="54" r="26" fill="#E5B6A8" />
    {/* Face */}
    <circle cx="50" cy="54" r="19" fill="#FAF5EB" />
    {/* Eyes */}
    <circle cx="43" cy="49" r="1.8" fill="#3A413A" />
    <circle cx="57" cy="49" r="1.8" fill="#3A413A" />
    {/* Nose */}
    <polygon points="50,59 47,56 53,56" fill="#E5B6A8" />
    {/* Mouth */}
    <path d="M 47 63 Q 50 65 53 63" fill="none" strokeWidth="1.5" />
  </CartoonSVG>
);

// M - Monkey (Sage & cream, swaying)
const Monkey = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    {/* Ears */}
    <circle cx="25" cy="50" r="9" fill="#95A5A6" />
    <circle cx="25" cy="50" r="4.5" fill="#FAF5EB" />
    <circle cx="77" cy="50" r="9" fill="#95A5A6" />
    <circle cx="77" cy="50" r="4.5" fill="#FAF5EB" />
    {/* Head */}
    <circle cx="50" cy="52" r="23" fill="#95A5A6" />
    {/* Face plate */}
    <path d="M 50 36 C 43 36, 36 41, 36 52 C 36 63, 43 67, 50 67 C 57 67, 64 63, 64 52 C 64 41, 57 36, 50 36 Z" fill="#FAF5EB" />
    {/* Eyes */}
    <circle cx="43" cy="48" r="1.8" fill="#3A413A" />
    <circle cx="57" cy="48" r="1.8" fill="#3A413A" />
    {/* Nose/mouth */}
    <circle cx="50" cy="55" r="1.5" fill="#3A413A" />
    <path d="M 46 59 Q 50 61 54 59" fill="none" strokeWidth="1.5" />
  </CartoonSVG>
);

// N - Nest (Slate grey & cream, floating)
const Nest = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-float" {...props}>
    {/* Eggs */}
    <ellipse cx="40" cy="48" rx="8" ry="11" fill="#FAF9F5" />
    <ellipse cx="50" cy="41" rx="8" ry="11" fill="#C8D3C4" />
    <ellipse cx="60" cy="48" rx="8" ry="11" fill="#FAF9F5" />
    {/* Nest branch bowl */}
    <path d="M 16 52 C 16 76, 84 76, 84 52 Z" fill="#E8E4D9" />
    {/* Nest twigs details */}
    <path d="M 20 57 L 80 57 M 26 65 L 74 65 M 34 71 L 66 71" fill="none" stroke="#BDC3C7" strokeWidth="1.8" />
  </CartoonSVG>
);

// O - Owl (Lavender-slate, breathing)
const Owl = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    {/* Body */}
    <ellipse cx="50" cy="56" rx="23" ry="29" fill="#95A5A6" />
    {/* Belly plate */}
    <ellipse cx="50" cy="65" rx="14" ry="16" fill="#FAF5EB" />
    {/* Eyes */}
    <circle cx="38" cy="44" r="9" fill="#FAF9F5" />
    <circle cx="38" cy="44" r="3.5" fill="#3A413A" />
    <circle cx="62" cy="44" r="9" fill="#FAF9F5" />
    <circle cx="62" cy="44" r="3.5" fill="#3A413A" />
    {/* Beak */}
    <polygon points="50,47 46,55 54,55" fill="#E5B6A8" />
  </CartoonSVG>
);

// P - Pig (Rose pink, swaying)
const Pig = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    {/* Ears */}
    <polygon points="28,38 18,22 36,30" fill="#E5B6A8" />
    <polygon points="72,38 82,22 64,30" fill="#E5B6A8" />
    {/* Face */}
    <circle cx="50" cy="55" r="23" fill="#FAF5EB" />
    {/* Snout */}
    <ellipse cx="50" cy="62" rx="9" ry="6" fill="#E5B6A8" />
    <circle cx="47" cy="62" r="1.5" fill="#3A413A" />
    <circle cx="53" cy="62" r="1.5" fill="#3A413A" />
    {/* Eyes */}
    <circle cx="39" cy="48" r="1.8" fill="#3A413A" />
    <circle cx="61" cy="48" r="1.8" fill="#3A413A" />
  </CartoonSVG>
);

// Q - Queen/Crown (Wheat-gold, floating)
const Queen = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-float" {...props}>
    {/* Base crown shape */}
    <path d="M 18 68 L 82 68 L 86 32 L 66 50 L 50 20 L 34 50 L 14 32 Z" fill="#FAF5EB" />
    {/* Crown gems */}
    <circle cx="14" cy="30" r="3.5" fill="#8E9F85" />
    <circle cx="50" cy="18" r="3.5" fill="#C8D3C4" />
    <circle cx="86" cy="30" r="3.5" fill="#8E9F85" />
    {/* Gem belt */}
    <rect x="26" y="60" width="48" height="5" fill="#8E9F85" />
  </CartoonSVG>
);

// R - Rabbit (Cream, breathing)
const Rabbit = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    {/* Ears */}
    <rect x="36" y="10" width="9" height="32" rx="4.5" fill="#FAF9F5" />
    <rect x="38" y="14" width="5" height="24" rx="2.5" fill="#E5B6A8" strokeWidth="1.5" />
    <rect x="55" y="10" width="9" height="32" rx="4.5" fill="#FAF9F5" />
    <rect x="57" y="14" width="5" height="24" rx="2.5" fill="#E5B6A8" strokeWidth="1.5" />
    {/* Face */}
    <circle cx="50" cy="58" r="22" fill="#FAF5EB" />
    {/* Eyes */}
    <circle cx="42" cy="52" r="1.8" fill="#3A413A" />
    <circle cx="58" cy="52" r="1.8" fill="#3A413A" />
    {/* Nose */}
    <ellipse cx="50" cy="59" rx="3.5" ry="2.5" fill="#E5B6A8" />
    {/* Mouth */}
    <path d="M 46 64 Q 50 67 54 64" fill="none" strokeWidth="1.5" />
  </CartoonSVG>
);

// S - Sun (Sage-wheat yellow, swaying)
const Sun = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    {/* Sun rays */}
    <path d="M 50 12 L 50 20 M 50 80 L 50 88 M 12 50 L 20 50 M 80 50 L 88 50 M 23 23 L 29 29 M 71 71 L 77 77 M 77 23 L 71 29 M 29 71 L 23 77" stroke="#FAF5EB" strokeWidth="4" />
    {/* Core */}
    <circle cx="50" cy="50" r="21" fill="#FAF5EB" />
    {/* Soft cheeks */}
    <circle cx="39" cy="54" r="3" fill="#E5B6A8" stroke="none" />
    <circle cx="61" cy="54" r="3" fill="#E5B6A8" stroke="none" />
    {/* Face lines */}
    <path d="M 39 46 Q 42 43 40 49 M 61 46 Q 58 43 60 49" fill="none" strokeWidth="1.5" />
    <path d="M 42 58 Q 50 66 60 58" fill="none" strokeWidth="2.5" />
  </CartoonSVG>
);

// T - Train (Slate-blue, floating)
const Train = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-float" {...props}>
    {/* Body boiler */}
    <rect x="18" y="44" width="38" height="30" fill="#BDC3C7" />
    {/* Cab */}
    <rect x="56" y="32" width="26" height="42" fill="#95A5A6" />
    {/* Window */}
    <rect x="61" y="38" width="16" height="16" fill="#FAF9F5" />
    {/* Chimney stack */}
    <rect x="26" y="26" width="9" height="18" fill="#3A413A" />
    {/* Wheels */}
    <circle cx="32" cy="76" r="9" fill="#3A413A" />
    <circle cx="32" cy="76" r="3" fill="#FAF5EB" stroke="none" />
    <circle cx="66" cy="76" r="9" fill="#3A413A" />
    <circle cx="66" cy="76" r="3" fill="#FAF5EB" stroke="none" />
  </CartoonSVG>
);

// U - Umbrella (Striped, swaying)
const Umbrella = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    {/* Handle hook */}
    <path d="M 50 48 L 50 80 C 50 85, 42 85, 42 80" fill="none" stroke="#3A413A" strokeWidth="4.5" />
    {/* Canopy */}
    <path d="M 14 48 C 14 20, 86 20, 86 48 C 71 43, 63 53, 50 48 C 37 43, 29 53, 14 48 Z" fill="#E5B6A8" />
    {/* Stripes */}
    <path d="M 50 20 L 50 48 M 50 20 C 42 28, 42 42, 36 49 M 50 20 C 58 28, 58 42, 64 49" fill="none" stroke="#FAF5EB" strokeWidth="1.8" />
  </CartoonSVG>
);

// V - Van (Zen delivery van, breathing)
const Van = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    {/* Body */}
    <rect x="14" y="32" width="50" height="40" rx="3" fill="#C8D3C4" />
    <path d="M 64 40 L 84 40 L 84 72 L 64 72 Z" fill="#8E9F85" />
    {/* Window */}
    <rect x="67" y="46" width="11" height="11" fill="#FAF9F5" />
    {/* Wheels */}
    <circle cx="28" cy="74" r="8" fill="#3A413A" />
    <circle cx="28" cy="74" r="3" fill="#FAF9F5" stroke="none" />
    <circle cx="68" cy="74" r="8" fill="#3A413A" />
    <circle cx="68" cy="74" r="3" fill="#FAF9F5" stroke="none" />
  </CartoonSVG>
);

// W - Whale (Slate-blue, floating)
const Whale = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-float" {...props}>
    {/* Water spout */}
    <path d="M 50 20 Q 46 10 54 8 M 47 14 Q 42 10 44 6 M 53 14 Q 58 10 56 6" fill="none" stroke="#C8D3C4" strokeWidth="2.2" />
    {/* Tail fin */}
    <path d="M 16 56 L 6 46 L 6 66 Z" fill="#BDC3C7" />
    {/* Whale body */}
    <path d="M 16 56 C 16 38, 34 28, 68 28 C 80 28, 86 36, 86 44 C 86 52, 72 60, 60 60 C 56 60, 50 54, 46 54" fill="#95A5A6" />
    {/* Eye */}
    <circle cx="64" cy="40" r="1.8" fill="#3A413A" />
    {/* Smile */}
    <path d="M 72 48 Q 68 51 64 48" fill="none" strokeWidth="1.8" />
  </CartoonSVG>
);

// X - Xylophone (Sage & clay bars, swaying)
const Xylophone = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-sway" {...props}>
    {/* Supporting frames */}
    <path d="M 24 14 L 38 84 M 76 14 L 62 84" fill="none" stroke="#E8E4D9" strokeWidth="4.5" />
    {/* Multi-coloured bars */}
    <rect x="12" y="20" width="76" height="10" rx="2" fill="#E5B6A8" />
    <rect x="20" y="36" width="60" height="10" rx="2" fill="#FAF5EB" />
    <rect x="28" y="52" width="44" height="10" rx="2" fill="#C8D3C4" />
    <rect x="36" y="68" width="28" height="10" rx="2" fill="#8E9F85" />
  </CartoonSVG>
);

// Y - Yoyo (Muted terracotta, floating)
const Yoyo = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-float" {...props}>
    {/* String */}
    <path d="M 50 14 L 50 46" fill="none" stroke="#3A413A" strokeWidth="2" />
    {/* Disks */}
    <ellipse cx="43" cy="56" rx="9" ry="22" fill="#E5B6A8" />
    <ellipse cx="57" cy="56" rx="9" ry="22" fill="#E5B6A8" />
    {/* Spindle axle */}
    <rect x="43" y="50" width="14" height="12" fill="#FAF5EB" />
  </CartoonSVG>
);

// Z - Zebra (Striped minimalist, breathing)
const Zebra = (props: React.SVGProps<SVGSVGElement>) => (
  <CartoonSVG animClass="anim-breathe" {...props}>
    {/* Face background */}
    <circle cx="50" cy="55" r="23" fill="#FAF9F5" />
    {/* Muzzle */}
    <ellipse cx="50" cy="65" rx="10" ry="6" fill="#FAF5EB" />
    {/* Eyes */}
    <circle cx="41" cy="48" r="1.8" fill="#3A413A" />
    <circle cx="59" cy="48" r="1.8" fill="#3A413A" />
    {/* Stripes details */}
    <path d="M 27 55 Q 37 55 35 50 L 27 48 Z" fill="#3A413A" stroke="none" />
    <path d="M 73 55 Q 63 55 65 50 L 73 48 Z" fill="#3A413A" stroke="none" />
    <path d="M 27 63 Q 39 63 37 59 L 27 57 Z" fill="#3A413A" stroke="none" />
    <path d="M 73 63 Q 61 63 63 59 L 73 57 Z" fill="#3A413A" stroke="none" />
  </CartoonSVG>
);

export const objectDictionary: Record<string, { name: string, icon: React.FC<{ size?: string | number; animClass?: string } & React.SVGProps<SVGSVGElement>> }> = {
  "A": { name: "Apple", icon: Apple },
  "B": { name: "Bear", icon: Bear },
  "C": { name: "Cat", icon: Cat },
  "D": { name: "Dog", icon: Dog },
  "E": { name: "Elephant", icon: Elephant },
  "F": { name: "Fish", icon: Fish },
  "G": { name: "Gift", icon: Gift },
  "H": { name: "Heart", icon: Heart },
  "I": { name: "Ice Cream", icon: IceCream },
  "J": { name: "Juice", icon: Juice },
  "K": { name: "Key", icon: Key },
  "L": { name: "Lion", icon: Lion },
  "M": { name: "Monkey", icon: Monkey },
  "N": { name: "Nest", icon: Nest },
  "O": { name: "Owl", icon: Owl },
  "P": { name: "Pig", icon: Pig },
  "Q": { name: "Queen", icon: Queen },
  "R": { name: "Rabbit", icon: Rabbit },
  "S": { name: "Sun", icon: Sun },
  "T": { name: "Train", icon: Train },
  "U": { name: "Umbrella", icon: Umbrella },
  "V": { name: "Van", icon: Van },
  "W": { name: "Whale", icon: Whale },
  "X": { name: "Xylophone", icon: Xylophone },
  "Y": { name: "Yoyo", icon: Yoyo },
  "Z": { name: "Zebra", icon: Zebra }
};
