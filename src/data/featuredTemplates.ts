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
    category: 'featured',
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
    category: 'featured',
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
    category: 'featured',
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
    category: 'featured',
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
    category: 'featured',
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
    category: 'featured',
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

  // ── 7. Dragon Treasure Cave ─────────────────────────────
  {
    id: 'ft-dragon-cave',
    title: 'Dragon Cave',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <!-- Cave opening -->
      <path d="M30 480 Q30 200 120 150 Q200 110 280 150 Q370 200 370 480" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Stalactites -->
      <polygon points="100,150 105,200 95,200" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <polygon points="160,125 168,185 152,185" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <polygon points="240,125 248,185 232,185" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <polygon points="300,150 305,200 295,200" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Dragon body -->
      <ellipse cx="200" cy="330" rx="80" ry="55" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Dragon head -->
      <circle cx="140" cy="260" r="42" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Neck -->
      <path d="M170 290 Q160 310 175 330" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Horns -->
      <path d="M115 225 Q100 195 108 185" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M155 220 Q160 188 150 182" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Eyes -->
      <circle cx="125" cy="252" r="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="152" cy="252" r="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="127" cy="250" r="5" fill="#333"/>
      <circle cx="154" cy="250" r="5" fill="#333"/>
      <circle cx="129" cy="248" r="2" fill="#fff"/>
      <circle cx="156" cy="248" r="2" fill="#fff"/>
      <!-- Snout -->
      <ellipse cx="130" cy="278" rx="18" ry="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="122" cy="275" r="3" fill="#333"/>
      <circle cx="138" cy="275" r="3" fill="#333"/>
      <!-- Smile -->
      <path d="M118 285 Q130 295 142 285" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Wings -->
      <path d="M220 310 Q260 260 300 280 Q280 300 290 330 Q260 310 250 340" fill="#fff" stroke="#333" stroke-width="2"/>
      <line x1="220" y1="310" x2="280" y2="290" stroke="#333" stroke-width="1.5"/>
      <line x1="220" y1="310" x2="270" y2="315" stroke="#333" stroke-width="1.5"/>
      <!-- Tail -->
      <path d="M275 345 Q320 360 330 340 Q340 320 355 325" fill="none" stroke="#333" stroke-width="2.5"/>
      <polygon points="355,325 370,315 365,335" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Front legs -->
      <ellipse cx="155" cy="385" rx="18" ry="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="210" cy="385" rx="18" ry="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Belly pattern -->
      <path d="M165 340 Q180 335 195 340 Q210 345 225 340" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M170 355 Q185 350 200 355 Q215 360 230 355" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Treasure pile -->
      <circle cx="80" cy="430" r="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="105" cy="440" r="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="65" cy="445" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="90" cy="455" r="11" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Crown on pile -->
      <path d="M68 420 L68 410 L78 418 L88 405 L98 418 L108 410 L108 420Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Gems -->
      <circle cx="310" cy="440" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="330" cy="450" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="320" cy="460" r="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 8. Turtle Ocean Adventure ───────────────────────────
  {
    id: 'ft-turtle-ocean',
    title: 'Sea Turtle',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <!-- Water surface -->
      <path d="M0 80 Q50 65 100 80 Q150 95 200 80 Q250 65 300 80 Q350 95 400 80" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Turtle shell -->
      <ellipse cx="200" cy="260" rx="110" ry="80" fill="#fff" stroke="#333" stroke-width="3"/>
      <!-- Shell pattern - hexagonal -->
      <ellipse cx="200" cy="250" rx="50" ry="35" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="200" cy="250" rx="22" ry="15" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M150 250 Q175 220 200 215" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M250 250 Q225 220 200 215" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M150 250 Q175 280 200 285" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M250 250 Q225 280 200 285" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M140 225 Q170 210 200 215" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M260 225 Q230 210 200 215" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M140 275 Q170 290 200 285" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M260 275 Q230 290 200 285" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Head -->
      <circle cx="110" cy="215" r="32" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Eye -->
      <circle cx="98" cy="208" r="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="99" cy="206" r="4" fill="#333"/>
      <circle cx="101" cy="204" r="1.5" fill="#fff"/>
      <!-- Smile -->
      <path d="M92 225 Q100 232 108 225" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Flippers -->
      <path d="M120 190 Q80 150 60 170 Q50 190 80 200 Q100 205 120 200" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M280 210 Q320 175 340 195 Q350 215 320 220 Q300 225 280 220" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M140 320 Q110 360 90 350 Q75 335 100 320" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M260 320 Q290 360 310 350 Q325 335 300 320" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Tail -->
      <path d="M305 270 Q325 275 320 260" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Bubbles -->
      <circle cx="70" cy="130" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="55" cy="115" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="80" cy="105" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Seaweed -->
      <path d="M40 480 Q50 440 40 400 Q30 360 40 330" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M55 480 Q65 450 55 420 Q45 390 55 360" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M340 480 Q350 445 340 410 Q330 375 340 345" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M360 480 Q370 450 360 425 Q350 400 360 375" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Small fish -->
      <ellipse cx="310" cy="140" rx="14" ry="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <polygon points="324,140 335,132 335,148" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="303" cy="137" r="2.5" fill="#333"/>
      <!-- Starfish on bottom -->
      <path d="M180 460 L185 440 L195 455 L205 438 L210 458 L200 448Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Sand bottom -->
      <path d="M30 480 Q100 470 200 475 Q300 480 370 470" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 9. Letter A: Apple Tree Scene ────────────────────────
  {
    id: 'ft-letter-a-scene',
    title: 'A is for Apple',
    emoji: '',
    category: 'featured',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="460" x2="370" y2="460" stroke="#333" stroke-width="2"/>
      <path d="M140 460 L200 160 L260 460" fill="none" stroke="#333" stroke-width="7"/>
      <line x1="160" y1="350" x2="240" y2="350" stroke="#333" stroke-width="5"/>
      <rect x="250" y="310" width="14" height="100" rx="3" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="257" cy="275" rx="45" ry="40" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="240" cy="280" rx="30" ry="28" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="274" cy="278" rx="30" ry="28" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="245" cy="295" r="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="270" cy="290" r="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="255" cy="260" r="11" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M257 235 Q262 220 270 225" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="275" cy="222" rx="8" ry="5" fill="#fff" stroke="#333" stroke-width="1.5" transform="rotate(15 275 222)"/>
      <g transform="translate(175, 340)">
        <ellipse cx="0" cy="0" rx="9" ry="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="-12" cy="-2" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="10" cy="0" rx="7" ry="4.5" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="-15" cy="-5" r="1.5" fill="#333"/>
        <line x1="-7" y1="5" x2="-11" y2="12" stroke="#333" stroke-width="1"/>
        <line x1="0" y1="5" x2="0" y2="14" stroke="#333" stroke-width="1"/>
        <line x1="7" y1="5" x2="11" y2="12" stroke="#333" stroke-width="1"/>
      </g>
      <g transform="translate(80, 200)">
        <ellipse cx="0" cy="0" rx="30" ry="10" fill="#fff" stroke="#333" stroke-width="2"/>
        <path d="M-12 -10 L-8 -28 L8 -10" fill="#fff" stroke="#333" stroke-width="2"/>
        <path d="M12 -10 L18 -25 L25 -8" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M-25 -3 L-36 -14 L-28 -3" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="18" cy="-2" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <rect x="-5" y="5" width="10" height="12" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      </g>
      <rect x="50" y="430" width="30" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <text x="58" y="452" font-size="16" font-weight="bold" fill="none" stroke="#333" stroke-width="1.5" font-family="sans-serif">A</text>
      <rect x="320" y="430" width="30" height="30" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <text x="328" y="452" font-size="16" font-weight="bold" fill="none" stroke="#333" stroke-width="1.5" font-family="sans-serif">a</text>
      <ellipse cx="60" cy="90" rx="28" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="45" cy="95" rx="18" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="75" cy="95" rx="18" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="340" cy="70" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="50" cy="380" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="350" cy="360" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      ${[60,140,280,340].map(x => `<path d="M${x} 460 Q${x-3} 448 ${x+2} 452 Q${x+5} 445 ${x+7} 460" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
    </svg>`,
  },

  // ── 10. Letter B: Bear Party Scene ──────────────────────
  {
    id: 'ft-letter-b-scene',
    title: 'B is for Bear',
    emoji: '',
    category: 'featured',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="460" x2="370" y2="460" stroke="#333" stroke-width="2"/>
      <line x1="80" y1="80" x2="80" y2="420" stroke="#333" stroke-width="7"/>
      <path d="M80 80 Q180 80 180 160 Q180 240 80 240" fill="none" stroke="#333" stroke-width="6"/>
      <path d="M80 240 Q190 240 190 330 Q190 420 80 420" fill="none" stroke="#333" stroke-width="6"/>
      <g transform="translate(140, 330)">
        <circle cx="0" cy="0" r="30" fill="#fff" stroke="#333" stroke-width="2.5"/>
        <circle cx="-18" cy="-25" r="12" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="18" cy="-25" r="12" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="-18" cy="-25" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="18" cy="-25" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="-8" cy="-5" r="4" fill="#333"/>
        <circle cx="8" cy="-5" r="4" fill="#333"/>
        <ellipse cx="0" cy="8" rx="6" ry="4" fill="#333"/>
        <path d="M-5 14 Q0 20 5 14" fill="none" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="0" cy="40" rx="22" ry="18" fill="#fff" stroke="#333" stroke-width="2"/>
        <ellipse cx="-12" cy="55" rx="8" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="12" cy="55" rx="8" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      </g>
      <ellipse cx="280" cy="120" rx="32" ry="40" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M280 160 L276 168 L284 168Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M280 168 Q285 220 275 280" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M268 100 Q280 90 290 105" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="320" cy="100" rx="30" ry="38" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M320 138 L316 146 L324 146Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M320 146 Q325 210 315 300" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M308 82 Q320 72 330 85" fill="none" stroke="#333" stroke-width="1.5"/>
      <g transform="translate(300, 220)">
        <ellipse cx="0" cy="0" rx="2" ry="8" fill="#333"/>
        <ellipse cx="-12" cy="-4" rx="12" ry="8" fill="#fff" stroke="#333" stroke-width="2"/>
        <ellipse cx="12" cy="-4" rx="12" ry="8" fill="#fff" stroke="#333" stroke-width="2"/>
        <ellipse cx="-10" cy="5" rx="9" ry="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="10" cy="5" rx="9" ry="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="-12" cy="-4" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
        <circle cx="12" cy="-4" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
        <line x1="-2" y1="-8" x2="-7" y2="-18" stroke="#333" stroke-width="1.5"/>
        <line x1="2" y1="-8" x2="7" y2="-18" stroke="#333" stroke-width="1.5"/>
        <circle cx="-7" cy="-18" r="2" fill="#fff" stroke="#333" stroke-width="1"/>
        <circle cx="7" cy="-18" r="2" fill="#fff" stroke="#333" stroke-width="1"/>
      </g>
      <g transform="translate(240, 420)">
        <ellipse cx="0" cy="0" rx="12" ry="8" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="12" cy="0" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="0" cy="-2" r="3" fill="#333"/>
        <line x1="-10" y1="6" x2="-14" y2="12" stroke="#333" stroke-width="1"/>
        <line x1="-5" y1="7" x2="-5" y2="14" stroke="#333" stroke-width="1"/>
        <line x1="0" y1="7" x2="4" y2="14" stroke="#333" stroke-width="1"/>
        <line x1="5" y1="6" x2="10" y2="12" stroke="#333" stroke-width="1"/>
      </g>
      ${[[40,60],[360,50],[50,200],[350,400]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[50,330].map(x => `<g><line x1="${x}" y1="460" x2="${x}" y2="438" stroke="#333" stroke-width="1.5"/><circle cx="${x}" cy="432" r="7" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="${x}" cy="432" r="3.5" fill="#fff" stroke="#333" stroke-width="1"/></g>`).join('')}
    </svg>`,
  },

  // ── 11. Number 1: One Big Adventure ─────────────────────
  {
    id: 'ft-number-1-scene',
    title: 'Number 1 Adventure',
    emoji: '',
    category: 'featured',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="470" x2="370" y2="470" stroke="#333" stroke-width="2"/>
      <path d="M155 130 L195 80 L195 430" fill="none" stroke="#333" stroke-width="7"/>
      <line x1="145" y1="430" x2="245" y2="430" stroke="#333" stroke-width="5"/>
      <circle cx="320" cy="90" r="42" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="320" cy="90" r="28" fill="#fff" stroke="#333" stroke-width="1.5"/>
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<line x1="${320+38*Math.cos(a*Math.PI/180)}" y1="${90+38*Math.sin(a*Math.PI/180)}" x2="${320+52*Math.cos(a*Math.PI/180)}" y2="${90+52*Math.sin(a*Math.PI/180)}" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>`).join('')}
      <circle cx="310" cy="85" r="4" fill="#333"/>
      <circle cx="330" cy="85" r="4" fill="#333"/>
      <path d="M310 100 Q320 110 330 100" fill="none" stroke="#333" stroke-width="2"/>
      <g transform="translate(80, 220)">
        <path d="M0 -55 Q-14 -25 -16 0 L-16 45 Q-16 55 -8 58 L8 58 Q16 55 16 45 L16 0 Q14 -25 0 -55Z" fill="#fff" stroke="#333" stroke-width="2.5"/>
        <circle cx="0" cy="5" r="12" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="0" cy="5" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M-16 25 L-28 50 L-16 40" fill="#fff" stroke="#333" stroke-width="2"/>
        <path d="M16 25 L28 50 L16 40" fill="#fff" stroke="#333" stroke-width="2"/>
        <path d="M-8 58 Q-4 72 0 76 Q4 72 8 58" fill="#fff" stroke="#333" stroke-width="2"/>
        <rect x="-8" y="32" width="16" height="7" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      </g>
      <circle cx="330" cy="300" r="28" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="330" cy="300" r="18" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M310 290 Q320 300 330 290" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M330 290 Q340 300 350 290" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="60" cy="90" rx="30" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="45" cy="95" rx="20" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="75" cy="95" rx="18" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <line x1="270" y1="380" x2="270" y2="350" stroke="#333" stroke-width="2"/>
      <polygon points="270,350 295,365 270,380" fill="#fff" stroke="#333" stroke-width="2"/>
      ${[50,120,280,340].map(x => `<path d="M${x} 470 Q${x-3} 458 ${x+2} 462 Q${x+5} 455 ${x+7} 470" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[[50,380],[350,420],[55,300]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
    </svg>`,
  },

  // ── 12. Number 2: Two of Everything ─────────────────────
  {
    id: 'ft-number-2-scene',
    title: 'Number 2 Fun',
    emoji: '',
    category: 'featured',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="470" x2="370" y2="470" stroke="#333" stroke-width="2"/>
      <path d="M100 130 Q100 70 160 70 Q220 70 220 130 Q220 185 100 260 L100 280 L220 280" fill="none" stroke="#333" stroke-width="7"/>
      <path d="M30 380 Q80 370 130 380 Q180 390 230 380 Q280 370 330 380 Q360 385 370 380" fill="none" stroke="#333" stroke-width="2"/>
      <g transform="translate(80, 350)">
        <ellipse cx="0" cy="0" rx="28" ry="18" fill="#fff" stroke="#333" stroke-width="2.5"/>
        <circle cx="18" cy="-12" r="14" fill="#fff" stroke="#333" stroke-width="2.5"/>
        <circle cx="24" cy="-16" r="3" fill="#333"/>
        <ellipse cx="34" cy="-10" rx="8" ry="3.5" fill="#fff" stroke="#333" stroke-width="2"/>
        <path d="M-22 -4 Q-16 -12 -8 -6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      </g>
      <g transform="translate(290, 345)">
        <ellipse cx="0" cy="0" rx="26" ry="17" fill="#fff" stroke="#333" stroke-width="2.5"/>
        <circle cx="-16" cy="-11" r="13" fill="#fff" stroke="#333" stroke-width="2.5"/>
        <circle cx="-22" cy="-15" r="3" fill="#333"/>
        <ellipse cx="-32" cy="-9" rx="8" ry="3.5" fill="#fff" stroke="#333" stroke-width="2"/>
        <path d="M20 -3 Q14 -11 8 -5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      </g>
      ${[60, 310].map((x,i) => `<g>
        <line x1="${x}" y1="310" x2="${x}" y2="275" stroke="#333" stroke-width="2"/>
        <circle cx="${x}" cy="267" r="16" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="${x}" cy="267" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
        ${[0,60,120,180,240,300].map(a => `<ellipse cx="${x + 13*Math.cos(a*Math.PI/180)}" cy="${267 + 13*Math.sin(a*Math.PI/180)}" rx="7" ry="4" fill="#fff" stroke="#333" stroke-width="1.5" transform="rotate(${a} ${x + 13*Math.cos(a*Math.PI/180)} ${267 + 13*Math.sin(a*Math.PI/180)})"/>`).join('')}
        <ellipse cx="${x-10}" cy="290" rx="9" ry="4" fill="#fff" stroke="#333" stroke-width="1.5" transform="rotate(${i?20:-20} ${x-10} 290)"/>
        <ellipse cx="${x+10}" cy="295" rx="9" ry="4" fill="#fff" stroke="#333" stroke-width="1.5" transform="rotate(${i?-15:15} ${x+10} 295)"/>
      </g>`).join('')}
      ${[{x:260,y:90},{x:320,y:75}].map(({x,y}) => `<g>
        <ellipse cx="${x}" cy="${y}" rx="28" ry="35" fill="#fff" stroke="#333" stroke-width="2.5"/>
        <path d="M${x} ${y+35} L${x-4} ${y+42} L${x+4} ${y+42}Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M${x} ${y+42} Q${x+5} ${y+85} ${x-5} ${y+130}" fill="none" stroke="#333" stroke-width="1.5"/>
        <path d="M${x-8} ${y-12} Q${x} ${y-20} ${x+6} ${y-8}" fill="none" stroke="#333" stroke-width="1.5"/>
      </g>`).join('')}
      <ellipse cx="55" cy="70" rx="28" ry="13" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="40" cy="74" rx="18" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="350" cy="55" rx="24" ry="11" fill="#fff" stroke="#333" stroke-width="2"/>
      ${[50,150,250,340].map(x => `<path d="M${x} 470 Q${x-3} 458 ${x+2} 462 Q${x+5} 455 ${x+7} 470" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[[180,400],[40,420],[360,430]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
    </svg>`,
  },

  // ── 13. Mermaid Lagoon ──────────────────────────────────
  {
    id: 'ft-mermaid-lagoon',
    title: 'Mermaid Lagoon',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 90 Q50 75 100 90 Q150 105 200 90 Q250 75 300 90 Q350 105 400 90" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Mermaid head -->
      <circle cx="200" cy="170" r="42" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Long flowing hair -->
      <path d="M160 155 Q140 130 130 160 Q125 190 135 220 Q140 240 130 260" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M165 160 Q150 140 145 170 Q142 200 148 230 Q152 250 145 270" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M240 155 Q260 130 270 160 Q275 190 265 220 Q260 240 270 260" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M235 160 Q250 140 255 170 Q258 200 252 230 Q248 250 255 270" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Crown/tiara -->
      <path d="M178 130 Q185 115 192 130 Q200 110 208 130 Q215 115 222 130" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Face -->
      <circle cx="186" cy="165" r="5" fill="#333"/><circle cx="214" cy="165" r="5" fill="#333"/>
      <circle cx="188" cy="163" r="2" fill="#fff"/><circle cx="216" cy="163" r="2" fill="#fff"/>
      <path d="M195 182 Q200 188 205 182" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Body -->
      <path d="M175 212 Q200 225 225 212 L220 310 Q200 325 180 310Z" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Shell top -->
      <path d="M180 225 Q190 218 200 225" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M200 225 Q210 218 220 225" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Tail with scale pattern -->
      <path d="M180 310 Q165 350 145 380 Q130 400 115 405 Q100 408 105 395 Q110 382 125 370" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M220 310 Q235 350 255 380 Q270 400 285 405 Q300 408 295 395 Q290 382 275 370" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Scale lines on tail -->
      <path d="M175 320 Q190 315 205 320" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M170 335 Q190 328 210 335" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M165 350 Q185 342 205 350" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M160 365 Q178 358 198 365" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M220 335 Q235 328 250 335" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M230 350 Q245 342 260 350" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Tail fins -->
      <path d="M115 405 Q95 415 80 405 Q70 395 85 388" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M105 395 Q90 405 75 395" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M285 405 Q305 415 320 405 Q330 395 315 388" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M295 395 Q310 405 325 395" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Treasure chest -->
      <rect x="50" cy="430" y="425" width="60" height="35" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M50 425 Q80 415 110 425" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="80" cy="440" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Coral -->
      <path d="M320 420 Q325 390 330 400 Q335 380 340 395 Q345 375 350 400 Q355 395 355 420" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M325 420 Q330 400 335 405" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Shells -->
      <ellipse cx="160" cy="460" rx="12" ry="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M150 460 Q155 455 160 460 Q165 455 170 460" fill="none" stroke="#333" stroke-width="1"/>
      <ellipse cx="260" cy="455" rx="10" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Fish -->
      <ellipse cx="60" cy="250" rx="16" ry="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <polygon points="76,250 88,240 88,260" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="52" cy="247" r="3" fill="#333"/>
      <ellipse cx="340" cy="310" rx="14" ry="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <polygon points="354,310 364,302 364,318" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="333" cy="307" r="2.5" fill="#333"/>
      <!-- Bubbles -->
      <circle cx="70" cy="180" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="55" cy="160" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="340" cy="200" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="350" cy="170" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Seaweed -->
      <path d="M35 480 Q45 440 35 400 Q25 360 35 330" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M50 480 Q60 445 50 415 Q40 385 50 360" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M360 480 Q370 450 360 420 Q350 390 360 365" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Sand bottom -->
      <path d="M30 480 Q100 468 200 475 Q300 482 370 470" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="100" cy="478" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="300" cy="475" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
    </svg>`,
  },

  // ── 14. Dinosaur Jungle ─────────────────────────────────
  {
    id: 'ft-dino-jungle',
    title: 'Dinosaur Jungle',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="440" x2="370" y2="440" stroke="#333" stroke-width="2"/>
      <!-- Sun -->
      <circle cx="330" cy="60" r="30" fill="#fff" stroke="#333" stroke-width="2"/>
      <line x1="358.0" y1="60.0" x2="370.0" y2="60.0" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="354.24871130596426" y1="74.0" x2="364.6410161513775" y2="80.0" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="344.0" y1="84.24871130596428" x2="350.0" y2="94.64101615137754" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="330.0" y1="88.0" x2="330.0" y2="100.0" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="316.0" y1="84.24871130596429" x2="310.0" y2="94.64101615137756" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="305.75128869403574" y1="74.0" x2="295.3589838486225" y2="80.0" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="302.0" y1="60.0" x2="290.0" y2="60.00000000000001" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="305.75128869403574" y1="46.0" x2="295.3589838486225" y2="40.0" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="316.0" y1="35.75128869403572" x2="310.0" y2="25.358983848622465" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="330.0" y1="32.0" x2="330.0" y2="20.0" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="344.0" y1="35.75128869403572" x2="350.0" y2="25.358983848622458" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="354.24871130596426" y1="45.999999999999986" x2="364.6410161513775" y2="39.999999999999986" stroke="#333" stroke-width="2" stroke-linecap="round"/>
      <!-- Volcano background -->
      <polygon points="30,440 100,250 170,440" fill="#fff" stroke="#333" stroke-width="2"/>
      <polygon points="80,300 100,250 120,300" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M85 260 Q100 240 115 260" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Dino body -->
      <ellipse cx="230" cy="310" rx="80" ry="60" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Dino head -->
      <circle cx="150" cy="240" r="45" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Neck -->
      <path d="M185 270 Q195 290 200 310" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M170 275 Q182 295 190 315" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Horns/spikes -->
      <path d="M128 200 Q118 175 125 168" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M155 198 Q155 172 148 166" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Spine spikes -->
      <path d="M200 285 L195 265 L210 280 L208 260 L220 278 L220 258 L232 278" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Eyes -->
      <circle cx="132" cy="232" r="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="160" cy="232" r="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="134" cy="230" r="5" fill="#333"/><circle cx="162" cy="230" r="5" fill="#333"/>
      <circle cx="136" cy="228" r="2" fill="#fff"/><circle cx="164" cy="228" r="2" fill="#fff"/>
      <!-- Mouth with teeth -->
      <path d="M120 260 Q135 270 150 260 Q160 270 170 260" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M128 260 L130 268 L134 260" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M142 260 L145 268 L148 260" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M156 260 L158 268 L162 260" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Belly stripes -->
      <path d="M190 320 Q210 315 230 320 Q250 325 270 320" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M195 340 Q215 335 235 340 Q255 345 270 340" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Legs -->
      <rect x="180" y="360" width="22" height="55" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="215" y="360" width="22" height="55" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="250" y="360" width="22" height="55" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="278" y="360" width="22" height="55" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Tail -->
      <path d="M305 310 Q340 300 350 320 Q360 340 370 330" fill="none" stroke="#333" stroke-width="2.5"/>
      <!-- Palm tree 1 -->
      <rect x="42" y="300" width="12" height="140" rx="3" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M48 300 Q20 270 15 290" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M48 300 Q75 265 80 285" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M48 300 Q45 265 55 275" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M48 300 Q30 280 25 295" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Palm tree 2 -->
      <rect x="348" y="320" width="10" height="120" rx="3" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M353 320 Q330 292 325 310" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M353 320 Q378 288 380 308" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M353 320 Q350 288 360 298" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Eggs nest -->
      <ellipse cx="85" cy="425" rx="25" ry="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="75" cy="415" rx="8" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="90" cy="415" rx="8" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="82" cy="418" rx="7" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Footprints -->
      <circle cx="130" cy="450" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="127" cy="442" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="133" cy="442" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="320" cy="455" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="317" cy="447" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="323" cy="447" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Rocks -->
      <ellipse cx="200" cy="460" rx="20" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="290" cy="465" rx="15" ry="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Vines -->
      <path d="M50 100 Q55 130 45 160 Q40 180 50 200" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="50" cy="120" rx="8" ry="5" fill="#fff" stroke="#333" stroke-width="1" transform="rotate(-20 50 120)"/>
      <ellipse cx="45" cy="155" rx="7" ry="4" fill="#fff" stroke="#333" stroke-width="1" transform="rotate(15 45 155)"/>
      <!-- Cloud -->
      <ellipse cx="180" cy="60" rx="28" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="163" cy="65" rx="18" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="197" cy="65" rx="18" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Grass -->
      <path d="M60 440 Q57 428 62 432 Q65 425 67 440" fill="none" stroke="#333" stroke-width="1.5"/><path d="M160 440 Q157 428 162 432 Q165 425 167 440" fill="none" stroke="#333" stroke-width="1.5"/><path d="M230 440 Q227 428 232 432 Q235 425 237 440" fill="none" stroke="#333" stroke-width="1.5"/><path d="M300 440 Q297 428 302 432 Q305 425 307 440" fill="none" stroke="#333" stroke-width="1.5"/><path d="M350 440 Q347 428 352 432 Q355 425 357 440" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 15. Princess Garden ─────────────────────────────────
  {
    id: 'ft-princess-garden',
    title: 'Princess Garden',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="450" x2="370" y2="450" stroke="#333" stroke-width="2"/>
      <!-- Garden arch -->
      <path d="M100 450 L100 200 Q100 130 200 130 Q300 130 300 200 L300 450" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M110 450 L110 210 Q110 150 200 150 Q290 150 290 210 L290 450" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Arch flowers -->
      <circle cx="108.0" cy="200.0" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="107.2504622962932" cy="170.41672167815105" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="105.14230087749232" cy="146.37688898167153" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="102.07055236082016" cy="132.3851921597652" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="98.61081457866456" cy="131.06345728914545" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="95.41138850919164" cy="142.65935689977056" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="93.07179676972449" cy="165.0" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="92.03044241526604" cy="193.8990980076639" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Princess head -->
      <circle cx="200" cy="220" r="32" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Hair -->
      <path d="M170 210 Q155 190 150 220 Q148 250 155 270 Q158 280 152 295" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M175 215 Q162 198 158 225 Q156 248 162 265" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M230 210 Q245 190 250 220 Q252 250 245 270 Q242 280 248 295" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M225 215 Q238 198 242 225 Q244 248 238 265" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Crown -->
      <path d="M178 192 Q183 175 190 190 Q200 170 210 190 Q217 175 222 192" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="190" cy="180" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="200" cy="174" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="210" cy="180" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Face -->
      <circle cx="190" cy="218" r="4" fill="#333"/><circle cx="210" cy="218" r="4" fill="#333"/>
      <circle cx="191" cy="216" r="1.5" fill="#fff"/><circle cx="211" cy="216" r="1.5" fill="#fff"/>
      <path d="M196 232 Q200 237 204 232" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="183" cy="225" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="217" cy="225" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Dress bodice -->
      <path d="M178 252 Q200 265 222 252 L218 310 Q200 320 182 310Z" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M188 270 Q200 265 212 270" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="280" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Sleeves -->
      <path d="M178 260 Q160 258 155 270 Q150 285 165 285" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M222 260 Q240 258 245 270 Q250 285 235 285" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Arms -->
      <path d="M158 285 Q155 300 160 310" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="160" cy="314" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M242 285 Q245 300 240 310" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="240" cy="314" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Skirt with panels -->
      <path d="M182 310 Q155 370 130 440 L200 450 L270 440 Q245 370 218 310" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <line x1="200" y1="310" x2="200" y2="448" stroke="#333" stroke-width="1.5"/>
      <path d="M182 310 Q170 370 165 440" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M218 310 Q230 370 235 440" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M140 400 Q170 392 200 396 Q230 392 260 400" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M135 420 Q168 412 200 416 Q232 412 265 420" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Bow at waist -->
      <path d="M190 310 Q175 305 178 315 Q180 322 190 318" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M210 310 Q225 305 222 315 Q220 322 210 318" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="312" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Shoes -->
      <ellipse cx="170" cy="448" rx="12" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="230" cy="448" rx="12" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Garden flowers -->
      <g>
        <line x1="55" y1="450" x2="55" y2="410" stroke="#333" stroke-width="1.5"/>
        <circle cx="55" cy="402" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="55" cy="402" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
        <ellipse cx="47" cy="418" rx="6" ry="3" fill="#fff" stroke="#333" stroke-width="1" transform="rotate(-20 47 418)"/>
        <ellipse cx="63" cy="420" rx="6" ry="3" fill="#fff" stroke="#333" stroke-width="1" transform="rotate(20 63 420)"/>
      </g><g>
        <line x1="70" y1="450" x2="70" y2="395" stroke="#333" stroke-width="1.5"/>
        <circle cx="70" cy="387" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="70" cy="387" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
        <ellipse cx="62" cy="403" rx="6" ry="3" fill="#fff" stroke="#333" stroke-width="1" transform="rotate(-20 62 403)"/>
        <ellipse cx="78" cy="405" rx="6" ry="3" fill="#fff" stroke="#333" stroke-width="1" transform="rotate(20 78 405)"/>
      </g><g>
        <line x1="330" y1="450" x2="330" y2="400" stroke="#333" stroke-width="1.5"/>
        <circle cx="330" cy="392" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="330" cy="392" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
        <ellipse cx="322" cy="408" rx="6" ry="3" fill="#fff" stroke="#333" stroke-width="1" transform="rotate(-20 322 408)"/>
        <ellipse cx="338" cy="410" rx="6" ry="3" fill="#fff" stroke="#333" stroke-width="1" transform="rotate(20 338 410)"/>
      </g><g>
        <line x1="345" y1="450" x2="345" y2="412" stroke="#333" stroke-width="1.5"/>
        <circle cx="345" cy="404" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="345" cy="404" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
        <ellipse cx="337" cy="420" rx="6" ry="3" fill="#fff" stroke="#333" stroke-width="1" transform="rotate(-20 337 420)"/>
        <ellipse cx="353" cy="422" rx="6" ry="3" fill="#fff" stroke="#333" stroke-width="1" transform="rotate(20 353 422)"/>
      </g>
      <!-- Butterfly -->
      <g transform="translate(320, 200)">
        <ellipse cx="0" cy="0" rx="1.5" ry="7" fill="#333"/>
        <ellipse cx="-10" cy="-4" rx="10" ry="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="10" cy="-4" rx="10" ry="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="-8" cy="5" rx="7" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="8" cy="5" rx="7" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="-10" cy="-4" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
        <circle cx="10" cy="-4" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      </g>
      <!-- Garden path -->
      <ellipse cx="200" cy="475" rx="50" ry="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="200" cy="495" rx="40" ry="6" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Stars -->
      <circle cx="60" cy="80" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="340" cy="70" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 16. Robot Workshop ──────────────────────────────────
  {
    id: 'ft-robot-workshop',
    title: 'Robot Workshop',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="460" x2="370" y2="460" stroke="#333" stroke-width="2"/>
      <rect x="130" y="170" width="140" height="120" rx="12" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <rect x="145" y="115" width="110" height="60" rx="10" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <line x1="200" y1="115" x2="200" y2="80" stroke="#333" stroke-width="2.5"/>
      <circle cx="200" cy="72" r="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="72" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="155" y="130" width="30" height="25" rx="5" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="215" y="130" width="30" height="25" rx="5" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="170" cy="142" r="8" fill="#333"/>
      <circle cx="230" cy="142" r="8" fill="#333"/>
      <circle cx="172" cy="140" r="3" fill="#fff"/>
      <circle cx="232" cy="140" r="3" fill="#fff"/>
      <rect x="185" y="158" width="30" height="10" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <line x1="192" y1="158" x2="192" y2="168" stroke="#333" stroke-width="1.5"/>
      <line x1="200" y1="158" x2="200" y2="168" stroke="#333" stroke-width="1.5"/>
      <line x1="208" y1="158" x2="208" y2="168" stroke="#333" stroke-width="1.5"/>
      <rect x="140" y="200" width="120" height="40" rx="6" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="160" cy="220" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="185" cy="220" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="210" cy="220" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="230" y="210" width="20" height="20" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="150" y="250" width="100" height="15" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M130 200 L100 180 Q90 175 85 185 L85 240 Q85 250 95 250 L130 240" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="95" cy="210" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M270 200 L300 180 Q310 175 315 185 L315 240 Q315 250 305 250 L270 240" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="305" cy="210" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="155" y="290" width="35" height="80" rx="6" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="210" y="290" width="35" height="80" rx="6" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="155" y="340" width="35" height="10" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="210" y="340" width="35" height="10" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="148" y="370" width="48" height="20" rx="6" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="204" y="370" width="48" height="20" rx="6" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="40" y="320" width="50" height="80" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="48" y="340" width="15" height="15" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="68" y="340" width="15" height="15" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="65" cy="380" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="310" y="310" width="60" height="90" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="340" cy="340" r="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="340" cy="340" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <line x1="310" y1="370" x2="370" y2="370" stroke="#333" stroke-width="1.5"/>
      <rect x="320" y="378" width="30" height="12" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="55" cy="100" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="345" cy="90" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="60" y="430" width="18" height="30" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="320" y="425" width="22" height="35" rx="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 17. Space Animals ───────────────────────────────────
  {
    id: 'ft-space-animals',
    title: 'Space Animals',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <!-- Moon surface -->
      <path d="M0 380 Q80 360 160 375 Q240 390 320 370 Q380 360 400 375 L400 520 L0 520Z" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Craters -->
      <ellipse cx="80" cy="400" rx="25" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="250" cy="410" rx="20" ry="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="350" cy="395" rx="15" ry="6" fill="#fff" stroke="#333" stroke-width="1"/>
      <ellipse cx="160" cy="430" rx="18" ry="7" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Big astronaut cat -->
      <circle cx="180" cy="220" r="55" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Helmet glass -->
      <circle cx="180" cy="215" r="42" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Cat face inside helmet -->
      <circle cx="180" cy="220" r="30" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Cat ears inside helmet -->
      <path d="M158 196 Q155 180 165 188" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M202 196 Q205 180 195 188" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Cat eyes -->
      <circle cx="170" cy="218" r="5" fill="#333"/><circle cx="190" cy="218" r="5" fill="#333"/>
      <circle cx="171" cy="216" r="2" fill="#fff"/><circle cx="191" cy="216" r="2" fill="#fff"/>
      <!-- Cat nose/mouth -->
      <ellipse cx="180" cy="230" rx="3" ry="2" fill="#333"/>
      <path d="M177 234 Q180 238 183 234" fill="none" stroke="#333" stroke-width="1"/>
      <!-- Whiskers -->
      <line x1="165" y1="228" x2="148" y2="225" stroke="#333" stroke-width="1"/>
      <line x1="165" y1="232" x2="148" y2="234" stroke="#333" stroke-width="1"/>
      <line x1="195" y1="228" x2="212" y2="225" stroke="#333" stroke-width="1"/>
      <line x1="195" y1="232" x2="212" y2="234" stroke="#333" stroke-width="1"/>
      <!-- Helmet reflection -->
      <path d="M155 195 Q160 188 168 192" fill="none" stroke="#333" stroke-width="1"/>
      <!-- Space suit body -->
      <rect x="148" y="275" width="64" height="70" rx="12" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Suit panels -->
      <rect x="158" y="285" width="44" height="20" rx="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="170" cy="295" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="190" cy="295" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <rect x="165" y="315" width="30" height="12" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Arms -->
      <path d="M148 285 Q125 280 118 295 Q112 310 125 315" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="122" cy="318" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M212 285 Q235 280 242 295 Q248 310 235 315" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="238" cy="318" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Legs -->
      <rect x="152" y="345" width="22" height="35" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="186" y="345" width="22" height="35" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Boots -->
      <ellipse cx="163" cy="382" rx="14" ry="7" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="197" cy="382" rx="14" ry="7" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Flag -->
      <line x1="120" y1="320" x2="120" y2="370" stroke="#333" stroke-width="2"/>
      <rect x="120" y="370" width="30" height="20" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="135" cy="380" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Rocket -->
      <g transform="translate(330, 180)">
        <path d="M0 -50 Q-12 -25 -14 0 L-14 40 Q-14 48 -8 52 L8 52 Q14 48 14 40 L14 0 Q12 -25 0 -50Z" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="0" cy="5" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M-14 22 L-24 42 L-14 35" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M14 22 L24 42 L14 35" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M-8 52 Q0 62 8 52" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <rect x="-8" y="28" width="16" height="6" rx="2" fill="#fff" stroke="#333" stroke-width="1"/>
      </g>
      <!-- Planet -->
      <circle cx="60" cy="120" r="30" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="60" cy="120" rx="38" ry="8" fill="none" stroke="#333" stroke-width="1.5" transform="rotate(-20 60 120)"/>
      <circle cx="52" cy="110" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="70" cy="125" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Stars -->
      <circle cx="280" cy="60" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="100" cy="50" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="350" cy="80" r="3" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="50" cy="200" r="3" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="320" cy="300" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="260" cy="140" r="3" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="40" cy="320" r="3" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="370" cy="260" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Small floating fish with helmet -->
      <g transform="translate(290, 300)">
        <circle cx="0" cy="0" r="14" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="0" cy="2" rx="10" ry="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <polygon points="10,2 18,-4 18,8" fill="#fff" stroke="#333" stroke-width="1"/>
        <circle cx="-4" cy="0" r="2" fill="#333"/>
      </g>
    </svg>`,
  },

  // ── 18. Candy House ─────────────────────────────────────
  {
    id: 'ft-candy-house',
    title: 'Candy House',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="450" x2="370" y2="450" stroke="#333" stroke-width="2"/>
      <!-- House base -->
      <rect x="80" y="230" width="240" height="220" rx="4" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Roof with gumdrop tiles -->
      <polygon points="60,235 200,90 340,235" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Gumdrop roof tiles row 1 -->
      <ellipse cx="120" cy="195" rx="14" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="150" cy="195" rx="14" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="180" cy="195" rx="14" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="210" cy="195" rx="14" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="240" cy="195" rx="14" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="260" cy="195" rx="14" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Gumdrop roof tiles row 2 -->
      <ellipse cx="140" cy="170" rx="12" ry="8" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="170" cy="170" rx="12" ry="8" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="200" cy="170" rx="12" ry="8" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="230" cy="170" rx="12" ry="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Gumdrop roof tiles row 3 -->
      <ellipse cx="165" cy="148" rx="10" ry="7" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="195" cy="148" rx="10" ry="7" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="225" cy="148" rx="10" ry="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Frosting drips on roof edge -->
      <path d="M80 235 Q90 245 100 235 Q110 250 120 235 Q130 248 140 235 Q150 252 160 235 Q170 248 180 235 Q190 252 200 235 Q210 248 220 235 Q230 252 240 235 Q250 248 260 235 Q270 252 280 235 Q290 248 300 235 Q310 252 320 235" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Candy cane columns -->
      <rect x="95" y="310" width="18" height="140" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M95 320 L113 340 M95 340 L113 360 M95 360 L113 380 M95 380 L113 400 M95 400 L113 420 M95 420 L113 440" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="287" y="310" width="18" height="140" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M287 320 L305 340 M287 340 L305 360 M287 360 L305 380 M287 380 L305 400 M287 400 L305 420 M287 420 L305 440" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Swirl windows -->
      <circle cx="150" cy="290" r="22" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M150 268 Q160 278 150 288 Q140 298 150 308" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M140 275 Q150 285 140 295" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="250" cy="290" r="22" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M250 268 Q260 278 250 288 Q240 298 250 308" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M240 275 Q250 285 240 295" fill="none" stroke="#333" stroke-width="1"/>
      <!-- Door -->
      <rect x="170" y="360" width="60" height="90" rx="30" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="218" cy="410" r="5" fill="#333"/>
      <path d="M180 365 Q200 350 220 365" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Frosting drips on door -->
      <path d="M175 360 Q180 370 185 360 Q190 372 195 360 Q200 370 205 360 Q210 372 215 360 Q220 370 225 360" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Chimney with smoke -->
      <rect x="260" y="110" width="25" height="80" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M255 115 Q265 105 275 115 Q285 105 290 115" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M268 100 Q272 85 265 75" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M275 90 Q280 75 275 65" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Star on roof top -->
      <circle cx="200" cy="90" r="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Lollipop path -->
      <g>
        <circle cx="50" cy="420" r="14" fill="#fff" stroke="#333" stroke-width="2"/>
        <path d="M50 406 Q55 413 50 420 Q45 427 50 434" fill="none" stroke="#333" stroke-width="1.5"/>
        <line x1="50" y1="434" x2="50" y2="450" stroke="#333" stroke-width="2"/>
      </g><g>
        <circle cx="350" cy="420" r="14" fill="#fff" stroke="#333" stroke-width="2"/>
        <path d="M350 406 Q355 413 350 420 Q345 427 350 434" fill="none" stroke="#333" stroke-width="1.5"/>
        <line x1="350" y1="434" x2="350" y2="450" stroke="#333" stroke-width="2"/>
      </g>
      <!-- Cupcake bush left -->
      <path d="M40 430 Q30 410 45 400 Q60 395 70 405 Q80 395 85 410 Q90 425 75 435 Q60 440 45 435Z" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="55" cy="408" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="70" cy="405" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Cupcake bush right -->
      <path d="M360 430 Q370 410 355 400 Q340 395 330 405 Q320 395 315 410 Q310 425 325 435 Q340 440 355 435Z" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="345" cy="408" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="330" cy="405" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Wrapped candies on ground -->
      <ellipse cx="140" cy="445" rx="12" ry="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M128 445 L118 440 M128 445 L118 450" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M152 445 L162 440 M152 445 L162 450" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="260" cy="442" rx="10" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M250 442 L242 438 M250 442 L242 446" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M270 442 L278 438 M270 442 L278 446" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Frosting border bottom of house -->
      <path d="M80 380 Q100 390 120 380 Q140 390 160 380" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M240 380 Q260 390 280 380 Q300 390 320 380" fill="none" stroke="#333" stroke-width="1.5"/>
      <!-- Gumdrop path stones -->
      <ellipse cx="180" cy="470" rx="8" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="200" cy="480" rx="8" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="220" cy="470" rx="8" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/><ellipse cx="200" cy="490" rx="8" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 19. Farm Friends ────────────────────────────────────
  {
    id: 'ft-farm-friends',
    title: 'Farm Friends',
    emoji: '',
    category: 'featured',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="420" x2="370" y2="420" stroke="#333" stroke-width="2"/>
      <circle cx="320" cy="60" r="28" fill="#fff" stroke="#333" stroke-width="2"/>
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<line x1="${320+26*Math.cos(a*Math.PI/180)}" y1="${60+26*Math.sin(a*Math.PI/180)}" x2="${320+36*Math.cos(a*Math.PI/180)}" y2="${60+36*Math.sin(a*Math.PI/180)}" stroke="#333" stroke-width="2" stroke-linecap="round"/>`).join('')}
      <rect x="30" y="180" width="120" height="160" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <polygon points="20,185 90,100 160,185" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <rect x="65" y="270" width="40" height="70" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="95" cy="310" r="3" fill="#333"/>
      <rect x="40" y="210" width="25" height="25" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <line x1="52" y1="210" x2="52" y2="235" stroke="#333" stroke-width="1"/>
      <line x1="40" y1="222" x2="65" y2="222" stroke="#333" stroke-width="1"/>
      <rect x="105" y="210" width="25" height="25" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <line x1="117" y1="210" x2="117" y2="235" stroke="#333" stroke-width="1"/>
      <line x1="105" y1="222" x2="130" y2="222" stroke="#333" stroke-width="1"/>
      <ellipse cx="260" cy="340" rx="50" ry="40" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="235" cy="310" r="22" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="218" cy="300" rx="8" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="248" cy="298" rx="8" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="228" cy="306" r="3.5" fill="#333"/><circle cx="244" cy="306" r="3.5" fill="#333"/>
      <ellipse cx="236" cy="318" rx="6" ry="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="232" cy="316" r="2" fill="#333"/><circle cx="240" cy="316" r="2" fill="#333"/>
      <path d="M230 324 Q236 330 242 324" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="228" y="375" width="14" height="30" rx="5" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="258" y="375" width="14" height="30" rx="5" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="280" y="375" width="14" height="30" rx="5" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M305 335 Q330 325 325 345 Q320 360 305 350" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="340" cy="380" rx="22" ry="16" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="330" cy="370" r="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="327" cy="368" r="3" fill="#333"/>
      <polygon points="323,374 318,372 318,376" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M332 360 Q336 355 340 362" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M340 395 Q345 400 350 395 Q355 400 360 395" fill="none" stroke="#333" stroke-width="1.5"/>
      <line x1="160" y1="350" x2="370" y2="350" stroke="#333" stroke-width="2"/>
      <line x1="160" y1="370" x2="370" y2="370" stroke="#333" stroke-width="2"/>
      ${[180,220,260,300,340].map(x => `<rect x="${x-4}" y="335" width="8" height="50" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
      <ellipse cx="80" cy="60" rx="30" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="200" cy="50" rx="25" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      ${[40,120,180,300,350].map(x => `<path d="M${x} 420 Q${x-3} 408 ${x+2} 412 Q${x+5} 405 ${x+7} 420" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
    </svg>`,
  },

  // ── 20. Safari Jeep ─────────────────────────────────────
  {
    id: 'ft-safari-jeep',
    title: 'Safari Jeep',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="420" x2="370" y2="420" stroke="#333" stroke-width="2"/>
      <circle cx="330" cy="70" r="32" fill="#fff" stroke="#333" stroke-width="2"/>
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<line x1="${330+30*Math.cos(a*Math.PI/180)}" y1="${70+30*Math.sin(a*Math.PI/180)}" x2="${330+42*Math.cos(a*Math.PI/180)}" y2="${70+42*Math.sin(a*Math.PI/180)}" stroke="#333" stroke-width="2" stroke-linecap="round"/>`).join('')}
      <rect x="60" y="260" width="280" height="100" rx="8" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M100 260 Q100 210 140 200 L260 200 Q300 210 300 260" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <line x1="200" y1="200" x2="200" y2="260" stroke="#333" stroke-width="2"/>
      <rect x="110" y="215" width="80" height="40" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="210" y="215" width="80" height="40" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="120" cy="380" r="35" fill="#fff" stroke="#333" stroke-width="3"/>
      <circle cx="120" cy="380" r="20" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="120" cy="380" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="280" cy="380" r="35" fill="#fff" stroke="#333" stroke-width="3"/>
      <circle cx="280" cy="380" r="20" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="280" cy="380" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="80" y="280" width="50" height="25" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="270" y="280" width="50" height="25" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="155" y="150" width="90" height="10" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <line x1="155" y1="155" x2="155" y2="200" stroke="#333" stroke-width="2"/>
      <line x1="245" y1="155" x2="245" y2="200" stroke="#333" stroke-width="2"/>
      <rect x="30" y="160" width="18" height="100" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="39" cy="130" rx="25" ry="30" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="30" cy="138" rx="15" ry="20" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="48" cy="136" rx="15" ry="20" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="355" y="180" width="16" height="80" rx="3" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="363" cy="150" rx="22" ry="28" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="355" cy="156" rx="13" ry="18" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="371" cy="154" rx="13" ry="18" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <g transform="translate(60, 150)">
        <circle cx="0" cy="0" r="12" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="-4" cy="-3" r="2.5" fill="#333"/>
        <circle cx="4" cy="-3" r="2.5" fill="#333"/>
        <path d="M-3 3 Q0 6 3 3" fill="none" stroke="#333" stroke-width="1"/>
        <path d="M-8 -10 Q-5 -16 -2 -10" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M2 -10 Q5 -16 8 -10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      </g>
      <ellipse cx="100" cy="80" rx="28" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="200" cy="60" rx="22" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M50 460 Q120 450 200 455 Q280 460 350 452" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 21. Birthday Party ──────────────────────────────────
  {
    id: 'ft-birthday-party',
    title: 'Birthday Party',
    emoji: '',
    category: 'featured',
    difficulty: 'easy',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="450" x2="370" y2="450" stroke="#333" stroke-width="2"/>
      <rect x="100" y="250" width="200" height="80" rx="6" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <rect x="85" y="325" width="230" height="60" rx="6" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <rect x="75" y="380" width="250" height="70" rx="6" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M100 250 Q200 235 300 250" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M85 325 Q200 312 315 325" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M75 380 Q200 368 325 380" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M110 280 Q150 270 200 275 Q250 280 290 272" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M100 305 Q150 296 200 300 Q250 304 290 296" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M95 355 Q150 346 200 350 Q250 354 300 346" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M85 420 Q150 412 200 416 Q250 420 315 412" fill="none" stroke="#333" stroke-width="1.5"/>
      ${[150,200,250].map(x => `<g>
        <line x1="${x}" y1="250" x2="${x}" y2="210" stroke="#333" stroke-width="2.5"/>
        <path d="M${x-5} 215 Q${x} 195 ${x+5} 215" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="${x}" cy="192" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>
      </g>`).join('')}
      <circle cx="120" cy="295" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="290" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="280" cy="295" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      ${[{x:60,y:80},{x:340,y:70}].map(({x,y}) => `<g>
        <polygon points="${x},${y} ${x+8},${y+15} ${x-8},${y+15}" fill="#fff" stroke="#333" stroke-width="2"/>
        <rect x="${x-5}" y="${y+15}" width="10" height="4" rx="1" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <line x1="${x}" y1="${y+19}" x2="${x}" y2="${y+60}" stroke="#333" stroke-width="1.5"/>
      </g>`).join('')}
      ${[{x:100,y:100},{x:300,y:90}].map(({x,y}) => `<g>
        <ellipse cx="${x}" cy="${y}" rx="25" ry="32" fill="#fff" stroke="#333" stroke-width="2"/>
        <path d="M${x} ${y+32} L${x-3} ${y+38} L${x+3} ${y+38}Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M${x} ${y+38} Q${x+4} ${y+70} ${x-4} ${y+100}" fill="none" stroke="#333" stroke-width="1.5"/>
        <path d="M${x-6} ${y-10} Q${x} ${y-18} ${x+5} ${y-7}" fill="none" stroke="#333" stroke-width="1.5"/>
      </g>`).join('')}
      <path d="M50 130 Q80 125 100 140" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M50 130 Q45 150 60 155" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M50 130 Q70 140 80 155" fill="none" stroke="#333" stroke-width="1"/>
      <path d="M350 120 Q320 115 300 130" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M350 120 Q355 140 340 145" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M350 120 Q330 130 320 145" fill="none" stroke="#333" stroke-width="1"/>
      ${[[160,80],[200,60],[240,75],[180,100],[220,95]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[{x:50,y:380},{x:350,y:390}].map(({x,y}) => `<g>
        <rect x="${x-12}" y="${y}" width="24" height="35" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
        <rect x="${x-10}" y="${y+3}" width="8" height="8" rx="2" fill="#fff" stroke="#333" stroke-width="1"/>
        <rect x="${x+2}" y="${y+3}" width="8" height="8" rx="2" fill="#fff" stroke="#333" stroke-width="1"/>
        <ellipse cx="${x}" cy="${y+28}" rx="8" ry="5" fill="#fff" stroke="#333" stroke-width="1"/>
      </g>`).join('')}
    </svg>`,
  },

  // ── 22. Cozy Bedroom ────────────────────────────────────
  {
    id: 'ft-cozy-bedroom',
    title: 'Cozy Bedroom',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="30" width="340" height="460" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="30" y1="460" x2="370" y2="460" stroke="#333" stroke-width="2"/>
      <rect x="50" y="280" width="200" height="130" rx="6" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <rect x="50" y="260" width="200" height="30" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="90" cy="275" rx="28" ry="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="160" cy="275" rx="28" ry="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M60 330 Q100 320 150 325 Q200 330 240 322" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M60 360 Q100 350 150 355 Q200 360 240 352" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M60 390 Q100 380 150 385 Q200 390 240 382" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="50" y="410" width="50" height="50" rx="3" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="200" y="410" width="50" height="50" rx="3" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="280" y="320" width="70" height="140" rx="4" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <rect x="285" y="330" width="28" height="35" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="317" y="330" width="28" height="35" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="285" y="375" width="28" height="35" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="317" y="375" width="28" height="35" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="305" cy="430" r="5" fill="#333"/>
      <circle cx="330" cy="430" r="5" fill="#333"/>
      <rect x="80" y="50" width="100" height="80" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="85" y="55" width="90" height="70" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="130" cy="80" r="15" fill="#fff" stroke="#333" stroke-width="2"/>
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<line x1="${130+13*Math.cos(a*Math.PI/180)}" y1="${80+13*Math.sin(a*Math.PI/180)}" x2="${130+18*Math.cos(a*Math.PI/180)}" y2="${80+18*Math.sin(a*Math.PI/180)}" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>`).join('')}
      <ellipse cx="110" cy="105" rx="12" ry="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="145" cy="102" rx="10" ry="5" fill="#fff" stroke="#333" stroke-width="1"/>
      <rect x="280" y="80" width="60" height="90" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="286" y="86" width="20" height="25" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="314" y="86" width="20" height="25" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="286" y="118" width="48" height="20" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="286" y="145" width="48" height="15" rx="2" fill="#fff" stroke="#333" stroke-width="1"/>
      <ellipse cx="200" cy="200" rx="14" ry="18" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="195" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <line x1="200" y1="218" x2="200" y2="260" stroke="#333" stroke-width="2"/>
      <path d="M195 200 Q180 230 170 250" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="320" cy="220" rx="15" ry="20" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="320" cy="215" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="318" cy="213" r="2" fill="#333"/>
      <circle cx="324" cy="213" r="2" fill="#333"/>
      <path d="M316 220 Q320 224 324 220" fill="none" stroke="#333" stroke-width="1"/>
      <path d="M330 235 Q340 245 335 258" fill="none" stroke="#333" stroke-width="1.5"/>
      ${[[50,200],[350,50]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
    </svg>`,
  },

  // ── 23. Hot Air Balloon Adventure ───────────────────────
  {
    id: 'ft-balloon-adventure',
    title: 'Balloon Adventure',
    emoji: '',
    category: 'featured',
    difficulty: 'medium',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="200" cy="165" rx="100" ry="130" fill="#fff" stroke="#333" stroke-width="3"/>
      <path d="M200 35 L200 295" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M115 55 Q158 35 200 55 Q242 35 285 55" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M105 100 Q153 80 200 100 Q247 80 295 100" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M102 150 Q151 130 200 150 Q249 130 298 150" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M105 200 Q153 180 200 200 Q247 180 295 200" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M115 245 Q158 225 200 245 Q242 225 285 245" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M140 280 Q170 295 200 290 Q230 295 260 280" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="155" y1="290" x2="160" y2="340" stroke="#333" stroke-width="2"/>
      <line x1="245" y1="290" x2="240" y2="340" stroke="#333" stroke-width="2"/>
      <line x1="200" y1="295" x2="200" y2="345" stroke="#333" stroke-width="2"/>
      <rect x="155" y="340" width="90" height="55" rx="6" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <line x1="155" y1="365" x2="245" y2="365" stroke="#333" stroke-width="1.5"/>
      <rect x="170" y="348" width="20" height="14" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="210" y="348" width="20" height="14" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="185" cy="380" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="215" cy="380" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="183" cy="378" r="2.5" fill="#333"/><circle cx="213" cy="378" r="2.5" fill="#333"/>
      <ellipse cx="70" cy="280" rx="32" ry="16" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="52" cy="285" rx="20" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="88" cy="285" rx="20" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="340" cy="200" rx="28" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="325" cy="205" rx="18" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="355" cy="205" rx="18" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="60" cy="120" rx="24" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="48" cy="124" rx="15" ry="8" fill="#fff" stroke="#333" stroke-width="1"/>
      ${[[40,350],[360,310],[50,50],[350,60],[200,420]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
      <path d="M30 460 Q100 445 200 455 Q300 465 370 450" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M30 480 Q120 470 200 475 Q280 480 370 472" fill="none" stroke="#333" stroke-width="1.5"/>
      <g transform="translate(80, 440)">
        <rect x="-3" y="0" width="6" height="20" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="0" cy="-8" rx="14" ry="12" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="-5" cy="-4" rx="8" ry="8" fill="#fff" stroke="#333" stroke-width="1"/>
        <ellipse cx="5" cy="-5" rx="8" ry="8" fill="#fff" stroke="#333" stroke-width="1"/>
      </g>
      <g transform="translate(320, 435)">
        <rect x="-3" y="0" width="6" height="18" rx="2" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="0" cy="-6" rx="12" ry="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="-4" cy="-3" rx="7" ry="7" fill="#fff" stroke="#333" stroke-width="1"/>
        <ellipse cx="4" cy="-4" rx="7" ry="7" fill="#fff" stroke="#333" stroke-width="1"/>
      </g>
      <g transform="translate(330, 380)">
        <ellipse cx="0" cy="0" rx="10" ry="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="-3" cy="-2" r="1.5" fill="#333"/>
        <polygon points="8,0 14,-3 14,3" fill="#fff" stroke="#333" stroke-width="1"/>
        <path d="M-8 4 Q-5 8 -2 4" fill="none" stroke="#333" stroke-width="1"/>
      </g>
      <path d="M200,420 L205,408 L215,418 L220,405 L225,417 L218,410Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },

  // ── 24. Ocean Castle ────────────────────────────────────
  {
    id: 'ft-ocean-castle',
    title: 'Ocean Castle',
    emoji: '',
    category: 'featured',
    difficulty: 'hard',
    svgOutline: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 60 Q50 45 100 60 Q150 75 200 60 Q250 45 300 60 Q350 75 400 60" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Castle main -->
      <rect x="110" y="180" width="180" height="230" rx="4" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <!-- Left tower -->
      <rect x="55" y="130" width="55" height="280" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M50 135 Q82 80 115 135" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Right tower -->
      <rect x="290" y="130" width="55" height="280" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M285 135 Q317 80 350 135" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Center spire -->
      <polygon points="185,180 200,110 215,180" fill="#fff" stroke="#333" stroke-width="2"/>
      <!-- Shell door -->
      <path d="M175 340 Q200 310 225 340 L225 410 Q200 420 175 410Z" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M180 345 Q190 335 200 340 Q210 335 220 345" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M182 355 Q192 348 200 352 Q208 348 218 355" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M184 365 Q194 360 200 363 Q206 360 216 365" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="215" cy="380" r="4" fill="#333"/>
      <!-- Arched windows -->
      <rect x="125" y="210" width="28" height="38" rx="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <line x1="139" y1="210" x2="139" y2="248" stroke="#333" stroke-width="1.5"/>
      <rect x="247" y="210" width="28" height="38" rx="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <line x1="261" y1="210" x2="261" y2="248" stroke="#333" stroke-width="1.5"/>
      <!-- Rose window -->
      <circle cx="200" cy="160" r="20" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="160" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <line x1="210.0" y1="160.0" x2="218.0" y2="160.0" stroke="#333" stroke-width="1.5"/><line x1="207.07106781186548" y1="167.07106781186548" x2="212.72792206135784" y2="172.72792206135784" stroke="#333" stroke-width="1.5"/><line x1="200.0" y1="170.0" x2="200.0" y2="178.0" stroke="#333" stroke-width="1.5"/><line x1="192.92893218813452" y1="167.07106781186548" x2="187.27207793864216" y2="172.72792206135784" stroke="#333" stroke-width="1.5"/><line x1="190.0" y1="160.0" x2="182.0" y2="160.0" stroke="#333" stroke-width="1.5"/><line x1="192.92893218813452" y1="152.92893218813452" x2="187.27207793864216" y2="147.27207793864216" stroke="#333" stroke-width="1.5"/><line x1="200.0" y1="150.0" x2="200.0" y2="142.0" stroke="#333" stroke-width="1.5"/><line x1="207.07106781186548" y1="152.92893218813452" x2="212.72792206135784" y2="147.27207793864216" stroke="#333" stroke-width="1.5"/>
      <!-- Tower windows -->
      <circle cx="82" cy="180" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="82" cy="240" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="82" cy="300" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="317" cy="180" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="317" cy="240" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="317" cy="300" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Flags -->
      <line x1="82" y1="80" x2="82" y2="50" stroke="#333" stroke-width="2"/>
      <polygon points="82,50 102,58 82,66" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <line x1="317" y1="80" x2="317" y2="50" stroke="#333" stroke-width="2"/>
      <polygon points="317,50 337,58 317,66" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Coral left -->
      <path d="M35 400 Q40 370 45 380 Q50 360 55 375 Q60 355 65 380 Q70 365 70 400" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M42 400 Q47 380 52 385" fill="none" stroke="#333" stroke-width="1"/>
      <path d="M55 400 Q58 378 63 385" fill="none" stroke="#333" stroke-width="1"/>
      <!-- Coral right -->
      <path d="M340 395 Q345 365 350 378 Q355 355 360 372 Q365 350 370 375 Q375 360 378 395" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M347 395 Q352 375 357 380" fill="none" stroke="#333" stroke-width="1"/>
      <!-- Seaweed -->
      <path d="M30 480 Q40 440 30 400 Q20 360 30 330" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M380 480 Q390 445 380 410 Q370 375 380 345" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Shell decorations on castle -->
      <ellipse cx="145" cy="280" rx="10" ry="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M137 280 Q141 276 145 280 Q149 276 153 280" fill="none" stroke="#333" stroke-width="1"/>
      <ellipse cx="255" cy="280" rx="10" ry="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M247 280 Q251 276 255 280 Q259 276 263 280" fill="none" stroke="#333" stroke-width="1"/>
      <!-- Fish -->
      <ellipse cx="50" cy="260" rx="16" ry="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <polygon points="66,260 78,250 78,270" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="42" cy="257" r="3" fill="#333"/>
      <ellipse cx="360" cy="220" rx="14" ry="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <polygon points="374,220 384,213 384,227" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="354" cy="217" r="2.5" fill="#333"/>
      <!-- Starfish -->
      <path d="M130 450 L133 438 L140 448 L145 435 L148 448 L142 440Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M280 455 L283 443 L290 452 L295 440 L298 453 L292 445Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <!-- Bubbles -->
      <circle cx="45" cy="150" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="35" cy="130" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="365" cy="160" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="375" cy="140" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="200" cy="450" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <!-- Sand bottom -->
      <path d="M30 480 Q100 468 200 475 Q300 482 370 470" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
];
