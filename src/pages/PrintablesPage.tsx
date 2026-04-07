import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { alphabetData } from '../data/alphabetData';
import { numbersData } from '../data/numbersData';
import { shapesData } from '../data/shapesData';
import { colorsData } from '../data/colorsData';
import NavButton from '../components/NavButton';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TabKey = 'alphabet' | 'numbers' | 'coloring' | 'worksheets';

interface PrintableItem {
  id: string;
  title: string;
  description: string;
  previewEmoji: string;
  category: TabKey;
}

/* ------------------------------------------------------------------ */
/*  Tabs definition                                                    */
/* ------------------------------------------------------------------ */

const tabs: { key: TabKey; label: string; emoji: string; color: string; softBg: string }[] = [
  { key: 'alphabet', label: 'Alphabet Tracing', emoji: '✏️', color: '#FF6B6B', softBg: '#FFF0F0' },
  { key: 'numbers', label: 'Number Tracing', emoji: '🔢', color: '#4ECDC4', softBg: '#EDFAF8' },
  { key: 'coloring', label: 'Coloring Pages', emoji: '🎨', color: '#A78BFA', softBg: '#F3EFFE' },
  { key: 'worksheets', label: 'Worksheets', emoji: '📝', color: '#FF8C42', softBg: '#FFF3EB' },
];

/* Difficulty labels for visual badges */
const categoryDifficulty: Record<TabKey, { label: string; dot: string }> = {
  alphabet: { label: 'Easy', dot: '🟢' },
  numbers: { label: 'Easy', dot: '🟢' },
  coloring: { label: 'Easy', dot: '🟢' },
  worksheets: { label: 'Medium', dot: '🟡' },
};

/* ------------------------------------------------------------------ */
/*  Generate catalogue items                                           */
/* ------------------------------------------------------------------ */

function buildCatalogue(): PrintableItem[] {
  const items: PrintableItem[] = [];

  // Alphabet tracing: one per letter
  alphabetData.forEach((a) => {
    items.push({
      id: `alpha-${a.letter}`,
      title: `Trace Letter ${a.upper}`,
      description: `${a.upper} is for ${a.word} ${a.emoji}`,
      previewEmoji: a.emoji,
      category: 'alphabet',
    });
  });

  // Number tracing: one per number
  numbersData.forEach((n) => {
    items.push({
      id: `num-${n.number}`,
      title: `Trace Number ${n.number}`,
      description: `${n.word} ${n.emoji.repeat(Math.min(n.number, 10))}`,
      previewEmoji: n.emoji,
      category: 'numbers',
    });
  });

  // Coloring pages: from shapes
  shapesData.forEach((s) => {
    items.push({
      id: `color-${s.name}`,
      title: `Color the ${s.name}`,
      description: `A big ${s.name.toLowerCase()} outline to color in!`,
      previewEmoji: s.emoji,
      category: 'coloring',
    });
  });

  // Worksheets
  items.push(
    {
      id: 'ws-letter-match',
      title: 'Letter Matching',
      description: 'Match uppercase to lowercase letters',
      previewEmoji: '🔤',
      category: 'worksheets',
    },
    {
      id: 'ws-number-match',
      title: 'Number Matching',
      description: 'Match numbers to the right quantity',
      previewEmoji: '🔢',
      category: 'worksheets',
    },
    {
      id: 'ws-shape-id',
      title: 'Shape Identification',
      description: 'Circle the correct shape name',
      previewEmoji: '🔷',
      category: 'worksheets',
    },
    {
      id: 'ws-color-by-number',
      title: 'Color by Number',
      description: 'Use the key to color each cell',
      previewEmoji: '🖍️',
      category: 'worksheets',
    },
  );

  return items;
}

const catalogue = buildCatalogue();

/* ------------------------------------------------------------------ */
/*  SVG Printable renderers                                            */
/* ------------------------------------------------------------------ */

