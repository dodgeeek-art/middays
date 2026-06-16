import React from 'react';

// Helper wrapper to standardise sizes and styles for toddler graphics
const CartoonSVG = ({ children, size = 100, ...props }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    stroke="#2F3640" 
    strokeWidth="4" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="drop-shadow-md overflow-visible"
    {...props}
  >
    {children}
  </svg>
);

// A - Apple
const Apple = (props: any) => (
  <CartoonSVG {...props}>
    <path d="M 50 30 C 50 15, 60 10, 60 10" stroke="#795548" strokeWidth="4" fill="none" />
    <path d="M 50 16 C 55 12, 70 15, 65 24 C 60 25, 53 22, 50 16 Z" fill="#4ECDC4" stroke="#2F3640" strokeWidth="3" />
    <path d="M 50 32 C 42 26, 22 28, 22 56 C 22 80, 42 86, 50 78 C 58 86, 78 80, 78 56 C 78 28, 58 26, 50 32 Z" fill="#FF6B6B" />
    <circle cx="38" cy="48" r="3" fill="#FFF" stroke="none" />
  </CartoonSVG>
);

// B - Bear
const Bear = (props: any) => (
  <CartoonSVG {...props}>
    <circle cx="28" cy="35" r="11" fill="#8D6E63" />
    <circle cx="28" cy="35" r="6" fill="#FF8A80" stroke="#2F3640" strokeWidth="3" />
    <circle cx="72" cy="35" r="11" fill="#8D6E63" />
    <circle cx="72" cy="35" r="6" fill="#FF8A80" stroke="#2F3640" strokeWidth="3" />
    <circle cx="50" cy="58" r="28" fill="#A1887F" />
    <ellipse cx="50" cy="66" rx="12" ry="9" fill="#FFF" />
    <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#2F3640" />
    <circle cx="40" cy="52" r="3.5" fill="#2F3640" stroke="none" />
    <circle cx="60" cy="52" r="3.5" fill="#2F3640" stroke="none" />
    <path d="M 44 70 Q 50 74 56 70" fill="none" strokeWidth="3" />
  </CartoonSVG>
);

// C - Cat
const Cat = (props: any) => (
  <CartoonSVG {...props}>
    <polygon points="22,40 16,16 38,30" fill="#FF9800" />
    <polygon points="26,36 20,22 34,30" fill="#FF8A80" stroke="#2F3640" strokeWidth="3" />
    <polygon points="78,40 84,16 62,30" fill="#FF9800" />
    <polygon points="74,36 80,22 66,30" fill="#FF8A80" stroke="#2F3640" strokeWidth="3" />
    <circle cx="50" cy="58" r="26" fill="#FFB74D" />
    <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#FF8A80" />
    <circle cx="40" cy="50" r="3.5" fill="#2F3640" stroke="none" />
    <circle cx="60" cy="50" r="3.5" fill="#2F3640" stroke="none" />
    <path d="M 44 68 Q 50 72 56 68" fill="none" strokeWidth="3" />
    <path d="M 24 58 L 10 56 M 24 62 L 8 62 M 24 66 L 10 68" fill="none" strokeWidth="3" />
    <path d="M 76 58 L 90 56 M 76 62 L 92 62 M 76 66 L 90 68" fill="none" strokeWidth="3" />
  </CartoonSVG>
);

// D - Dog
const Dog = (props: any) => (
  <CartoonSVG {...props}>
    <circle cx="50" cy="56" r="26" fill="#FFE082" />
    <path d="M 24 42 C 16 42, 12 56, 16 66 C 20 74, 28 66, 28 56 Z" fill="#FFB300" />
    <path d="M 76 42 C 84 42, 88 56, 84 66 C 80 74, 72 66, 72 56 Z" fill="#FFB300" />
    <ellipse cx="50" cy="65" rx="10" ry="7" fill="#FFF" />
    <ellipse cx="50" cy="61" rx="5" ry="3.5" fill="#2F3640" />
    <circle cx="40" cy="50" r="3.5" fill="#2F3640" stroke="none" />
    <circle cx="60" cy="50" r="3.5" fill="#2F3640" stroke="none" />
    <path d="M 50 67 C 50 72, 46 76, 42 76 C 38 76, 40 70, 50 67" fill="#FF6B6B" />
  </CartoonSVG>
);

