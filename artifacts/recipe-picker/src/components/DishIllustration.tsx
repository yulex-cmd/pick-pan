import { SVGProps } from 'react';

type DishType = 'tomato-egg-rice' | 'stir-fry' | 'vegetable-bowl' | 'noodle-bowl';

interface DishIllustrationProps extends SVGProps<SVGSVGElement> {
  dish: DishType;
}

export default function DishIllustration({ dish, className, ...props }: DishIllustrationProps) {
  if (dish === 'tomato-egg-rice') {
    return (
      <svg viewBox="0 0 500 400" className={`w-full h-auto ${className || ''}`} aria-label="Tomato egg rice illustration" role="img" {...props}>
        {/* Soft abstract background blob */}
        <path d="M100,200 C50,100 200,50 350,80 C480,100 450,250 380,320 C300,400 150,350 100,200 Z" fill="#fdfaf4" opacity="0.6" />
        
        {/* Soft plate shadow */}
        <ellipse cx="250" cy="270" rx="180" ry="40" fill="#e8dfce" opacity="0.7" />
        
        {/* Plate bottom */}
        <ellipse cx="250" cy="240" rx="190" ry="70" fill="#fff" />
        <ellipse cx="250" cy="245" rx="150" ry="50" fill="#f9f4eb" />
        
        {/* Rice mound */}
        <path d="M110,210 C110,120 170,100 250,100 C330,100 390,120 390,210 C390,260 330,280 250,280 C170,280 110,260 110,210 Z" fill="#ffffff" />
        {/* Rice texture arcs */}
        <path d="M160,170 Q180,150 200,170 M230,130 Q250,110 270,130 M280,180 Q310,160 330,180 M200,230 Q220,210 240,230 M150,220 Q170,200 190,220 M300,230 Q330,210 350,230" stroke="#f6efe2" strokeWidth="4" fill="none" strokeLinecap="round" />
        
        {/* Tomato sauce puddle */}
        <path d="M130,220 C150,170 200,150 250,170 C300,190 350,200 350,240 C350,270 280,280 200,270 C140,260 110,240 130,220 Z" fill="#d97755" opacity="0.9" />

        {/* Tomato wedges */}
        <g transform="translate(180, 160) rotate(-15)">
          <path d="M0,0 C30,-20 60,-10 70,20 C80,50 50,70 20,60 C-10,50 -20,20 0,0 Z" fill="#e06b3f" />
          <path d="M10,10 A25,25 0 0,1 40,40" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.4" />
        </g>
        <g transform="translate(260, 180) rotate(25)">
          <path d="M0,0 C30,-20 60,-10 70,20 C80,50 50,70 20,60 C-10,50 -20,20 0,0 Z" fill="#c45a48" />
          <path d="M10,10 A25,25 0 0,1 40,40" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.3" />
        </g>
        <g transform="translate(150, 210) rotate(15)">
          <path d="M0,0 C25,-15 50,-5 60,20 C70,45 45,60 15,50 C-10,40 -15,15 0,0 Z" fill="#e06b3f" />
          <path d="M10,10 A20,20 0 0,1 35,35" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.4" />
        </g>

        {/* Egg curds */}
        <path d="M220,130 Q270,110 300,150 Q320,180 280,200 Q240,220 220,190 Q190,160 220,130 Z" fill="#dcae35" />
        <path d="M240,140 Q280,120 300,150 Q280,180 240,160 Q210,140 240,140 Z" fill="#eebb4d" />
        <path d="M160,180 Q200,160 230,200 Q250,230 210,250 Q170,270 150,240 Q130,210 160,180 Z" fill="#dcae35" />
        <path d="M180,190 Q210,170 230,200 Q210,230 180,210 Q160,190 180,190 Z" fill="#eebb4d" />

        {/* Scallion rings */}
        <circle cx="210" cy="180" r="7" fill="#6e9541" />
        <circle cx="210" cy="180" r="3" fill="#eef4df" />
        <circle cx="280" cy="160" r="6" fill="#58a474" />
        <circle cx="280" cy="160" r="2" fill="#cde0b4" />
        <circle cx="180" cy="240" r="8" fill="#195d44" />
        <circle cx="180" cy="240" r="4" fill="#cde0b4" />
        <circle cx="310" cy="210" r="6" fill="#6e9541" />
        <circle cx="310" cy="210" r="3" fill="#eef4df" />
        <circle cx="240" cy="250" r="5" fill="#58a474" />
        
        {/* Chopsticks resting on side */}
        <path d="M380,360 L480,100" stroke="#b8753b" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M395,365 L495,105" stroke="#b8753b" strokeWidth="8" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (dish === 'vegetable-bowl') {
    return (
      <svg viewBox="0 0 500 400" className={`w-full h-auto ${className || ''}`} aria-label="Vegetable bowl illustration" role="img" {...props}>
        {/* Soft abstract background blob */}
        <path d="M120,300 C60,200 150,80 280,120 C420,150 480,280 380,360 C300,430 180,380 120,300 Z" fill="#eef4df" opacity="0.6" />
        
        {/* Shadow */}
        <ellipse cx="250" cy="300" rx="140" ry="35" fill="#e8dfce" opacity="0.8" />
        
        {/* Bowl */}
        <path d="M100,190 C100,280 160,310 250,310 C340,310 400,280 400,190 Z" fill="#eef4df" stroke="#d7e2cb" strokeWidth="4" />
        <path d="M120,190 C120,260 170,280 250,280 C330,280 380,260 380,190 Z" fill="#edf4e4" opacity="0.5" />
        
        {/* Rim */}
        <ellipse cx="250" cy="190" rx="150" ry="30" fill="#fff" />
        <ellipse cx="250" cy="190" rx="140" ry="25" fill="#195d44" opacity="0.05" />

        {/* Greens inside */}
        <path d="M140,180 Q120,120 180,130 Q160,190 140,180 Z" fill="#58a474" />
        <path d="M180,170 Q150,110 220,120 Q200,190 180,170 Z" fill="#6e9541" />
        <path d="M220,180 Q200,110 280,120 Q260,190 220,180 Z" fill="#35674b" />
        <path d="M280,170 Q250,120 320,130 Q300,190 280,170 Z" fill="#6e9541" />
        
        {/* Tofu cubes */}
        <g transform="translate(170, 160) rotate(-10)">
          <rect x="0" y="0" width="40" height="35" rx="6" fill="#fdfaf4" />
          <rect x="5" y="5" width="30" height="25" rx="4" fill="#f6efe2" />
        </g>
        <g transform="translate(220, 140) rotate(15)">
          <rect x="0" y="0" width="40" height="35" rx="6" fill="#fdfaf4" />
          <rect x="5" y="5" width="30" height="25" rx="4" fill="#f6efe2" />
        </g>
        <g transform="translate(250, 175) rotate(-5)">
          <rect x="0" y="0" width="40" height="35" rx="6" fill="#fdfaf4" />
          <rect x="5" y="5" width="30" height="25" rx="4" fill="#f6efe2" />
        </g>

        {/* Cherry Tomatoes */}
        <g transform="translate(300, 150)">
          <circle cx="0" cy="0" r="20" fill="#e06b3f" />
          <path d="M-10,-5 A12,12 0 0,1 5,10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
        </g>
        <g transform="translate(330, 180)">
          <circle cx="0" cy="0" r="18" fill="#d97755" />
          <path d="M-8,-4 A10,10 0 0,1 4,8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
        </g>
        <g transform="translate(150, 150)">
          <circle cx="0" cy="0" r="18" fill="#c45a48" />
          <path d="M-8,-4 A10,10 0 0,1 4,8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
        </g>

        {/* Cucumber slices */}
        <g transform="translate(280, 120) rotate(20)">
          <circle cx="0" cy="0" r="22" fill="#cde0b4" />
          <circle cx="0" cy="0" r="18" fill="#58a474" />
          <circle cx="0" cy="0" r="12" fill="#cde0b4" />
        </g>
        <g transform="translate(240, 110) rotate(-15)">
          <circle cx="0" cy="0" r="22" fill="#cde0b4" />
          <circle cx="0" cy="0" r="18" fill="#58a474" />
          <circle cx="0" cy="0" r="12" fill="#cde0b4" />
        </g>

        {/* Carrot matchsticks */}
        <path d="M150,190 L200,205 L195,210 L145,195 Z" fill="#d97755" />
        <path d="M160,200 L210,215 L205,220 L155,205 Z" fill="#c45a48" />
        <path d="M170,210 L220,225 L215,230 L165,215 Z" fill="#d97755" />

        {/* Sesame seeds */}
        <circle cx="200" cy="180" r="2" fill="#fff" />
        <circle cx="210" cy="175" r="2" fill="#fff" />
        <circle cx="205" cy="190" r="2" fill="#fff" />
        <circle cx="240" cy="160" r="2" fill="#fff" />
        <circle cx="250" cy="155" r="2" fill="#fff" />
        <circle cx="245" cy="170" r="2" fill="#fff" />
      </svg>
    );
  }

  if (dish === 'noodle-bowl') {
    return (
      <svg viewBox="0 0 500 400" className={`w-full h-auto ${className || ''}`} aria-label="Noodle bowl illustration" role="img" {...props}>
        <path d="M90,240 C40,140 180,50 320,80 C470,110 500,250 400,330 C310,400 140,340 90,240 Z" fill="#f7edda" opacity="0.7" />
        <ellipse cx="250" cy="305" rx="150" ry="36" fill="#e8dfce" opacity="0.8" />
        <path d="M95,195 C95,285 155,325 250,325 C345,325 405,285 405,195 Z" fill="#fffaf1" stroke="#e4dacb" strokeWidth="4" />
        <path d="M115,195 C115,265 165,295 250,295 C335,295 385,265 385,195 Z" fill="#f4dfd3" opacity="0.55" />
        <ellipse cx="250" cy="195" rx="155" ry="32" fill="#fff" />
        <ellipse cx="250" cy="195" rx="140" ry="24" fill="#c87952" opacity="0.12" />
        <path d="M140,200 C170,230 190,175 230,210 C250,230 270,180 310,215 C340,235 360,190 380,205" stroke="#c69032" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M130,215 C165,250 195,190 235,225 C260,245 285,195 325,228 C350,248 365,205 390,218" stroke="#b8753b" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M150,230 C185,255 210,210 250,240 C280,258 300,215 340,242" stroke="#dcae35" strokeWidth="6" fill="none" strokeLinecap="round" />
        <ellipse cx="250" cy="232" rx="70" ry="18" fill="#e06b3f" opacity="0.85" />
        <ellipse cx="250" cy="228" rx="48" ry="10" fill="#fff" opacity="0.18" />
        <g transform="translate(175, 175)">
          <circle cx="0" cy="0" r="28" fill="#f6efe2" />
          <circle cx="2" cy="1" r="16" fill="#dcae35" />
          <path d="M-10,-8 A14,14 0 0,1 8,10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.45" />
        </g>
        <g transform="translate(320, 170) rotate(18)">
          <path d="M0,0 Q22,-28 48,4 Q22,22 0,0 Z" fill="#58a474" />
          <path d="M10,0 Q22,-12 36,4" stroke="#cde0b4" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(290, 155) rotate(-12)">
          <path d="M0,0 Q18,-22 40,2 Q18,18 0,0 Z" fill="#6e9541" />
        </g>
        <circle cx="210" cy="210" r="6" fill="#195d44" />
        <circle cx="210" cy="210" r="2.5" fill="#eef4df" />
        <circle cx="270" cy="205" r="5" fill="#58a474" />
        <circle cx="305" cy="220" r="5" fill="#6e9541" />
        <path d="M390,330 L470,95" stroke="#8f6e4b" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M404,335 L484,100" stroke="#8f6e4b" strokeWidth="7" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (dish === 'stir-fry') {
    return (
      <svg viewBox="0 0 500 400" className={`w-full h-auto ${className || ''}`} aria-label="Stir-fry illustration" role="img" {...props}>
        {/* Soft abstract background blob */}
        <path d="M100,280 C60,180 180,80 300,100 C450,120 480,260 400,340 C320,420 150,380 100,280 Z" fill="#fffaf1" opacity="0.8" />
        
        {/* Shadow */}
        <ellipse cx="250" cy="300" rx="160" ry="40" fill="#e8dfce" opacity="0.8" />
        
        {/* Plate / Pan */}
        <ellipse cx="250" cy="260" rx="180" ry="60" fill="#44372b" />
        <ellipse cx="250" cy="260" rx="160" ry="50" fill="#33291f" />
        <ellipse cx="250" cy="265" rx="130" ry="40" fill="#2d241b" />
        
        {/* Sauce sheen in pan */}
        <ellipse cx="250" cy="265" rx="100" ry="30" fill="#1e1812" opacity="0.5" />

        {/* Mushrooms */}
        <g transform="translate(180, 200) rotate(-20)">
          <path d="M0,0 Q30,-40 60,0 Q30,30 0,0 Z" fill="#8f6e4b" />
          <path d="M15,-5 Q30,-20 45,-5" stroke="#a3825e" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(260, 180) rotate(15)">
          <path d="M0,0 Q30,-40 60,0 Q30,30 0,0 Z" fill="#b8753b" />
          <path d="M15,-5 Q30,-20 45,-5" stroke="#cf8846" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(300, 220) rotate(45)">
          <path d="M0,0 Q30,-40 60,0 Q30,30 0,0 Z" fill="#8f6e4b" />
        </g>

        {/* Broccoli */}
        <g transform="translate(150, 230)">
          <path d="M20,30 L20,0 L0,-10 M20,10 L30,-15" stroke="#35674b" strokeWidth="12" fill="none" strokeLinecap="round" />
          <circle cx="-5" cy="-15" r="18" fill="#195d44" />
          <circle cx="15" cy="-25" r="20" fill="#195d44" />
          <circle cx="35" cy="-10" r="18" fill="#195d44" />
        </g>
        <g transform="translate(340, 240) rotate(-20)">
          <path d="M20,30 L20,0 L0,-10 M20,10 L30,-15" stroke="#35674b" strokeWidth="12" fill="none" strokeLinecap="round" />
          <circle cx="-5" cy="-15" r="18" fill="#195d44" />
          <circle cx="15" cy="-25" r="20" fill="#195d44" />
          <circle cx="35" cy="-10" r="18" fill="#195d44" />
        </g>
        <g transform="translate(240, 190) scale(0.8)">
          <path d="M20,30 L20,0 L0,-10 M20,10 L30,-15" stroke="#35674b" strokeWidth="12" fill="none" strokeLinecap="round" />
          <circle cx="-5" cy="-15" r="18" fill="#195d44" />
          <circle cx="15" cy="-25" r="20" fill="#195d44" />
          <circle cx="35" cy="-10" r="18" fill="#195d44" />
        </g>

        {/* Bell peppers */}
        <path d="M160,260 L200,270 L190,285 L150,275 Z" fill="#dcae35" />
        <path d="M280,265 L320,250 L330,265 L290,280 Z" fill="#e06b3f" />
        <path d="M200,210 L240,200 L245,215 L205,225 Z" fill="#dcae35" />

        {/* Onion wedges */}
        <path d="M230,240 Q260,220 280,250 Q250,260 230,240 Z" fill="#fdfaf4" opacity="0.8" />
        <path d="M190,260 Q220,240 240,270 Q210,280 190,260 Z" fill="#fdfaf4" opacity="0.8" />

        {/* Glossy highlights */}
        <path d="M190,220 Q220,250 250,230" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M260,210 Q280,240 310,220" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M180,250 Q210,280 250,260" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.2" />
        
        {/* Sizzling dots/stars */}
        <circle cx="140" cy="180" r="4" fill="#dcae35" opacity="0.8" />
        <circle cx="350" cy="190" r="5" fill="#e06b3f" opacity="0.8" />
        <circle cx="280" cy="140" r="3" fill="#d97755" opacity="0.8" />
      </svg>
    );
  }

  return null;
}