/** Stroke-order dots for uppercase letters (simplified). */
function letterStrokeDots(letter: string): { x: number; y: number }[] {
  // Provide a rough set of guide dots per letter for tracing.
  // These map onto a 200x200 viewBox centred roughly around the letter.
  const dots: Record<string, { x: number; y: number }[]> = {
    A: [{ x: 30, y: 170 }, { x: 100, y: 20 }, { x: 170, y: 170 }, { x: 60, y: 110 }, { x: 140, y: 110 }],
    B: [{ x: 40, y: 20 }, { x: 40, y: 170 }, { x: 40, y: 20 }, { x: 130, y: 45 }, { x: 130, y: 75 }, { x: 40, y: 95 }, { x: 140, y: 120 }, { x: 140, y: 150 }, { x: 40, y: 170 }],
    C: [{ x: 160, y: 45 }, { x: 100, y: 20 }, { x: 45, y: 65 }, { x: 40, y: 130 }, { x: 100, y: 170 }, { x: 160, y: 150 }],
    D: [{ x: 40, y: 20 }, { x: 40, y: 170 }, { x: 40, y: 20 }, { x: 120, y: 40 }, { x: 155, y: 95 }, { x: 120, y: 155 }, { x: 40, y: 170 }],
    E: [{ x: 40, y: 20 }, { x: 40, y: 170 }, { x: 40, y: 20 }, { x: 150, y: 20 }, { x: 40, y: 95 }, { x: 130, y: 95 }, { x: 40, y: 170 }, { x: 150, y: 170 }],
    F: [{ x: 40, y: 20 }, { x: 40, y: 170 }, { x: 40, y: 20 }, { x: 150, y: 20 }, { x: 40, y: 95 }, { x: 130, y: 95 }],
    G: [{ x: 150, y: 45 }, { x: 100, y: 20 }, { x: 45, y: 60 }, { x: 40, y: 130 }, { x: 100, y: 170 }, { x: 155, y: 140 }, { x: 155, y: 100 }, { x: 110, y: 100 }],
    H: [{ x: 40, y: 20 }, { x: 40, y: 170 }, { x: 40, y: 95 }, { x: 160, y: 95 }, { x: 160, y: 20 }, { x: 160, y: 170 }],
    I: [{ x: 60, y: 20 }, { x: 140, y: 20 }, { x: 100, y: 20 }, { x: 100, y: 170 }, { x: 60, y: 170 }, { x: 140, y: 170 }],
    J: [{ x: 60, y: 20 }, { x: 150, y: 20 }, { x: 120, y: 20 }, { x: 120, y: 140 }, { x: 90, y: 170 }, { x: 50, y: 150 }],
    K: [{ x: 40, y: 20 }, { x: 40, y: 170 }, { x: 150, y: 20 }, { x: 40, y: 100 }, { x: 150, y: 170 }],
    L: [{ x: 40, y: 20 }, { x: 40, y: 170 }, { x: 150, y: 170 }],
    M: [{ x: 30, y: 170 }, { x: 30, y: 20 }, { x: 100, y: 100 }, { x: 170, y: 20 }, { x: 170, y: 170 }],
    N: [{ x: 40, y: 170 }, { x: 40, y: 20 }, { x: 160, y: 170 }, { x: 160, y: 20 }],
    O: [{ x: 100, y: 20 }, { x: 155, y: 60 }, { x: 160, y: 130 }, { x: 100, y: 170 }, { x: 45, y: 130 }, { x: 40, y: 60 }, { x: 100, y: 20 }],
    P: [{ x: 40, y: 170 }, { x: 40, y: 20 }, { x: 130, y: 25 }, { x: 145, y: 55 }, { x: 130, y: 90 }, { x: 40, y: 95 }],
    Q: [{ x: 100, y: 20 }, { x: 155, y: 60 }, { x: 160, y: 130 }, { x: 100, y: 170 }, { x: 45, y: 130 }, { x: 40, y: 60 }, { x: 100, y: 20 }, { x: 130, y: 140 }, { x: 170, y: 180 }],
    R: [{ x: 40, y: 170 }, { x: 40, y: 20 }, { x: 130, y: 25 }, { x: 145, y: 55 }, { x: 130, y: 90 }, { x: 40, y: 95 }, { x: 100, y: 95 }, { x: 155, y: 170 }],
    S: [{ x: 150, y: 40 }, { x: 100, y: 20 }, { x: 50, y: 40 }, { x: 50, y: 70 }, { x: 100, y: 95 }, { x: 150, y: 120 }, { x: 150, y: 150 }, { x: 100, y: 170 }, { x: 50, y: 155 }],
    T: [{ x: 30, y: 20 }, { x: 170, y: 20 }, { x: 100, y: 20 }, { x: 100, y: 170 }],
    U: [{ x: 40, y: 20 }, { x: 40, y: 130 }, { x: 60, y: 165 }, { x: 100, y: 175 }, { x: 140, y: 165 }, { x: 160, y: 130 }, { x: 160, y: 20 }],
    V: [{ x: 30, y: 20 }, { x: 100, y: 170 }, { x: 170, y: 20 }],
    W: [{ x: 20, y: 20 }, { x: 55, y: 170 }, { x: 100, y: 80 }, { x: 145, y: 170 }, { x: 180, y: 20 }],
    X: [{ x: 30, y: 20 }, { x: 170, y: 170 }, { x: 170, y: 20 }, { x: 30, y: 170 }],
    Y: [{ x: 30, y: 20 }, { x: 100, y: 100 }, { x: 170, y: 20 }, { x: 100, y: 100 }, { x: 100, y: 170 }],
    Z: [{ x: 30, y: 20 }, { x: 170, y: 20 }, { x: 30, y: 170 }, { x: 170, y: 170 }],
  };
  return dots[letter] ?? [{ x: 100, y: 95 }];
}