// E - Elephant
const Elephant = (props: any) => (
  <CartoonSVG {...props}>
    <circle cx="26" cy="50" r="18" fill="#78909C" />
    <circle cx="26" cy="50" r="11" fill="#FF8A80" stroke="#2F3640" strokeWidth="3" />
    <circle cx="74" cy="50" r="18" fill="#78909C" />
    <circle cx="74" cy="50" r="11" fill="#FF8A80" stroke="#2F3640" strokeWidth="3" />
    <circle cx="50" cy="55" r="24" fill="#90A4AE" />
    <circle cx="40" cy="50" r="3.5" fill="#2F3640" stroke="none" />
    <circle cx="60" cy="50" r="3.5" fill="#2F3640" stroke="none" />
    <path d="M 50 62 Q 46 75 58 75 Q 64 75 64 68" fill="none" stroke="#90A4AE" strokeWidth="10" />
    <path d="M 50 62 Q 46 75 58 75 Q 64 75 64 68" fill="none" strokeWidth="4" />
  </CartoonSVG>
);

// F - Fish
const Fish = (props: any) => (
  <CartoonSVG {...props}>
    <path d="M 30 50 L 8 32 L 8 68 Z" fill="#FF7043" />
    <ellipse cx="52" cy="50" rx="30" ry="22" fill="#FF8A65" />
    <circle cx="68" cy="44" r="5" fill="#FFF" stroke="#2F3640" strokeWidth="3" />
    <circle cx="69" cy="44" r="2.5" fill="#2F3640" stroke="none" />
    <path d="M 40 30 C 44 18, 54 18, 56 30" fill="#FF7043" />
    <path d="M 46 70 C 46 78, 52 78, 54 70" fill="#FF7043" />
    <path d="M 72 54 Q 78 52 72 58" fill="none" strokeWidth="3" />
  </CartoonSVG>
);

// G - Gift
const Gift = (props: any) => (
  <CartoonSVG {...props}>
    <rect x="22" y="36" width="56" height="52" rx="6" fill="#FFD166" />
    <rect x="18" y="26" width="64" height="12" rx="3" fill="#FFB74D" />
    <rect x="44" y="26" width="12" height="62" fill="#FF5A5F" />
    <path d="M 44 26 C 32 15, 34 6, 46 12 C 49 15, 47 22, 44 26 Z" fill="#FF5A5F" />
    <path d="M 56 26 C 68 15, 66 6, 54 12 C 51 15, 53 22, 56 26 Z" fill="#FF5A5F" />
  </CartoonSVG>
);

// H - Heart
const Heart = (props: any) => (
  <CartoonSVG {...props}>
    <path d="M 50 84 C 15 52, 10 22, 50 36 C 90 22, 85 52, 50 84 Z" fill="#FF5A5F" />
    <rect x="32" y="38" width="6" height="15" rx="3" fill="#FFF" stroke="none" transform="rotate(-20 32 38)" opacity="0.4" />
  </CartoonSVG>
);

// I - Ice Cream
const IceCream = (props: any) => (
  <CartoonSVG {...props}>
    <polygon points="50,92 25,48 75,48" fill="#D7CCC8" />
    <path d="M 28 48 C 28 35, 36 24, 50 24 C 64 24, 72 35, 72 48 C 72 54, 28 54, 28 48 Z" fill="#F8BBD0" />
    <circle cx="50" cy="18" r="7" fill="#FF5A5F" />
    <path d="M 50 12 Q 54 4 60 8" fill="none" strokeWidth="3" />
    <rect x="38" y="32" width="3" height="8" rx="1.5" fill="#FFD166" stroke="none" transform="rotate(30 38 32)" />
    <rect x="62" y="34" width="3" height="8" rx="1.5" fill="#4ECDC4" stroke="none" transform="rotate(-30 62 34)" />
    <rect x="50" y="38" width="3" height="8" rx="1.5" fill="#FF6B6B" stroke="none" />
  </CartoonSVG>
);

