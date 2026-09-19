import { SVGProps } from 'react';

export default function HealthyVegetableIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 500 400" className={`w-full h-auto drop-shadow-xl ${props.className || ''}`} aria-label="Fresh healthy vegetables illustration" role="img" {...props}>
      {/* Soft warm background organic shape */}
      <path 
        d="M60,180 C30,90 180,30 300,50 C420,70 480,180 430,280 C380,380 150,370 80,280 C30,220 70,220 60,180 Z" 
        fill="#eef4df" 
        opacity="0.8"
      />
      
      {/* Decorative leaf/vine background */}
      <path d="M120,280 Q80,200 150,150" stroke="#cde0b4" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M380,120 Q420,200 350,280" stroke="#cde0b4" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* Carrot */}
      <g transform="translate(320, 100) rotate(25)">
        <path d="M0,0 Q25,-15 50,0 L40,150 Q25,165 10,150 Z" fill="#d97755" />
        <path d="M20,-5 Q25,-35 10,-45 M30,-2 Q40,-30 50,-35" stroke="#195d44" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M5,25 L45,35 M8,65 L38,75 M12,105 L32,110" stroke="#c45a48" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M10,0 L15,150" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.2" />
      </g>

      {/* Cucumber / Zucchini */}
      <g transform="translate(80, 120) rotate(-15)">
        <rect x="0" y="0" width="50" height="160" rx="25" fill="#58a474" />
        <line x1="15" y1="30" x2="15" y2="130" stroke="#315d43" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" opacity="0.5" />
        <line x1="35" y1="30" x2="35" y2="130" stroke="#315d43" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" opacity="0.5" />
        <path d="M5,25 L5,135" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.2" />
      </g>

      {/* Large Tomato */}
      <g transform="translate(140, 200)">
        <circle cx="70" cy="70" r="65" fill="#e06b3f" />
        {/* Tomato stem */}
        <path d="M70,5 C55,30 35,25 25,5 C35,30 20,45 5,40 C30,45 45,65 60,55 C65,65 75,65 80,55 C95,65 110,45 135,40 C120,45 105,30 115,5 C105,25 85,30 70,5 Z" fill="#195d44" />
        {/* Tomato highlight */}
        <path d="M105,40 A40,40 0 0,1 115,90" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.3" />
      </g>

      {/* Broccoli */}
      <g transform="translate(240, 150)">
        {/* Stem */}
        <path d="M50,150 L50,80 L20,40 M50,100 L80,50" stroke="#35674b" strokeWidth="18" fill="none" strokeLinecap="round" />
        {/* Florets */}
        <circle cx="20" cy="40" r="35" fill="#195d44" />
        <circle cx="65" cy="25" r="40" fill="#195d44" />
        <circle cx="105" cy="55" r="35" fill="#195d44" />
        <circle cx="60" cy="65" r="35" fill="#195d44" />
        {/* Texture */}
        <circle cx="30" cy="30" r="14" fill="#35674b" opacity="0.6"/>
        <circle cx="70" cy="15" r="16" fill="#35674b" opacity="0.6"/>
        <circle cx="95" cy="50" r="14" fill="#35674b" opacity="0.6"/>
      </g>

      {/* Scattered leaves */}
      <path d="M380,250 Q350,230 330,260 Q340,290 380,250 Z" fill="#6e9541" />
      <path d="M410,310 Q450,290 470,330 Q460,360 410,310 Z" fill="#6e9541" />
      <path d="M60,340 Q30,320 10,350 Q30,380 60,340 Z" fill="#6e9541" opacity="0.8"/>
      
      {/* Decorative stars/dots */}
      <circle cx="100" cy="80" r="5" fill="#e06b3f" opacity="0.6" />
      <circle cx="420" cy="120" r="6" fill="#e06b3f" opacity="0.6" />
      <circle cx="350" cy="340" r="4" fill="#d97755" opacity="0.6" />
    </svg>
  );
}