function AlphabetTracingSVG({ letter }: { letter: string }) {
  const item = alphabetData.find((a) => a.letter === letter)!;
  const dots = letterStrokeDots(letter);

  return (
    <svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Title */}
      <text x="200" y="40" textAnchor="middle" fontSize="28" fontWeight="bold" fontFamily="sans-serif" fill="#333">
        Trace the Letter {item.upper}{item.lower}
      </text>
      <text x="200" y="70" textAnchor="middle" fontSize="18" fontFamily="sans-serif" fill="#666">
        {item.upper} is for {item.word} {item.emoji}
      </text>

      {/* Large dotted letter outline */}
      <text
        x="200"
        y="290"
        textAnchor="middle"
        fontSize="220"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        fill="none"
        stroke="#ccc"
        strokeWidth="3"
        strokeDasharray="8 6"
      >
        {item.upper}
      </text>

      {/* Stroke-order dots inside a sub-group offset to letter center */}
      <g transform="translate(100,100)">
        {dots.map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="8" fill="#FF6B6B" opacity="0.85" />
            <text x={d.x} y={d.y + 5} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
              {i + 1}
            </text>
          </g>
        ))}
      </g>

      {/* Practice line */}
      <line x1="30" y1="380" x2="370" y2="380" stroke="#bbb" strokeWidth="1.5" strokeDasharray="6 4" />
      <line x1="30" y1="420" x2="370" y2="420" stroke="#bbb" strokeWidth="1.5" strokeDasharray="6 4" />
      <line x1="30" y1="460" x2="370" y2="460" stroke="#bbb" strokeWidth="1.5" strokeDasharray="6 4" />
      <line x1="30" y1="500" x2="370" y2="500" stroke="#bbb" strokeWidth="1.5" strokeDasharray="6 4" />

      <text x="30" y="375" fontSize="11" fill="#aaa" fontFamily="sans-serif">
        Practice below:
      </text>
    </svg>
  );
}