// J - Juice
const Juice = (props: any) => (
  <CartoonSVG {...props}>
    <rect x="28" y="32" width="44" height="58" rx="8" fill="#81C784" />
    <path d="M 46 32 L 46 12 L 58 8" fill="none" strokeWidth="4" stroke="#FFF" />
    <circle cx="50" cy="62" r="14" fill="#FFB74D" />
    <circle cx="50" cy="62" r="8" fill="#FF9800" stroke="none" />
  </CartoonSVG>
);

// K - Key
const Key = (props: any) => (
  <CartoonSVG {...props}>
    <circle cx="30" cy="50" r="18" fill="#FFD166" />
    <circle cx="30" cy="50" r="8" fill="#EAF9F1" stroke="#2F3640" strokeWidth="4" />
    <rect x="48" y="44" width="34" height="12" rx="2" fill="#FFD166" />
    <rect x="66" y="56" width="6" height="14" rx="2" fill="#FFD166" />
    <rect x="76" y="56" width="6" height="14" rx="2" fill="#FFD166" />
  </CartoonSVG>
);

// L - Lion
const Lion = (props: any) => (
  <CartoonSVG {...props}>
    <circle cx="50" cy="55" r="36" fill="#FF8A65" strokeDasharray="14 8" />
    <circle cx="50" cy="55" r="28" fill="#FF8A65" />
    <circle cx="50" cy="55" r="21" fill="#FFD54F" />
    <ellipse cx="50" cy="61" rx="5" ry="3.5" fill="#FF8A65" />
    <circle cx="42" cy="48" r="3" fill="#2F3640" stroke="none" />
    <circle cx="58" cy="48" r="3" fill="#2F3640" stroke="none" />
    <path d="M 46 66 Q 50 69 54 66" fill="none" strokeWidth="3" />
  </CartoonSVG>
);

// M - Monkey
const Monkey = (props: any) => (
  <CartoonSVG {...props}>
    <circle cx="23" cy="50" r="10" fill="#8D6E63" />
    <circle cx="23" cy="50" r="5" fill="#FFCDD2" stroke="#2F3640" strokeWidth="3" />
    <circle cx="77" cy="50" r="10" fill="#8D6E63" />
    <circle cx="77" cy="50" r="5" fill="#FFCDD2" stroke="#2F3640" strokeWidth="3" />
    <circle cx="50" cy="52" r="26" fill="#8D6E63" />
    <path d="M 50 34 C 42 34, 34 40, 34 52 C 34 65, 42 70, 50 70 C 58 70, 66 65, 66 52 C 66 40, 58 34, 50 34 Z" fill="#FFCDD2" stroke="#2F3640" strokeWidth="3" />
    <circle cx="42" cy="48" r="3" fill="#2F3640" stroke="none" />
    <circle cx="58" cy="48" r="3" fill="#2F3640" stroke="none" />
    <path d="M 44 60 Q 50 63 56 60" fill="none" strokeWidth="3" />
  </CartoonSVG>
);

// N - Nest
const Nest = (props: any) => (
  <CartoonSVG {...props}>
    <ellipse cx="38" cy="46" rx="8" ry="12" fill="#B2EBF2" />
    <ellipse cx="50" cy="40" rx="8" ry="12" fill="#C8E6C9" />
    <ellipse cx="62" cy="46" rx="8" ry="12" fill="#FFF9C4" />
    <path d="M 12 50 C 12 78, 88 78, 88 50 Z" fill="#A1887F" />
    <path d="M 15 56 L 85 56 M 22 66 L 78 66 M 32 74 L 68 74" fill="none" strokeWidth="3" stroke="#8D6E63" />
  </CartoonSVG>
);

// O - Owl
const Owl = (props: any) => (
  <CartoonSVG {...props}>
    <ellipse cx="50" cy="56" rx="26" ry="32" fill="#9575CD" />
    <circle cx="36" cy="42" r="11" fill="#FFF" />
    <circle cx="36" cy="42" r="5" fill="#2F3640" stroke="none" />
    <circle cx="64" cy="42" r="11" fill="#FFF" />
    <circle cx="64" cy="42" r="5" fill="#2F3640" stroke="none" />
    <polygon points="50,46 44,56 56,56" fill="#FFB74D" />
    <path d="M 36 68 Q 42 66 48 68 M 52 68 Q 58 66 64 68" fill="none" strokeWidth="3" stroke="#7E57C2" />
  </CartoonSVG>
);

