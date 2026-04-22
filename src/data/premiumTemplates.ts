/**
 * Premium coloring templates — detailed line art with many fillable regions.
 * All original work. viewBox 0 0 400 520 to fill the 400×520 canvas.
 * Stroke-only, no fills, designed for the layered canvas fill tool.
 */

import type { ColoringTemplate } from './coloringData';

export const premiumTemplates: ColoringTemplate[] = [
  {
    id: 'detailed-butterfly',
    title: 'Detailed Butterfly',
    emoji: '🦋',
    category: 'animals',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="200" cy="260" rx="6" ry="40" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="130" cy="220" rx="70" ry="55" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="270" cy="220" rx="70" ry="55" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="140" cy="310" rx="55" ry="45" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="260" cy="310" rx="55" ry="45" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="130" cy="220" rx="40" ry="30" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="270" cy="220" rx="40" ry="30" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="130" cy="220" rx="18" ry="14" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="270" cy="220" rx="18" ry="14" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="140" cy="310" rx="28" ry="22" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="260" cy="310" rx="28" ry="22" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="100" cy="195" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="160" cy="195" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="240" cy="195" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="300" cy="195" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="120" cy="245" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="280" cy="245" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M190 220 Q180 190 170 160 Q165 145 155 140" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M210 220 Q220 190 230 160 Q235 145 245 140" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="152" cy="136" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="248" cy="136" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M80 200 Q90 180 110 190" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M320 200 Q310 180 290 190" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M80 240 Q90 260 110 250" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M320 240 Q310 260 290 250" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M100 290 Q110 275 130 280" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M300 290 Q290 275 270 280" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M100 330 Q110 350 130 340" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M300 330 Q290 350 270 340" fill="none" stroke="#333" stroke-width="1.5"/>
      <line x1="30" y1="460" x2="370" y2="460" stroke="#333" stroke-width="1.5"/>
      <path d="M100 460 Q110 440 120 460 Q130 480 140 460" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M220 460 Q230 440 240 460 Q250 480 260 460" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'garden-scene',
    title: 'Garden Scene',
    emoji: '🌻',
    category: 'nature',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="400" x2="370" y2="400" stroke="#333" stroke-width="2"/>
      <rect x="80" y="350" width="8" height="50" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="84" cy="310" r="25" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="84" cy="310" r="12" fill="none" stroke="#333" stroke-width="2"/>
      ${[0,45,90,135,180,225,270,315].map(a => `<ellipse cx="${84+22*Math.cos(a*Math.PI/180)}" cy="${310+22*Math.sin(a*Math.PI/180)}" rx="10" ry="6" fill="none" stroke="#333" stroke-width="1.5" transform="rotate(${a} ${84+22*Math.cos(a*Math.PI/180)} ${310+22*Math.sin(a*Math.PI/180)})"/>`).join('')}
      <rect x="200" y="320" width="6" height="80" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="203" cy="270" r="30" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="203" cy="270" r="15" fill="none" stroke="#333" stroke-width="2"/>
      ${[0,36,72,108,144,180,216,252,288,324].map(a => `<ellipse cx="${203+26*Math.cos(a*Math.PI/180)}" cy="${270+26*Math.sin(a*Math.PI/180)}" rx="12" ry="6" fill="none" stroke="#333" stroke-width="1.5" transform="rotate(${a} ${203+26*Math.cos(a*Math.PI/180)} ${270+26*Math.sin(a*Math.PI/180)})"/>`).join('')}
      <rect x="310" y="340" width="7" height="60" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="313" cy="300" r="22" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="313" cy="300" r="10" fill="none" stroke="#333" stroke-width="2"/>
      ${[0,60,120,180,240,300].map(a => `<ellipse cx="${313+19*Math.cos(a*Math.PI/180)}" cy="${300+19*Math.sin(a*Math.PI/180)}" rx="9" ry="5" fill="none" stroke="#333" stroke-width="1.5" transform="rotate(${a} ${313+19*Math.cos(a*Math.PI/180)} ${300+19*Math.sin(a*Math.PI/180)})"/>`).join('')}
      <ellipse cx="84" cy="360" rx="12" ry="6" fill="none" stroke="#333" stroke-width="1.5" transform="rotate(-20 84 360)"/>
      <ellipse cx="203" cy="350" rx="14" ry="7" fill="none" stroke="#333" stroke-width="1.5" transform="rotate(15 203 350)"/>
      <ellipse cx="313" cy="355" rx="10" ry="5" fill="none" stroke="#333" stroke-width="1.5" transform="rotate(-15 313 355)"/>
      <path d="M30 400 Q80 390 130 400 Q180 410 230 400 Q280 390 330 400 Q355 410 370 400" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="40" y="420" width="60" height="8" rx="3" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="100" r="45" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="100" r="36" fill="none" stroke="#333" stroke-width="1.5"/>
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<line x1="${200+38*Math.cos(a*Math.PI/180)}" y1="${100+38*Math.sin(a*Math.PI/180)}" x2="${200+50*Math.cos(a*Math.PI/180)}" y2="${100+50*Math.sin(a*Math.PI/180)}" stroke="#333" stroke-width="2" stroke-linecap="round"/>`).join('')}
      <ellipse cx="50" cy="120" rx="30" ry="14" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="38" cy="124" rx="20" ry="10" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="340" cy="90" rx="28" ry="13" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M60 460 Q70 445 80 460 Q90 475 100 460" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M300 460 Q310 445 320 460 Q330 475 340 460" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'detailed-fish',
    title: 'Tropical Fish',
    emoji: '🐠',
    category: 'animals',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="180" cy="260" rx="120" ry="80" fill="none" stroke="#333" stroke-width="3"/>
      <polygon points="300,260 370,190 370,330" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="110" cy="235" r="18" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="113" cy="232" r="8" fill="#333"/>
      <circle cx="116" cy="229" r="3" fill="white"/>
      <path d="M80 270 Q100 285 120 270" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M140 180 Q170 150 200 180" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M120 340 Q160 380 200 340" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M140 200 Q160 210 180 200" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M160 220 Q180 230 200 220" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M120 240 Q150 250 180 240" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M140 260 Q170 270 200 260" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M120 280 Q150 290 180 280" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M140 300 Q170 310 200 300" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M160 320 Q180 325 200 320" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="240" cy="230" rx="15" ry="10" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="250" cy="260" rx="12" ry="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="240" cy="290" rx="15" ry="10" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="80" cy="120" r="6" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="320" cy="100" r="8" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="50" cy="380" r="5" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="340" cy="420" r="7" fill="none" stroke="#333" stroke-width="1"/>
      <path d="M40 440 Q50 420 60 440 Q70 460 80 440" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M300 440 Q310 425 320 440 Q330 455 340 440" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M160 450 Q170 435 180 450 Q190 465 200 450" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'cozy-house',
    title: 'Cozy House',
    emoji: '🏡',
    category: 'nature',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <rect x="80" y="220" width="240" height="200" fill="none" stroke="#333" stroke-width="3"/>
      <polygon points="60,225 200,100 340,225" fill="none" stroke="#333" stroke-width="3"/>
      <rect x="165" y="320" width="60" height="100" rx="4" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="215" cy="375" r="5" fill="#333"/>
      <rect x="100" y="260" width="50" height="45" rx="3" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="125" y1="260" x2="125" y2="305" stroke="#333" stroke-width="2"/>
      <line x1="100" y1="282" x2="150" y2="282" stroke="#333" stroke-width="2"/>
      <rect x="250" y="260" width="50" height="45" rx="3" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="275" y1="260" x2="275" y2="305" stroke="#333" stroke-width="2"/>
      <line x1="250" y1="282" x2="300" y2="282" stroke="#333" stroke-width="2"/>
      <rect x="260" y="140" width="25" height="80" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="272" cy="135" rx="15" ry="8" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M258 135 Q262 120 268 125 Q272 115 278 125 Q282 118 288 135" fill="none" stroke="#333" stroke-width="1.5"/>
      <line x1="30" y1="420" x2="370" y2="420" stroke="#333" stroke-width="2"/>
      <rect x="30" y="370" width="40" height="50" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="33" y="373" width="34" height="14" rx="2" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="33" y="390" width="34" height="14" rx="2" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="33" y="407" width="34" height="10" rx="2" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M50 370 Q55 355 60 370" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="340" cy="70" r="30" fill="none" stroke="#333" stroke-width="2"/>
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<line x1="${340+28*Math.cos(a*Math.PI/180)}" y1="${70+28*Math.sin(a*Math.PI/180)}" x2="${340+38*Math.cos(a*Math.PI/180)}" y2="${70+38*Math.sin(a*Math.PI/180)}" stroke="#333" stroke-width="2" stroke-linecap="round"/>`).join('')}
      <rect x="340" y="420" width="30" height="50" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="355" cy="410" rx="20" ry="18" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="350" cy="416" rx="12" ry="12" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="360" cy="412" rx="12" ry="12" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M30 470 Q80 455 130 465 Q180 475 230 465 Q280 455 330 465 Q355 470 370 465" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'princess-crown',
    title: 'Royal Crown',
    emoji: '👑',
    category: 'fantasy',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 350 L60 200 L120 280 L200 140 L280 280 L340 200 L340 350Z" fill="none" stroke="#333" stroke-width="3"/>
      <rect x="60" y="345" width="280" height="40" rx="4" fill="none" stroke="#333" stroke-width="3"/>
      <rect x="55" y="380" width="290" height="20" rx="4" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="60" cy="200" r="12" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="200" cy="140" r="14" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="340" cy="200" r="12" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="120" cy="280" r="10" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="280" cy="280" r="10" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="130" cy="365" rx="16" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="200" cy="365" rx="18" ry="14" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="270" cy="365" rx="16" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M80 240 Q100 250 120 240" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M280 240 Q300 250 320 240" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M140 220 Q170 200 200 220" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M200 220 Q230 200 260 220" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="100" cy="310" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="160" cy="320" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="310" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="240" cy="320" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="300" cy="310" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="100" cy="80" r="4" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="300" cy="90" r="5" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="200" cy="70" r="3" fill="none" stroke="#333" stroke-width="1"/>
      <ellipse cx="200" cy="460" rx="120" ry="15" fill="none" stroke="#333" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'owl-night',
    title: 'Night Owl',
    emoji: '🦉',
    category: 'animals',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="200" cy="280" rx="90" ry="110" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="160" cy="230" r="35" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="240" cy="230" r="35" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="160" cy="230" r="20" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="240" cy="230" r="20" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="160" cy="230" r="10" fill="#333"/>
      <circle cx="240" cy="230" r="10" fill="#333"/>
      <circle cx="164" cy="225" r="4" fill="white"/>
      <circle cx="244" cy="225" r="4" fill="white"/>
      <polygon points="200,260 185,290 215,290" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M130 175 Q150 140 170 170" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M230 170 Q250 140 270 175" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M110 280 Q85 260 75 290 Q65 310 90 300" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M290 280 Q315 260 325 290 Q335 310 310 300" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M150 330 Q165 345 180 330 Q190 345 200 330" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M200 330 Q210 345 220 330 Q235 345 250 330" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M140 360 Q160 375 180 360 Q195 375 210 360" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M190 360 Q210 375 230 360 Q245 375 260 360" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="155" cy="400" rx="20" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="245" cy="400" rx="20" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="145" y1="408" x2="140" y2="420" stroke="#333" stroke-width="2"/>
      <line x1="155" y1="412" x2="155" y2="425" stroke="#333" stroke-width="2"/>
      <line x1="165" y1="408" x2="170" y2="420" stroke="#333" stroke-width="2"/>
      <line x1="235" y1="408" x2="230" y2="420" stroke="#333" stroke-width="2"/>
      <line x1="245" y1="412" x2="245" y2="425" stroke="#333" stroke-width="2"/>
      <line x1="255" y1="408" x2="260" y2="420" stroke="#333" stroke-width="2"/>
      <rect x="160" y="430" width="80" height="15" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="80" cy="100" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="320" cy="80" r="6" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="50" cy="180" r="5" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="350" cy="160" r="7" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="200" cy="60" r="25" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="210" cy="55" r="25" fill="none" stroke="#333" stroke-width="0" fill="#FFF"/>
    </svg>`,
  },
  {
    id: 'ice-cream-truck',
    title: 'Ice Cream Truck',
    emoji: '🍦',
    category: 'food',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <rect x="60" y="180" width="280" height="180" rx="8" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M60 180 Q60 130 110 130 L290 130 Q340 130 340 180" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="80" y="150" width="80" height="50" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="240" y="150" width="80" height="50" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="120" cy="380" r="30" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="120" cy="380" r="15" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="280" cy="380" r="30" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="280" cy="380" r="15" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="100" y="220" width="70" height="60" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M110 220 Q135 200 160 220" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="135" cy="250" r="15" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M135 235 L135 240 L128 245 L142 245Z" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="190" y="220" width="130" height="100" rx="4" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="190" y1="260" x2="320" y2="260" stroke="#333" stroke-width="1.5"/>
      <line x1="190" y1="290" x2="320" y2="290" stroke="#333" stroke-width="1.5"/>
      <path d="M200 100 Q200 70 220 70 Q230 50 240 70 Q260 70 260 100" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="210" y="95" width="40" height="35" rx="2" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="30" y1="410" x2="370" y2="410" stroke="#333" stroke-width="2"/>
      <path d="M30 460 Q100 445 200 455 Q300 465 370 450" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'mermaid-scene',
    title: 'Mermaid',
    emoji: '🧜‍♀️',
    category: 'fantasy',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="120" r="40" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M170 100 Q160 60 175 50 Q190 45 195 70" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M230 100 Q240 60 225 50 Q210 45 205 70" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M160 105 Q140 90 130 110 Q125 130 145 130" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M240 105 Q260 90 270 110 Q275 130 255 130" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="185" cy="115" r="5" fill="#333"/><circle cx="215" cy="115" r="5" fill="#333"/>
      <circle cx="187" cy="113" r="2" fill="white"/><circle cx="217" cy="113" r="2" fill="white"/>
      <path d="M193 135 Q200 140 207 135" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M175 160 Q200 170 225 160 L220 250 Q200 260 180 250Z" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M180 250 Q170 300 160 340 Q140 380 120 400 Q100 410 110 390 Q115 375 130 360" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M220 250 Q230 300 240 340 Q260 380 280 400 Q300 410 290 390 Q285 375 270 360" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M120 400 Q100 420 80 410 Q70 400 90 395" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M280 400 Q300 420 320 410 Q330 400 310 395" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M185 200 Q180 210 185 220" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M195 190 Q190 200 195 210" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M205 195 Q200 205 205 215" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M215 200 Q210 210 215 220" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="60" cy="300" r="5" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="340" cy="280" r="6" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="80" cy="200" r="4" fill="none" stroke="#333" stroke-width="1"/>
      <path d="M30 450 Q100 435 200 445 Q300 455 370 440" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M30 475 Q120 460 200 470 Q280 480 370 465" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M40 430 Q50 415 60 430 Q70 445 80 430" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M300 430 Q310 415 320 430 Q330 445 340 430" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'geometric-star',
    title: 'Geometric Star',
    emoji: '⭐',
    category: 'patterns',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      ${[0,1,2,3,4,5].map(i => {
        const a1 = (i * 60 - 90) * Math.PI / 180;
        const a2 = ((i+1) * 60 - 90) * Math.PI / 180;
        return `<line x1="${200+180*Math.cos(a1)}" y1="${260+180*Math.sin(a1)}" x2="${200+180*Math.cos(a2)}" y2="${260+180*Math.sin(a2)}" stroke="#333" stroke-width="2.5"/>`;
      }).join('')}
      ${[0,1,2,3,4,5].map(i => {
        const a1 = (i * 60 - 60) * Math.PI / 180;
        const a2 = ((i+1) * 60 - 60) * Math.PI / 180;
        return `<line x1="${200+130*Math.cos(a1)}" y1="${260+130*Math.sin(a1)}" x2="${200+130*Math.cos(a2)}" y2="${260+130*Math.sin(a2)}" stroke="#333" stroke-width="2"/>`;
      }).join('')}
      <circle cx="200" cy="260" r="180" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="200" cy="260" r="130" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="260" r="80" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="260" r="40" fill="none" stroke="#333" stroke-width="2"/>
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<line x1="${200+40*Math.cos(a*Math.PI/180)}" y1="${260+40*Math.sin(a*Math.PI/180)}" x2="${200+80*Math.cos(a*Math.PI/180)}" y2="${260+80*Math.sin(a*Math.PI/180)}" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[0,60,120,180,240,300].map(a => `<circle cx="${200+105*Math.cos(a*Math.PI/180)}" cy="${260+105*Math.sin(a*Math.PI/180)}" r="15" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[30,90,150,210,270,330].map(a => `<circle cx="${200+155*Math.cos(a*Math.PI/180)}" cy="${260+155*Math.sin(a*Math.PI/180)}" r="10" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
    </svg>`,
  },
  {
    id: 'cute-puppy',
    title: 'Cute Puppy',
    emoji: '🐶',
    category: 'animals',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="200" cy="300" rx="110" ry="90" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="200" cy="180" r="70" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M140 140 Q110 80 90 110 Q80 140 100 160 Q115 165 130 155" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M260 140 Q290 80 310 110 Q320 140 300 160 Q285 165 270 155" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="175" cy="170" r="14" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="225" cy="170" r="14" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="178" cy="167" r="7" fill="#333"/>
      <circle cx="228" cy="167" r="7" fill="#333"/>
      <circle cx="181" cy="164" r="3" fill="white"/>
      <circle cx="231" cy="164" r="3" fill="white"/>
      <ellipse cx="200" cy="200" rx="14" ry="10" fill="#333"/>
      <path d="M186 210 Q200 230 214 210" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M200 210 L200 225" stroke="#333" stroke-width="2"/>
      <ellipse cx="200" cy="230" rx="20" ry="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="120" cy="400" rx="25" ry="15" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="280" cy="400" rx="25" ry="15" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M305 290 Q340 280 335 310 Q330 340 305 325" fill="none" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="200" cy="420" rx="80" ry="12" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'hot-air-balloon',
    title: 'Hot Air Balloon',
    emoji: '🎈',
    category: 'vehicles',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="200" cy="180" rx="110" ry="140" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M90 180 Q90 320 160 350 L240 350 Q310 320 310 180" fill="none" stroke="#333" stroke-width="0"/>
      <path d="M140 310 Q170 340 200 345 Q230 340 260 310" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="155" y1="340" x2="160" y2="390" stroke="#333" stroke-width="2"/>
      <line x1="245" y1="340" x2="240" y2="390" stroke="#333" stroke-width="2"/>
      <line x1="200" y1="345" x2="200" y2="395" stroke="#333" stroke-width="2"/>
      <rect x="155" y="390" width="90" height="50" rx="6" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="155" y1="415" x2="245" y2="415" stroke="#333" stroke-width="1.5"/>
      <path d="M200 40 L200 320" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M90 180 Q110 40 200 40 Q290 40 310 180" fill="none" stroke="#333" stroke-width="0"/>
      <path d="M130 60 Q165 40 200 60 Q235 40 270 60" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M110 100 Q155 80 200 100 Q245 80 290 100" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M95 150 Q148 130 200 150 Q252 130 305 150" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M92 200 Q146 180 200 200 Q254 180 308 200" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M100 250 Q150 230 200 250 Q250 230 300 250" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="60" cy="350" rx="25" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="45" cy="354" rx="16" ry="8" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="340" cy="300" rx="22" ry="10" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M30 480 Q100 465 200 475 Q300 485 370 470" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'underwater-castle',
    title: 'Underwater Castle',
    emoji: '🏰',
    category: 'fantasy',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 50 Q100 30 200 50 Q300 70 400 45" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="130" y="200" width="140" height="200" fill="none" stroke="#333" stroke-width="3"/>
      <rect x="70" y="160" width="45" height="240" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="285" y="160" width="45" height="240" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="70,160 92,110 115,160" fill="none" stroke="#333" stroke-width="2"/>
      <polygon points="285,160 307,110 330,160" fill="none" stroke="#333" stroke-width="2"/>
      <polygon points="130,200 200,140 270,200" fill="none" stroke="#333" stroke-width="2.5"/>
      <rect x="180" y="330" width="40" height="70" rx="20" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="210" cy="365" r="4" fill="#333"/>
      <rect x="150" y="230" width="25" height="30" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="225" y="230" width="25" height="30" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="175" r="15" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M40 420 Q50 400 60 420 Q70 440 80 420" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M320 430 Q330 410 340 430 Q350 450 360 430" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M150 440 Q160 425 170 440 Q180 455 190 440" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="50" cy="300" rx="25" ry="15" fill="none" stroke="#333" stroke-width="2"/>
      <polygon points="75,300 95,285 95,315" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="42" cy="295" r="4" fill="#333"/>
      <ellipse cx="350" cy="250" rx="20" ry="12" fill="none" stroke="#333" stroke-width="2"/>
      <polygon points="370,250 385,240 385,260" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="343" cy="247" r="3" fill="#333"/>
      <circle cx="100" cy="100" r="4" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="300" cy="80" r="5" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="200" cy="470" r="6" fill="none" stroke="#333" stroke-width="1"/>
      <path d="M30 480 Q100 465 200 475 Q300 485 370 470" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
];