function NumberTracingSVG({ num }: { num: number }) {
  const item = numbersData.find((n) => n.number === num)!;
  const emojiCount = Math.min(num, 20);

  return (
    <svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Title */}
      <text x="200" y="40" textAnchor="middle" fontSize="28" fontWeight="bold" fontFamily="sans-serif" fill="#333">
        Trace the Number {num}
      </text>
      <text x="200" y="70" textAnchor="middle" fontSize="18" fontFamily="sans-serif" fill="#666">
        {item.word}
      </text>

      {/* Large dotted number */}
      <text
        x="200"
        y="260"
        textAnchor="middle"
        fontSize="200"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        fill="none"
        stroke="#ccc"
        strokeWidth="3"
        strokeDasharray="8 6"
      >
        {num}
      </text>

      {/* Countable objects in a wrap layout */}
      <text x="200" y="310" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#888">
        Count the objects:
      </text>
      <foreignObject x="30" y="320" width="340" height="70">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            justifyContent: 'center',
            fontSize: '22px',
            lineHeight: 1.3,
          }}
        >
          {Array.from({ length: emojiCount }).map((_, i) => (
            <span key={i}>{item.emoji}</span>
          ))}
        </div>
      </foreignObject>

      {/* Practice lines */}
      <line x1="30" y1="410" x2="370" y2="410" stroke="#bbb" strokeWidth="1.5" strokeDasharray="6 4" />
      <line x1="30" y1="450" x2="370" y2="450" stroke="#bbb" strokeWidth="1.5" strokeDasharray="6 4" />
      <line x1="30" y1="490" x2="370" y2="490" stroke="#bbb" strokeWidth="1.5" strokeDasharray="6 4" />

      <text x="30" y="405" fontSize="11" fill="#aaa" fontFamily="sans-serif">
        Practice below:
      </text>
    </svg>
  );
}

function ColoringPageSVG({ shapeName }: { shapeName: string }) {
  const shape = shapesData.find((s) => s.name === shapeName)!;

  return (
    <svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <text x="200" y="40" textAnchor="middle" fontSize="28" fontWeight="bold" fontFamily="sans-serif" fill="#333">
        Color the {shape.name}
      </text>
      <text x="200" y="65" textAnchor="middle" fontSize="14" fontFamily="sans-serif" fill="#888">
        {shape.funFact}
      </text>

      {/* Large outlined shape centred in the page */}
      <g transform="translate(80, 90) scale(2.6)">
        <path d={shape.svgPath} fill="none" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
      </g>

      <text x="200" y="460" textAnchor="middle" fontSize="16" fontFamily="sans-serif" fill="#999">
        {shape.name} {shape.emoji}
      </text>
    </svg>
  );
}