// P - Pig
const Pig = (props: any) => (
  <CartoonSVG {...props}>
    <polygon points="26,38 18,22 34,30" fill="#F06292" />
    <polygon points="74,38 82,22 66,30" fill="#F06292" />
    <circle cx="50" cy="55" r="26" fill="#F48FB1" />
    <ellipse cx="50" cy="62" rx="10" ry="7" fill="#F06292" />
    <circle cx="45" cy="62" r="2" fill="#2F3640" stroke="none" />
    <circle cx="55" cy="62" r="2" fill="#2F3640" stroke="none" />
    <circle cx="38" cy="48" r="3" fill="#2F3640" stroke="none" />
    <circle cx="62" cy="48" r="3" fill="#2F3640" stroke="none" />
  </CartoonSVG>
);

// Q - Queen/Crown
const Queen = (props: any) => (
  <CartoonSVG {...props}>
    <path d="M 15 70 L 85 70 L 90 30 L 68 52 L 50 18 L 32 52 L 10 30 Z" fill="#FFD166" />
    <circle cx="10" cy="28" r="4" fill="#FF5A5F" />
    <circle cx="50" cy="16" r="4" fill="#4ECDC4" />
    <circle cx="90" cy="28" r="4" fill="#FF5A5F" />
    <rect x="25" y="60" width="50" height="6" fill="#FF5A5F" />
  </CartoonSVG>
);

// R - Rabbit
const Rabbit = (props: any) => (
  <CartoonSVG {...props}>
    <rect x="34" y="10" width="10" height="34" rx="5" fill="#FFF" />
    <rect x="36" y="14" width="6" height="26" rx="3" fill="#FFCDD2" stroke="#2F3640" strokeWidth="3" />
    <rect x="56" y="10" width="10" height="34" rx="5" fill="#FFF" />
    <rect x="58" y="14" width="6" height="26" rx="3" fill="#FFCDD2" stroke="#2F3640" strokeWidth="3" />
    <circle cx="50" cy="60" r="24" fill="#FFF" />
    <circle cx="42" cy="54" r="3" fill="#2F3640" stroke="none" />
    <circle cx="58" cy="54" r="3" fill="#2F3640" stroke="none" />
    <ellipse cx="50" cy="62" rx="4" ry="3" fill="#FFCDD2" />
    <path d="M 44 68 Q 50 72 56 68" fill="none" strokeWidth="3" />
  </CartoonSVG>
);

// S - Sun
const Sun = (props: any) => (
  <CartoonSVG {...props}>
    <path d="M 50 10 L 50 22 M 50 78 L 50 90 M 10 50 L 22 50 M 78 50 L 90 50 M 22 22 L 31 31 M 69 69 L 78 78 M 78 22 L 69 31 M 31 69 L 22 78" stroke="#FF9800" strokeWidth="8" />
    <circle cx="50" cy="50" r="24" fill="#FFD166" />
    <path d="M 40 44 Q 44 40 42 48 M 58 44 Q 56 40 58 48" fill="none" strokeWidth="3" />
    <path d="M 40 58 Q 50 66 60 58" fill="none" strokeWidth="4" />
  </CartoonSVG>
);

// T - Train
const Train = (props: any) => (
  <CartoonSVG {...props}>
    <rect x="15" y="44" width="40" height="32" fill="#4FC3F7" />
    <rect x="55" y="32" width="28" height="44" fill="#EF5350" />
    <rect x="60" y="38" width="18" height="18" fill="#FFF" />
    <rect x="25" y="24" width="10" height="20" fill="#2F3640" />
    <circle cx="30" cy="80" r="10" fill="#2F3640" />
    <circle cx="30" cy="80" r="4" fill="#FFD166" stroke="none" />
    <circle cx="68" cy="80" r="10" fill="#2F3640" />
    <circle cx="68" cy="80" r="4" fill="#FFD166" stroke="none" />
  </CartoonSVG>
);

