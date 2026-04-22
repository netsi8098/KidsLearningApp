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
      <path d="M0 100 Q50 85 100 100 Q150 115 200 100 Q250 85 300 100 Q350 115 400 100" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="200" r="45" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M175 180 Q165 150 175 140 Q185 135 190 155" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M225 180 Q235 150 225 140 Q215 135 210 155" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M165 190 Q150 175 140 190 Q135 205 150 210" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M235 190 Q250 175 260 190 Q265 205 250 210" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="185" cy="195" r="5" fill="#333"/><circle cx="215" cy="195" r="5" fill="#333"/>
      <circle cx="187" cy="193" r="2" fill="#fff"/><circle cx="217" cy="193" r="2" fill="#fff"/>
      <path d="M193 215 Q200 222 207 215" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M175 245 Q200 260 225 245 L220 340 Q200 355 180 340Z" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M185 290 Q195 285 205 290" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M185 310 Q195 305 205 310" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M185 330 Q195 325 205 330" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M180 340 Q160 380 130 400 Q110 410 100 395 Q105 380 125 365" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M220 340 Q240 380 270 400 Q290 410 300 395 Q295 380 275 365" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M100 395 Q85 405 70 395 Q65 385 80 380" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M300 395 Q315 405 330 395 Q335 385 320 380" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M40 430 Q50 410 60 430 Q70 450 80 430" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M300 440 Q310 420 320 440 Q330 460 340 440" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M150 450 Q160 435 170 450 Q180 465 190 450" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="70" cy="180" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="55" cy="160" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="80" cy="150" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="340" cy="200" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="320" cy="300" rx="18" ry="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <polygon points="338,300 352,290 352,310" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="312" cy="297" r="3" fill="#333"/>
      <ellipse cx="80" cy="350" rx="14" ry="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <polygon points="66,350 55,343 55,357" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="87" cy="347" r="2.5" fill="#333"/>
      <path d="M160 130 Q170 120 180 130" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M220 130 Q230 120 240 130" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M30 480 Q100 468 200 475 Q300 482 370 470" fill="none" stroke="#333" stroke-width="1.5"/>
      ${[[50,120],[350,130],[60,270],[340,260]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#333" stroke-width="1"/>`).join('')}
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
      <ellipse cx="200" cy="310" rx="90" ry="65" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="130" cy="230" r="45" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M165 265 Q170 290 175 310" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M145 265 Q155 285 160 300" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M110 200 Q95 175 105 165" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M140 195 Q145 168 135 162" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="118" cy="222" r="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="142" cy="222" r="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="120" cy="220" r="4" fill="#333"/><circle cx="144" cy="220" r="4" fill="#333"/>
      <path d="M125 240 Q130 248 140 240" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M110 245 Q115 252 120 245 Q125 252 130 245 Q135 252 140 245 Q145 252 150 245" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M165 290 Q200 260 235 280" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M170 310 Q200 285 230 300" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="145" y="365" width="22" height="50" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="185" y="365" width="22" height="50" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="220" y="365" width="22" height="50" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="255" y="365" width="22" height="50" rx="8" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M285 300 Q310 290 320 300 Q335 320 315 330 Q300 335 290 320" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M150 300 Q130 285 140 275 Q160 270 160 285 L155 295" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="30" y="280" width="18" height="120" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="39" cy="230" rx="30" ry="40" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="30" cy="240" rx="18" ry="25" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="48" cy="238" rx="18" ry="25" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="350" y="300" width="16" height="100" rx="3" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="358" cy="260" rx="28" ry="35" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="348" cy="268" rx="16" ry="22" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="368" cy="266" rx="16" ry="22" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="80" r="30" fill="#fff" stroke="#333" stroke-width="2"/>
      ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => `<line x1="${200+28*Math.cos(a*Math.PI/180)}" y1="${80+28*Math.sin(a*Math.PI/180)}" x2="${200+40*Math.cos(a*Math.PI/180)}" y2="${80+40*Math.sin(a*Math.PI/180)}" stroke="#333" stroke-width="2" stroke-linecap="round"/>`).join('')}
      <ellipse cx="100" cy="80" rx="28" ry="14" fill="#fff" stroke="#333" stroke-width="2"/>
      <ellipse cx="85" cy="85" rx="18" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="300" cy="60" rx="25" ry="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M250 460 L255 440 L265 455 L275 438 L280 458 L270 448Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
      ${[60,160,300,350].map(x => `<path d="M${x} 440 Q${x-3} 428 ${x+2} 432 Q${x+5} 425 ${x+7} 440" fill="none" stroke="#333" stroke-width="1.5"/>`).join('')}
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
      <circle cx="200" cy="140" r="40" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M170 115 Q165 90 175 80 Q185 75 190 95" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M230 115 Q235 90 225 80 Q215 75 210 95" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M160 125 Q140 105 130 120 Q125 140 145 145" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M240 125 Q260 105 270 120 Q275 140 255 145" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="188" cy="135" r="5" fill="#333"/><circle cx="212" cy="135" r="5" fill="#333"/>
      <circle cx="190" cy="133" r="2" fill="#fff"/><circle cx="214" cy="133" r="2" fill="#fff"/>
      <path d="M195 155 Q200 160 205 155" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M180 95 Q190 80 200 70 Q210 80 220 95" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M188 82 Q200 60 212 82" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="62" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="188" cy="72" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="212" cy="72" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      <path d="M170 180 Q200 195 230 180 L225 290 Q200 300 175 290Z" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M175 290 Q150 350 120 420 L200 440 L280 420 Q250 350 225 290" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M140 380 Q170 370 200 375 Q230 370 260 380" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M130 400 Q165 390 200 395 Q235 390 270 400" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M125 420 Q163 410 200 415 Q237 410 275 420" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M190 200 Q195 210 190 220" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M200 200 Q205 210 200 220" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M210 200 Q215 210 210 220" fill="none" stroke="#333" stroke-width="1.5"/>
      ${[60,340].map(x => `<g>
        <line x1="${x}" y1="450" x2="${x}" y2="380" stroke="#333" stroke-width="2"/>
        <circle cx="${x}" cy="370" r="16" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="${x}" cy="370" r="8" fill="#fff" stroke="#333" stroke-width="1.5"/>
        ${[0,60,120,180,240,300].map(a => `<ellipse cx="${x+13*Math.cos(a*Math.PI/180)}" cy="${370+13*Math.sin(a*Math.PI/180)}" rx="7" ry="4" fill="#fff" stroke="#333" stroke-width="1.5" transform="rotate(${a} ${x+13*Math.cos(a*Math.PI/180)} ${370+13*Math.sin(a*Math.PI/180)})"/>`).join('')}
        <ellipse cx="${x-10}" cy="410" rx="9" ry="5" fill="#fff" stroke="#333" stroke-width="1.5" transform="rotate(-20 ${x-10} 410)"/>
        <ellipse cx="${x+10}" cy="415" rx="9" ry="5" fill="#fff" stroke="#333" stroke-width="1.5" transform="rotate(20 ${x+10} 415)"/>
      </g>`).join('')}
      ${[[50,100],[350,90],[55,250],[345,260]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
      <g transform="translate(320, 180)">
        <ellipse cx="0" cy="0" rx="1.5" ry="7" fill="#333"/>
        <ellipse cx="-10" cy="-4" rx="10" ry="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="10" cy="-4" rx="10" ry="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="-8" cy="5" rx="7" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <ellipse cx="8" cy="5" rx="7" ry="5" fill="#fff" stroke="#333" stroke-width="1.5"/>
      </g>
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
      <circle cx="200" cy="240" r="55" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="200" cy="240" r="42" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="240" r="30" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <g transform="translate(200, 230)">
        <circle cx="0" cy="0" r="18" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="-6" cy="-3" r="3" fill="#333"/><circle cx="6" cy="-3" r="3" fill="#333"/>
        <path d="M-4 5 Q0 9 4 5" fill="none" stroke="#333" stroke-width="1.5"/>
        <circle cx="-14" cy="-14" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="14" cy="-14" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="-14" cy="-14" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
        <circle cx="14" cy="-14" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
      </g>
      <g transform="translate(90, 150)">
        <path d="M0 -30 Q-8 -15 -10 0 L-10 25 Q-10 32 -5 35 L5 35 Q10 32 10 25 L10 0 Q8 -15 0 -30Z" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="0" cy="5" r="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M-10 15 L-18 28 L-10 22" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M10 15 L18 28 L10 22" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M-5 35 Q0 42 5 35" fill="#fff" stroke="#333" stroke-width="1.5"/>
      </g>
      <g transform="translate(310, 330)">
        <ellipse cx="0" cy="0" rx="25" ry="18" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="-12" cy="-8" r="8" fill="#fff" stroke="#333" stroke-width="2"/>
        <circle cx="-14" cy="-10" r="3" fill="#333"/>
        <ellipse cx="15" cy="-2" rx="6" ry="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <path d="M-20 5 Q-25 10 -22 15" fill="none" stroke="#333" stroke-width="1.5"/>
        <path d="M20 8 Q26 12 22 18" fill="none" stroke="#333" stroke-width="1.5"/>
        <path d="M-8 15 Q0 20 8 15" fill="none" stroke="#333" stroke-width="1"/>
      </g>
      ${[[50,80],[130,60],[280,50],[350,90],[40,350],[360,420],[200,450]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="${3+Math.random()*3|0}" fill="#fff" stroke="#333" stroke-width="1.5"/>`).join('')}
      ${[[80,300],[320,150],[60,200],[340,250]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#fff" stroke="#333" stroke-width="1"/>`).join('')}
      <polygon points="50,420 55,405 65,415 72,400 77,418 70,410Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <polygon points="330,70 335,55 345,65 350,52 355,68 348,60Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="320" cy="460" r="22" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="320" cy="460" r="14" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M310 450 Q320 445 330 450" fill="none" stroke="#333" stroke-width="1"/>
      <path d="M308 460 Q320 465 332 460" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="80" cy="440" r="18" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="80" cy="440" r="10" fill="#fff" stroke="#333" stroke-width="1.5"/>
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
      <rect x="80" y="230" width="240" height="220" rx="4" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <polygon points="60,235 200,100 340,235" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M80,235 Q120,225 160,235 Q200,245 240,235 Q280,225 320,235" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M100,235 Q130,228 160,235" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M240,235 Q270,228 300,235" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="165" y="360" width="70" height="90" rx="6" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="225" cy="410" r="5" fill="#333"/>
      <path d="M175 360 Q200 345 225 360" fill="none" stroke="#333" stroke-width="1.5"/>
      <circle cx="120" cy="290" r="22" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M108 280 Q120 268 132 280" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M108 300 Q120 312 132 300" fill="none" stroke="#333" stroke-width="1.5"/>
      <line x1="120" y1="268" x2="120" y2="312" stroke="#333" stroke-width="1.5"/>
      <circle cx="280" cy="290" r="22" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <path d="M268 280 Q280 268 292 280" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M268 300 Q280 312 292 300" fill="none" stroke="#333" stroke-width="1.5"/>
      <line x1="280" y1="268" x2="280" y2="312" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="180" r="16" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M100 340 Q140 330 180 340 Q220 350 260 340 Q300 330 340 340" fill="none" stroke="#333" stroke-width="1.5"/>
      <path d="M100 380 Q140 370 180 380 Q220 390 260 380 Q300 370 340 380" fill="none" stroke="#333" stroke-width="1.5"/>
      <rect x="260" y="150" width="25" height="80" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M255 150 Q272 130 290 150" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M260 160 Q272 145 285 160" fill="none" stroke="#333" stroke-width="1"/>
      <path d="M260 180 Q272 165 285 180" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="120" cy="400" r="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M115 395 Q120 390 125 395" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="280" cy="400" r="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <path d="M275 395 Q280 390 285 395" fill="none" stroke="#333" stroke-width="1"/>
      ${[50,350].map(x => `<g>
        <circle cx="${x}" cy="420" r="14" fill="#fff" stroke="#333" stroke-width="2"/>
        <path d="M${x} 406 Q${x+4} 412 ${x} 418 Q${x-4} 424 ${x} 430" fill="none" stroke="#333" stroke-width="1.5"/>
        <line x1="${x}" y1="434" x2="${x}" y2="450" stroke="#333" stroke-width="2"/>
      </g>`).join('')}
      <ellipse cx="200" cy="490" rx="80" ry="10" fill="none" stroke="#333" stroke-width="1.5"/>
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
      <polygon points="200,420 205,408 215,418 220,405 225,417 218,410Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
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
      <path d="M0 70 Q50 55 100 70 Q150 85 200 70 Q250 55 300 70 Q350 85 400 70" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="120" y="180" width="160" height="220" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <rect x="65" y="140" width="50" height="260" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <rect x="285" y="140" width="50" height="260" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <polygon points="60,145 90,90 120,145" fill="#fff" stroke="#333" stroke-width="2"/>
      <polygon points="280,145 310,90 340,145" fill="#fff" stroke="#333" stroke-width="2"/>
      <polygon points="120,185 200,120 280,185" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="175" y="320" width="50" height="80" rx="25" fill="#fff" stroke="#333" stroke-width="2.5"/>
      <circle cx="215" cy="365" r="4" fill="#333"/>
      <rect x="140" y="210" width="30" height="35" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="230" y="210" width="30" height="35" rx="4" fill="#fff" stroke="#333" stroke-width="2"/>
      <circle cx="200" cy="160" r="16" fill="#fff" stroke="#333" stroke-width="2"/>
      <rect x="75" y="180" width="28" height="20" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="75" y="240" width="28" height="20" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="295" y="180" width="28" height="20" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <rect x="295" y="240" width="28" height="20" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <path d="M40 420 Q50 400 60 420 Q70 440 80 420" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M300 430 Q310 410 320 430 Q330 450 340 430" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M150 420 Q160 405 170 420 Q180 435 190 420" fill="none" stroke="#333" stroke-width="1.5"/>
      <ellipse cx="55" cy="300" rx="20" ry="12" fill="#fff" stroke="#333" stroke-width="2"/>
      <polygon points="75,300 90,290 90,310" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="48" cy="297" r="3" fill="#333"/>
      <ellipse cx="350" cy="250" rx="18" ry="10" fill="#fff" stroke="#333" stroke-width="2"/>
      <polygon points="368,250 380,242 380,258" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="344" cy="247" r="3" fill="#333"/>
      <polygon points="250,430 255,418 265,428 270,415 275,427 268,420Z" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="40" cy="170" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
      <circle cx="360" cy="130" r="6" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="450" r="4" fill="#fff" stroke="#333" stroke-width="1"/>
      <path d="M30 475 Q100 465 200 470 Q300 475 370 467" fill="none" stroke="#333" stroke-width="1.5"/>
    </svg>`,
  },
];