function LetterMatchingWorksheet() {
  // Pick 8 random pairs - stabilized with useState so they don't change on re-render
  const [shuffled] = useState(() => [...alphabetData].sort(() => Math.random() - 0.5).slice(0, 8));
  const [rightColumn] = useState(() => [...shuffled].sort(() => Math.random() - 0.5));

  return (
    <svg viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <text x="200" y="35" textAnchor="middle" fontSize="24" fontWeight="bold" fontFamily="sans-serif" fill="#333">
        Letter Matching
      </text>
      <text x="200" y="58" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#888">
        Draw a line from each uppercase letter to its lowercase partner
      </text>

      <text x="80" y="90" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#FF6B6B" fontFamily="sans-serif">
        UPPERCASE
      </text>
      <text x="320" y="90" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#4ECDC4" fontFamily="sans-serif">
        lowercase
      </text>

      {shuffled.map((item, i) => {
        const y = 120 + i * 54;
        return (
          <g key={item.letter}>
            {/* Left: uppercase in a circle */}
            <circle cx="80" cy={y} r="22" fill="none" stroke="#FF6B6B" strokeWidth="2" />
            <text x="80" y={y + 7} textAnchor="middle" fontSize="22" fontWeight="bold" fontFamily="sans-serif" fill="#333">
              {item.upper}
            </text>
            {/* Right: lowercase in a circle */}
            <circle cx="320" cy={y} r="22" fill="none" stroke="#4ECDC4" strokeWidth="2" />
            <text x="320" y={y + 7} textAnchor="middle" fontSize="22" fontWeight="bold" fontFamily="sans-serif" fill="#333">
              {rightColumn[i].lower}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function NumberMatchingWorksheet() {
  const subset = numbersData.slice(0, 8);
  const [rightColumn] = useState(() => [...subset].sort(() => Math.random() - 0.5));

  return (
    <svg viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <text x="200" y="35" textAnchor="middle" fontSize="24" fontWeight="bold" fontFamily="sans-serif" fill="#333">
        Number Matching
      </text>
      <text x="200" y="58" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#888">
        Draw a line from each number to the matching quantity
      </text>

      <text x="80" y="90" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#4ECDC4" fontFamily="sans-serif">
        Number
      </text>
      <text x="320" y="90" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#A78BFA" fontFamily="sans-serif">
        How many?
      </text>

      {subset.map((item, i) => {
        const y = 120 + i * 54;
        const matchItem = rightColumn[i];
        return (
          <g key={item.number}>
            <circle cx="80" cy={y} r="22" fill="none" stroke="#4ECDC4" strokeWidth="2" />
            <text x="80" y={y + 8} textAnchor="middle" fontSize="24" fontWeight="bold" fontFamily="sans-serif" fill="#333">
              {item.number}
            </text>
            <foreignObject x="270" y={y - 18} width="100" height="36">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{ fontSize: '18px', textAlign: 'center', lineHeight: 1.3 }}
              >
                {matchItem.emoji.repeat(matchItem.number)}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}

function ShapeIdentificationWorksheet() {
  return (
    <svg viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <text x="200" y="35" textAnchor="middle" fontSize="24" fontWeight="bold" fontFamily="sans-serif" fill="#333">
        Shape Identification
      </text>
      <text x="200" y="58" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#888">
        Write the name of each shape on the line
      </text>

      {shapesData.slice(0, 6).map((shape, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = col === 0 ? 110 : 290;
        const cy = 130 + row * 160;
        return (
          <g key={shape.name}>
            <g transform={`translate(${cx - 45}, ${cy - 45}) scale(0.9)`}>
              <path d={shape.svgPath} fill="none" stroke="#333" strokeWidth="2" strokeLinejoin="round" />
            </g>
            <line x1={cx - 40} y1={cy + 50} x2={cx + 40} y2={cy + 50} stroke="#bbb" strokeWidth="1.5" />
            <text x={cx} y={cy + 68} textAnchor="middle" fontSize="10" fill="#ccc" fontFamily="sans-serif">
              (name)
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ColorByNumberWorksheet() {
  const gridColors = colorsData.slice(0, 6);
  const gridSize = 6;
  const cellSize = 45;
  const offsetX = (400 - gridSize * cellSize) / 2;
  const offsetY = 120;

  // Generate a stable pseudo-random grid
  const grid: number[][] = [];
  for (let r = 0; r < gridSize; r++) {
    const row: number[] = [];
    for (let c = 0; c < gridSize; c++) {
      row.push((r * 3 + c * 7 + r * c) % gridColors.length);
    }
    grid.push(row);
  }

  return (
    <svg viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <text x="200" y="35" textAnchor="middle" fontSize="24" fontWeight="bold" fontFamily="sans-serif" fill="#333">
        Color by Number
      </text>
      <text x="200" y="58" textAnchor="middle" fontSize="13" fontFamily="sans-serif" fill="#888">
        Use the key below to color each square
      </text>

      {/* Color key */}
      {gridColors.map((c, i) => {
        const kx = 30 + i * 60;
        return (
          <g key={c.name}>
            <rect x={kx} y="70" width="18" height="18" fill={c.hex} stroke="#333" strokeWidth="1" rx="3" />
            <text x={kx + 24} y="84" fontSize="12" fontFamily="sans-serif" fill="#333">
              = {i + 1}
            </text>
          </g>
        );
      })}

      {/* Grid */}
      {grid.map((row, r) =>
        row.map((val, c) => {
          const x = offsetX + c * cellSize;
          const y = offsetY + r * cellSize;
          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={cellSize} height={cellSize} fill="none" stroke="#999" strokeWidth="1" />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 + 5}
                textAnchor="middle"
                fontSize="16"
                fontFamily="sans-serif"
                fill="#555"
              >
                {val + 1}
              </text>
            </g>
          );
        }),
      )}

      {/* Color name key at bottom */}
      <text x="200" y="420" textAnchor="middle" fontSize="12" fill="#888" fontFamily="sans-serif">
        Key:
      </text>
      {gridColors.map((c, i) => (
        <text key={c.name} x="200" y={440 + i * 18} textAnchor="middle" fontSize="13" fill="#555" fontFamily="sans-serif">
          {i + 1} = {c.name}
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Render the correct SVG for a given printable id                    */
/* ------------------------------------------------------------------ */

function renderPrintable(id: string): JSX.Element {
  if (id.startsWith('alpha-')) {
    const letter = id.replace('alpha-', '');
    return <AlphabetTracingSVG letter={letter} />;
  }
  if (id.startsWith('num-')) {
    const num = parseInt(id.replace('num-', ''), 10);
    return <NumberTracingSVG num={num} />;
  }
  if (id.startsWith('color-')) {
    const shapeName = id.replace('color-', '');
    return <ColoringPageSVG shapeName={shapeName} />;
  }
  switch (id) {
    case 'ws-letter-match':
      return <LetterMatchingWorksheet />;
    case 'ws-number-match':
      return <NumberMatchingWorksheet />;
    case 'ws-shape-id':
      return <ShapeIdentificationWorksheet />;
    case 'ws-color-by-number':
      return <ColorByNumberWorksheet />;
    default:
      return <p>Unknown printable</p>;
  }
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PrintablesPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('alphabet');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  if (!currentPlayer) return <Navigate to="/" replace />;

  const filtered = catalogue.filter((c) => c.category === activeTab);
  const activeTabConfig = tabs.find((t) => t.key === activeTab);
  const difficulty = categoryDifficulty[activeTab];

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-area, #printable-area * {
            visibility: visible !important;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            margin: 0;
            padding: 10mm;
          }
          #printable-area svg {
            width: 100% !important;
            max-width: 180mm;
            height: auto !important;
            display: block;
            margin: 0 auto;
          }
          @page {
            margin: 10mm;
            size: auto;
          }
        }
      `}</style>

      <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-8 print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <NavButton onClick={() => navigate('/menu')} direction="back" />
          <div className="w-14" />
        </div>

        {/* Premium Hero Banner */}
        <motion.div
          className="relative rounded-[20px] overflow-hidden mb-6 px-5 py-6"
          style={{ background: 'linear-gradient(135deg, #F3EFFE 0%, #FFFFFF 60%, #EDF5FF 100%)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Floating decorative emoji */}
          <motion.span
            className="absolute top-3 right-4 text-2xl opacity-40 pointer-events-none"
            animate={{ y: [0, -6, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🖨️
          </motion.span>
          <motion.span
            className="absolute bottom-3 right-12 text-xl opacity-30 pointer-events-none"
            animate={{ y: [0, -4, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
          >
            ✂️
          </motion.span>
          <motion.span
            className="absolute top-5 right-20 text-lg opacity-25 pointer-events-none"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
          >
            🖍️
          </motion.span>

          <h2
            className="text-2xl font-extrabold tracking-tight mb-1"
            style={{
              background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Printable Activities
          </h2>
          <p className="text-sm text-[#6B6B7B] font-medium">Print, color, and create!</p>
        </motion.div>

        {/* Section Header */}
        <p className="text-[11px] font-bold text-[#9B9BAB] uppercase tracking-[0.08em] mb-2 px-1">
          🖨️ Category
        </p>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              className={`flex items-center gap-1.5 whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all ${
                activeTab === tab.key
                  ? 'text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
                  : 'bg-white text-[#6B6B7B] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0]'
              }`}
              style={activeTab === tab.key ? { backgroundColor: tab.color } : { backgroundColor: tab.softBg, color: tab.color, borderColor: 'transparent' }}
              onClick={() => setActiveTab(tab.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Section Header */}
        <p className="text-[11px] font-bold text-[#9B9BAB] uppercase tracking-[0.08em] mb-3 px-1">
          📄 {activeTabConfig?.label ?? 'Items'} ({filtered.length}) {difficulty.dot} {difficulty.label}
        </p>

        {/* Activity Cards Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 flex flex-col items-center text-center relative overflow-hidden"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                layout
              >
                {/* Dog-ear corner effect */}
                <div
                  className="absolute top-0 right-0 w-8 h-8"
                  style={{
                    background: `linear-gradient(225deg, #FFF8F0 50%, ${activeTabConfig?.color ?? '#F0EAE0'}25 50%)`,
                  }}
                />
                {/* Subtle paper texture lines */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 23px, #A78BFA 24px)' }} />

                <span className="text-4xl mb-2 relative z-[1]">{item.previewEmoji}</span>
                <h3 className="font-bold text-sm text-[#2D2D3A] mb-1 leading-tight relative z-[1]">{item.title}</h3>
                <p className="text-[11px] text-[#9B9BAB] mb-3 leading-snug relative z-[1]">{item.description}</p>

                {/* Difficulty badge */}
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F3EFFE] px-2.5 py-0.5 text-[10px] font-bold text-[#A78BFA] mb-3 relative z-[1]">
                  {difficulty.dot} {difficulty.label}
                </span>

                <div className="flex gap-2 mt-auto relative z-[1]">
                  <motion.button
                    className="px-3.5 py-1.5 rounded-full bg-[#F3EFFE] text-[#A78BFA] text-xs font-bold cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPreviewId(item.id)}
                  >
                    Preview
                  </motion.button>
                  <motion.button
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#C4B5FD] text-white text-xs font-bold cursor-pointer shadow-[0_2px_8px_rgba(167,139,250,0.3)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setPreviewId(item.id);
                      // Slight delay so printable-area mounts before print
                      setTimeout(() => window.print(), 300);
                    }}
                  >
                    Print
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewId(null)}
          >
            <motion.div
              className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(45,45,58,0.12)] border border-[#F0EAE0] m-4 mt-8 mb-8 w-full max-w-lg p-5 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Paper-texture header accent */}
              <div className="absolute inset-x-0 top-0 h-2 rounded-t-[20px]" style={{ background: 'linear-gradient(90deg, #A78BFA, #C4B5FD)' }} />

              {/* Close button */}
              <button
                className="absolute top-4 right-3 w-9 h-9 rounded-full bg-[#FFF8F0] border border-[#F0EAE0] flex items-center justify-center text-[#9B9BAB] hover:bg-[#F0EAE0] cursor-pointer text-lg font-bold transition-colors"
                onClick={() => setPreviewId(null)}
              >
                x
              </button>

              {/* Preview content */}
              <div className="mt-4 bg-white rounded-2xl border border-[#F0EAE0] p-3" style={{ boxShadow: 'inset 0 1px 4px rgba(167,139,250,0.06)' }}>
                {renderPrintable(previewId)}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-center mt-5">
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-gradient-to-r from-[#A78BFA] to-[#C4B5FD] text-white font-bold cursor-pointer shadow-[0_4px_20px_rgba(167,139,250,0.25)]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                >
                  <span>🖨️</span>
                  <span>Print</span>
                </motion.button>
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-[#FFF8F0] border border-[#F0EAE0] text-[#6B6B7B] font-bold cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPreviewId(null)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden printable area -- only visible during print */}
      {previewId && (
        <div id="printable-area" ref={printRef} className="hidden print:block">
          {renderPrintable(previewId)}
        </div>
      )}
    </>
  );
}