// U - Umbrella
const Umbrella = (props: any) => (
  <CartoonSVG {...props}>
    <path d="M 50 50 L 50 82 C 50 88, 40 88, 40 82" fill="none" stroke="#8D6E63" strokeWidth="5" />
    <path d="M 12 50 C 12 20, 88 20, 88 50 C 72 44, 64 56, 50 50 C 36 44, 28 56, 12 50 Z" fill="#FF5A5F" />
    <path d="M 50 20 L 50 10" fill="none" strokeWidth="5" stroke="#2F3640" />
  </CartoonSVG>
);

// V - Van
const Van = (props: any) => (
  <CartoonSVG {...props}>
    <rect x="12" y="32" width="52" height="42" rx="4" fill="#29B6F6" />
    <path d="M 64 42 L 84 42 L 84 74 L 64 74 Z" fill="#29B6F6" />
    <rect x="68" y="48" width="12" height="12" fill="#FFF" />
    <circle cx="28" cy="78" r="9" fill="#2F3640" />
    <circle cx="28" cy="78" r="3.5" fill="#FFF" stroke="none" />
    <circle cx="68" cy="78" r="9" fill="#2F3640" />
    <circle cx="68" cy="78" r="3.5" fill="#FFF" stroke="none" />
  </CartoonSVG>
);

// W - Whale
const Whale = (props: any) => (
  <CartoonSVG {...props}>
    <path d="M 50 22 Q 46 12 54 10 M 47 16 Q 42 12 44 8 M 53 16 Q 58 12 56 8" fill="none" stroke="#29B6F6" strokeWidth="3" />
    <path d="M 12 60 C 12 40, 32 30, 68 30 C 82 30, 88 40, 88 48 C 88 56, 74 64, 62 64 C 58 64, 52 58, 48 58" fill="#29B6F6" />
    <path d="M 12 60 L 4 50 L 4 70 Z" fill="#29B6F6" />
    <circle cx="64" cy="44" r="3.5" fill="#2F3640" stroke="none" />
    <path d="M 72 52 Q 68 56 64 52" fill="none" strokeWidth="3" />
  </CartoonSVG>
);

// X - Xylophone
const Xylophone = (props: any) => (
  <CartoonSVG {...props}>
    <rect x="10" y="20" width="80" height="10" rx="3" fill="#FF5A5F" />
    <rect x="18" y="36" width="64" height="10" rx="3" fill="#FF9800" />
    <rect x="26" y="52" width="48" height="10" rx="3" fill="#FFD166" />
    <rect x="34" y="68" width="32" height="10" rx="3" fill="#4ECDC4" />
    <path d="M 22 14 L 38 84 M 78 14 L 62 84" fill="none" stroke="#8D6E63" strokeWidth="4" />
  </CartoonSVG>
);

// Y - Yoyo
const Yoyo = (props: any) => (
  <CartoonSVG {...props}>
    <path d="M 50 14 L 50 48" fill="none" stroke="#2F3640" strokeWidth="3" />
    <ellipse cx="42" cy="58" rx="10" ry="24" fill="#FF5A5F" />
    <ellipse cx="58" cy="58" rx="10" ry="24" fill="#FF5A5F" />
    <rect x="42" y="52" width="16" height="12" fill="#FFD166" />
  </CartoonSVG>
);

// Z - Zebra
const Zebra = (props: any) => (
  <CartoonSVG {...props}>
    <circle cx="50" cy="55" r="26" fill="#FFF" />
    <ellipse cx="50" cy="65" rx="10" ry="6" fill="#E0E0E0" />
    <circle cx="40" cy="48" r="3.5" fill="#2F3640" stroke="none" />
    <circle cx="60" cy="48" r="3.5" fill="#2F3640" stroke="none" />
    {/* Black stripes */}
    <path d="M 24 55 Q 36 55 34 50 L 24 48 Z" fill="#2F3640" stroke="none" />
    <path d="M 76 55 Q 64 55 66 50 L 76 48 Z" fill="#2F3640" stroke="none" />
    <path d="M 24 64 Q 38 64 36 60 L 24 58 Z" fill="#2F3640" stroke="none" />
    <path d="M 76 64 Q 62 64 64 60 L 76 58 Z" fill="#2F3640" stroke="none" />
  </CartoonSVG>
);

export const objectDictionary: Record<string, { name: string, icon: React.FC<any> }> = {
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
