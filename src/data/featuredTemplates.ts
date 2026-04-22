/**
 * Featured coloring templates — art-directed scene-based pages.
 * Each template has: subject + setting + decorative regions.
 * Quality standard: looks like a page from a real kids coloring book.
 * viewBox 0 0 400 520, ~30px safe padding, fill="#fff" for layering.
 */

import type { ColoringTemplate } from './coloringData';

export const featuredTemplates: ColoringTemplate[] = [
  // ── 1. Cat with Yarn Scene ──────────────────────────────
  {
    id: 'ft-cat-yarn',
    title: 'Cat & Yarn',
    emoji: '',
    category: 'animals',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <!-- Floor -->
      <line x1="30" y1="440" x2="370" y2="440" stroke="#333" stroke-width="2"/>
      <!-- Rug -->
      <ellipse cx="200" cy="430" rx="120" ry="25" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="200" cy="430" rx="90" ry="18" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="200" cy="430" rx="55" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Cat body -->
      <ellipse cx="180" cy="340" rx="70" ry="55" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Cat head -->
      <circle cx="180" cy="240" r="55" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Ears -->
      <polygon points="138,195 125,140 158,182" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <polygon points="222,195 235,140 202,182" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Inner ears -->
      <polygon points="140,192 130,155 154,184" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <polygon points="220,192 230,155 206,184" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Eyes -->
      <ellipse cx="158" cy="235" rx="12" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="202" cy="235" rx="12" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="160" cy="232" r="6" fill="#333"/>
      <circle cx="204" cy="232" r="6" fill="#333"/>
      <circle cx="162" cy="229" r="2.5" fill="#fff"/>
      <circle cx="206" cy="229" r="2.5" fill="#fff"/>
      <!-- Nose & mouth -->
      <ellipse cx="180" cy="258" rx="6" ry="4" fill="#333"/>
      <path d="M174 264 Q180 275 186 264" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="180" y1="262" x2="180" y2="270" stroke="#333" stroke-width="1.5"/>
      <!-- Whiskers -->
      <line x1="145" y1="255" x2="100" y2="248" stroke="#333" stroke-width="1.5"/>
      <line x1="145" y1="262" x2="100" y2="265" stroke="#333" stroke-width="1.5"/>
      <line x1="215" y1="255" x2="260" y2="248" stroke="#333" stroke-width="1.5"/>
      <line x1="215" y1="262" x2="260" y2="265" stroke="#333" stroke-width="1.5"/>
      <!-- Tail -->
      <path d="M245 345 Q290 320 285 280 Q280 250 300 240" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Front paws -->
      <ellipse cx="140" cy="395" rx="22" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="220" cy="395" rx="22" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Toe beans -->
      <circle cx="132" cy="393" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="142" cy="390" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="152" cy="393" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Yarn ball -->
      <circle cx="310" cy="370" r="35" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M285 355 Q310 340 335 355 Q320 370 295 365" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M290 380 Q310 395 330 380 Q320 365 300 370" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M295 350 Q315 360 325 345" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Yarn string to paw -->
      <path d="M275 370 Q250 380 225 395" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Stars -->
      <circle cx="60" cy="100" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="330" cy="80" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="50" cy="170" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Fish bowl on shelf -->
      <rect x="30" y="120" width="80" height="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M50 120 Q40 80 60 70 Q80 80 70 120" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="60" cy="95" rx="8" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 2. Dog with Ball & Bone ─────────────────────────────
  {
    id: 'ft-dog-park',
    title: 'Puppy in Park',
    emoji: '',
    category: 'animals',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <!-- Ground & sky -->
      <path d="M0 400 Q100 385 200 395 Q300 405 400 390" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Sun -->
      <circle cx="340" cy="60" r="30" fill="#fff" stroke="#333" stroke-width="2"/>
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<line x1="${340+28*Math.cos(a*Math.PI/180)}" y1="${60+28*Math.sin(a*Math.PI/180)}" x2="${340+40*Math.cos(a*Math.PI/180)}" y2="${60+40*Math.sin(a*Math.PI/180)}" stroke="#333" stroke-width="2" stroke-linecap="round"/>`).join('')}
      <!-- Cloud -->
      <ellipse cx="100" cy="70" rx="35" ry="16" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="80" cy="75" rx="22" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="120" cy="75" rx="22" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Dog body -->
      <ellipse cx="200" cy="300" rx="80" ry="60" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Dog head -->
      <circle cx="200" cy="200" r="55" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Floppy ears -->
      <path d="M150 185 Q115 170 105 210 Q100 245 125 240 Q140 235 148 215" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M250 185 Q285 170 295 210 Q300 245 275 240 Q260 235 252 215" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Eyes -->
      <circle cx="178" cy="195" r="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="222" cy="195" r="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="180" cy="192" r="6" fill="#333"/>
      <circle cx="224" cy="192" r="6" fill="#333"/>
      <circle cx="182" cy="189" r="2.5" fill="#fff"/>
      <circle cx="226" cy="189" r="2.5" fill="#fff"/>
      <!-- Nose -->
      <ellipse cx="200" cy="220" rx="10" ry="7" fill="#333"/>
      <!-- Mouth -->
      <path d="M190 228 Q200 240 210 228" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="200" y1="227" x2="200" y2="234" stroke="#333" stroke-width="1.5"/>
      <!-- Tongue -->
      <ellipse cx="200" cy="240" rx="8" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Legs -->
      <rect x="140" y="350" width="22" height="45" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="175" y="350" width="22" height="45" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="215" y="350" width="22" height="45" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="250" y="350" width="22" height="45" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Tail wagging -->
      <path d="M275 285 Q310 260 305 230 Q300 215 315 205" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Ball -->
      <circle cx="80" cy="370" r="22" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M65 360 Q80 348 95 360" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M65 380 Q80 392 95 380" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Bone -->
      <rect x="300" y="410" width="55" height="12" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="300" cy="410" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="300" cy="422" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="355" cy="410" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="355" cy="422" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Paw prints -->
      <circle cx="50" cy="430" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="46" cy="420" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="54" cy="420" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="130" cy="450" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="126" cy="440" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="134" cy="440" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Tree -->
      <rect x="35" y="220" width="14" height="80" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="42" cy="200" r="35" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="28" cy="210" r="25" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="56" cy="208" r="25" fill="#fff" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 3. Bunny Carrot Garden ──────────────────────────────
  {
    id: 'ft-bunny-garden',
    title: 'Bunny Garden',
    emoji: '',
    category: 'animals',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="420" x2="370" y2="420" stroke="#333" stroke-width="2"/>
      <!-- Sun -->
      <circle cx="60" cy="60" r="28" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Fence -->
      <line x1="30" y1="350" x2="370" y2="350" stroke="#333" stroke-width="2"/>
      <line x1="30" y1="370" x2="370" y2="370" stroke="#333" stroke-width="2"/>
      ${[50,100,150,200,250,300,350].map(x => `<rect x="${x-5}" y="330" width="10" height="60" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
      <!-- Bunny body -->
      <ellipse cx="200" cy="280" rx="55" ry="50" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Bunny head -->
      <circle cx="200" cy="200" r="45" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Long ears -->
      <ellipse cx="175" cy="125" rx="14" ry="50" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="225" cy="125" rx="14" ry="50" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Inner ears -->
      <ellipse cx="175" cy="125" rx="8" ry="38" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="225" cy="125" rx="8" ry="38" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Eyes -->
      <circle cx="182" cy="195" r="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="218" cy="195" r="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="183" cy="193" r="4" fill="#333"/>
      <circle cx="219" cy="193" r="4" fill="#333"/>
      <!-- Nose & mouth -->
      <ellipse cx="200" cy="215" rx="5" ry="3.5" fill="#333"/>
      <path d="M195 220 Q200 228 205 220" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Cheeks -->
      <circle cx="172" cy="212" r="6" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="228" cy="212" r="6" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Fluffy tail -->
      <circle cx="252" cy="290" r="15" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Paws -->
      <ellipse cx="165" cy="325" rx="18" ry="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="235" cy="325" rx="18" ry="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Carrot in paw -->
      <polygon points="160,310 140,280 165,305" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M140,280 Q135,270 145,268" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M140,280 Q148,272 150,265" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Garden carrots -->
      ${[70,120,310,350].map(x => `<g><polygon points="${x},420 ${x-8},385 ${x+8},385" fill="#fff" stroke="#333" stroke-width="2"/><path d="M${x-8},385 Q${x-12},375 ${x-4},372" fill="none" stroke="#333" stroke-width="1.5"/><path d="M${x+2},383 Q${x+8},370 ${x+12},375" fill="none" stroke="#333" stroke-width="1.5"/></g>`).join('')}
      <!-- Flowers -->
      ${[55,340].map(x => `<g><line x1="${x}" y1="420" x2="${x}" y2="395" stroke="#333" stroke-width="1.5"/><circle cx="${x}" cy="390" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="${x}" cy="390" r="4" fill="#fff" stroke="#333" stroke-width="1"/></g>`).join('')}
      <!-- Butterfly -->
      <ellipse cx="300" cy="160" rx="1.5" ry="6" fill="#333"/>
      <ellipse cx="292" cy="155" rx="8" ry="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="308" cy="155" rx="8" ry="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="294" cy="164" rx="6" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="306" cy="164" rx="6" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 4. Unicorn with Rainbow & Clouds ────────────────────
  {
    id: 'ft-unicorn-rainbow',
    title: 'Unicorn Rainbow',
    emoji: '',
    category: 'fantasy',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <!-- Rainbow arcs -->
      ${[{r:160,y:180},{r:145,y:180},{r:130,y:180},{r:115,y:180},{r:100,y:180}].map(({r,y}) => `<path d="M${200-r} ${y+r} A${r} ${r} 0 0 1 ${200+r} ${y+r}" fill="none" stroke="#333" stroke-width="5"/>`).join('')}
      <!-- Clouds -->
      <ellipse cx="70" cy="340" rx="35" ry="18" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="50" cy="345" rx="22" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="90" cy="345" rx="22" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="330" cy="340" rx="35" ry="18" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="310" cy="345" rx="22" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="350" cy="345" rx="22" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Unicorn body -->
      <ellipse cx="200" cy="380" rx="75" ry="50" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Legs -->
      <rect x="145" y="420" width="18" height="50" rx="6" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="175" y="420" width="18" height="50" rx="6" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="215" y="420" width="18" height="50" rx="6" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="245" y="420" width="18" height="50" rx="6" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Neck & head -->
      <path d="M145 365 Q130 320 140 280" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M180 355 Q165 310 160 280" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="145" cy="265" r="35" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Horn -->
      <polygon points="140,230 135,175 150,225" fill="#fff" stroke="#333" stroke-width="2"/>
      <line x1="137" y1="215" x2="147" y2="218" stroke="#333" stroke-width="1.5"/>
      <line x1="136" y1="205" x2="146" y2="208" stroke="#333" stroke-width="1.5"/>
      <line x1="135" y1="195" x2="144" y2="198" stroke="#333" stroke-width="1.5"/>
      <!-- Ear -->
      <ellipse cx="160" cy="238" rx="8" ry="15" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Eye -->
      <circle cx="132" cy="262" r="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="133" cy="260" r="4" fill="#333"/>
      <circle cx="135" cy="258" r="1.5" fill="#fff"/>
      <!-- Mane sections -->
      <path d="M160 245 Q175 235 170 255 Q180 250 175 270 Q185 265 180 285" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M165 280 Q180 275 175 295 Q185 290 180 310 Q190 305 185 325" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Tail -->
      <path d="M270 370 Q300 360 295 340 Q290 320 310 310 Q295 330 305 350 Q310 365 290 380" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Stars -->
      ${[[80,100],[320,120],[60,220],[340,200],[200,80]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
      <!-- Ground -->
      <path d="M30 480 Q100 470 200 475 Q300 480 370 470" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 5. Castle with Flags & Stars ────────────────────────
  {
    id: 'ft-castle-flags',
    title: 'Fairy Tale Castle',
    emoji: '',
    category: 'fantasy',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <!-- Ground -->
      <path d="M0 450 Q100 440 200 445 Q300 450 400 440" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Main building -->
      <rect x="100" y="220" width="200" height="230" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Left tower -->
      <rect x="50" y="150" width="60" height="300" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <polygon points="45,155 80,80 115,155" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Right tower -->
      <rect x="290" y="150" width="60" height="300" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <polygon points="285,155 320,80 355,155" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Center spire -->
      <polygon points="185,220 200,130 215,220" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Flags -->
      <line x1="80" y1="80" x2="80" y2="50" stroke="#333" stroke-width="2"/>
      <polygon points="80,50 105,60 80,70" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <line x1="320" y1="80" x2="320" y2="50" stroke="#333" stroke-width="2"/>
      <polygon points="320,50 345,60 320,70" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <line x1="200" y1="130" x2="200" y2="100" stroke="#333" stroke-width="2"/>
      <polygon points="200,100 225,110 200,120" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Door -->
      <rect x="170" y="360" width="60" height="90" rx="30" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="220" cy="410" r="4" fill="#333"/>
      <!-- Windows -->
      <rect x="120" y="260" width="30" height="40" rx="15" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="250" y="260" width="30" height="40" rx="15" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="180" r="18" fill="#fff" stroke="#333" stroke-width="2"/>
      <line x1="200" y1="162" x2="200" y2="198" stroke="#333" stroke-width="1.5"/>
      <line x1="182" y1="180" x2="218" y2="180" stroke="#333" stroke-width="1.5"/>
      <!-- Tower windows -->
      <rect x="65" y="200" width="20" height="25" rx="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="65" y="260" width="20" height="25" rx="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="305" y="200" width="20" height="25" rx="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="305" y="260" width="20" height="25" rx="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Battlements -->
      ${[100,120,140,160,240,260,280].map(x => `<rect x="${x}" y="214" width="12" height="12" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
      <!-- Stars -->
      ${[[30,100],[370,90],[50,60],[350,50],[200,40]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
      <!-- Flowers at base -->
      ${[130,270].map(x => `<g><line x1="${x}" y1="450" x2="${x}" y2="430" stroke="#333" stroke-width="1.5"/><circle cx="${x}" cy="425" r="7" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="${x}" cy="425" r="3" fill="#fff" stroke="#333" stroke-width="1"/></g>`).join('')}
    </svg>`,
  },

  // ── 6. Detailed Flower Mandala ──────────────────────────
  {
    id: 'ft-flower-mandala',
    title: 'Flower Mandala',
    emoji: '',
    category: 'patterns',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer circle -->
      <circle cx="200" cy="260" r="190" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="200" cy="260" r="170" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Petal ring 1 (outer) -->
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
        const cx = 200 + 145 * Math.cos(a * Math.PI / 180);
        const cy = 260 + 145 * Math.sin(a * Math.PI / 180);
        return `<ellipse cx="${cx}" cy="${cy}" rx="22" ry="10" fill="#fff" stroke="#333" stroke-width="2" transform="rotate(${a} ${cx} ${cy})"/>`;
      }).join('')}
      <!-- Circle ring -->
      <circle cx="200" cy="260" r="120" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Petal ring 2 (middle) -->
      ${[15,45,75,105,135,165,195,225,255,285,315,345].map(a => {
        const cx = 200 + 95 * Math.cos(a * Math.PI / 180);
        const cy = 260 + 95 * Math.sin(a * Math.PI / 180);
        return `<ellipse cx="${cx}" cy="${cy}" rx="18" ry="8" fill="#fff" stroke="#333" stroke-width="1.5" transform="rotate(${a} ${cx} ${cy})"/>`;
      }).join('')}
      <!-- Inner ring -->
      <circle cx="200" cy="260" r="65" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Inner petals -->
      ${[0,45,90,135,180,225,270,315].map(a => {
        const cx = 200 + 48 * Math.cos(a * Math.PI / 180);
        const cy = 260 + 48 * Math.sin(a * Math.PI / 180);
        return `<ellipse cx="${cx}" cy="${cy}" rx="15" ry="7" fill="#fff" stroke="#333" stroke-width="1.5" transform="rotate(${a} ${cx} ${cy})"/>`;
      }).join('')}
      <!-- Center -->
      <circle cx="200" cy="260" r="25" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="260" r="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Dots between petals -->
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
        const cx = 200 + 110 * Math.cos(a * Math.PI / 180);
        const cy = 260 + 110 * Math.sin(a * Math.PI / 180);
        return `<circle cx="${cx}" cy="${cy}" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>`;
      }).join('')}
    </svg>`,
  },
];
