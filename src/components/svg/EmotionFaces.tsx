import React from 'react';

interface EmotionFaceProps {
  emotion: string;
  size?: number;
  className?: string;
}

/* Happy — bright yellow, big smile, sparkle eyes, rosy cheeks */
function HappyFace() {
  return (
    <>
      <circle cx="50" cy="50" r="45" fill="#FFE66D" stroke="#F5C518" strokeWidth="2.5" />
      {/* Eyes with star highlights */}
      <ellipse cx="35" cy="40" rx="6" ry="7" fill="white" />
      <ellipse cx="65" cy="40" rx="6" ry="7" fill="white" />
      <circle cx="36" cy="41" r="4" fill="#2D2D3A" />
      <circle cx="66" cy="41" r="4" fill="#2D2D3A" />
      <circle cx="37.5" cy="39" r="1.5" fill="white" />
      <circle cx="67.5" cy="39" r="1.5" fill="white" />
      {/* Star sparkle in eyes */}
      <path d="M33 36L34 38L36 37L34.5 39L36 40L34 39.5L33 41L33.5 39L32 38.5L33.5 38Z" fill="white" opacity="0.7" />
      <path d="M63 36L64 38L66 37L64.5 39L66 40L64 39.5L63 41L63.5 39L62 38.5L63.5 38Z" fill="white" opacity="0.7" />
      {/* Rosy cheeks */}
      <circle cx="25" cy="55" r="7" fill="#FFB6C1" fillOpacity="0.5" />
      <circle cx="75" cy="55" r="7" fill="#FFB6C1" fillOpacity="0.5" />
      {/* Big smile showing teeth */}
      <path d="M30 58C35 70 65 70 70 58" stroke="#D4A017" strokeWidth="2.5" fill="white" strokeLinecap="round" />
      <line x1="40" y1="63" x2="40" y2="58" stroke="#F0E0A0" strokeWidth="0.8" />
      <line x1="50" y1="64" x2="50" y2="58" stroke="#F0E0A0" strokeWidth="0.8" />
      <line x1="60" y1="63" x2="60" y2="58" stroke="#F0E0A0" strokeWidth="0.8" />
      {/* Eyebrows */}
      <path d="M28 32C32 28 38 28 42 30" stroke="#D4A017" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M58 30C62 28 68 28 72 32" stroke="#D4A017" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  );
}

/* Sad — pale blue, droopy eyes, teardrop, frown */
function SadFace() {
  return (
    <>
      <circle cx="50" cy="50" r="45" fill="#B5D4E8" stroke="#8BB8D4" strokeWidth="2.5" />
      {/* Droopy eyes */}
      <ellipse cx="35" cy="42" rx="6" ry="5" fill="white" transform="rotate(8 35 42)" />
      <ellipse cx="65" cy="42" rx="6" ry="5" fill="white" transform="rotate(-8 65 42)" />
      <circle cx="36" cy="43" r="3.5" fill="#2D2D3A" />
      <circle cx="66" cy="43" r="3.5" fill="#2D2D3A" />
      <circle cx="37" cy="42" r="1" fill="white" />
      <circle cx="67" cy="42" r="1" fill="white" />
      {/* Furrowed brows */}
      <path d="M27 34C31 30 39 32 43 34" stroke="#6A9BBD" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M57 34C61 32 69 30 73 34" stroke="#6A9BBD" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Frown */}
      <path d="M35 68C40 62 60 62 65 68" stroke="#6A9BBD" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Teardrop */}
      <path d="M28 48C28 48 24 56 28 58C32 56 28 48 28 48Z" fill="#45B7D1" opacity="0.7" />
    </>
  );
}

/* Angry — red-tinged, V-brows, gritted teeth, steam */
function AngryFace() {
  return (
    <>
      <circle cx="50" cy="50" r="45" fill="#FF8A80" stroke="#E57373" strokeWidth="2.5" />
      {/* Angry eyes */}
      <ellipse cx="35" cy="42" rx="5" ry="5" fill="white" />
      <ellipse cx="65" cy="42" rx="5" ry="5" fill="white" />
      <circle cx="36" cy="43" r="3.5" fill="#2D2D3A" />
      <circle cx="66" cy="43" r="3.5" fill="#2D2D3A" />
      {/* V-shaped eyebrows */}
      <path d="M25 30L40 36" stroke="#C62828" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M75 30L60 36" stroke="#C62828" strokeWidth="3.5" strokeLinecap="round" />
      {/* Red cheeks */}
      <circle cx="25" cy="55" r="6" fill="#E53935" fillOpacity="0.4" />
      <circle cx="75" cy="55" r="6" fill="#E53935" fillOpacity="0.4" />
      {/* Gritted teeth */}
      <path d="M32 62H68" stroke="#C62828" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M38 58V66M44 58V66M50 58V66M56 58V66M62 58V66" stroke="#C62828" strokeWidth="1.5" />
      {/* Steam puffs */}
      <circle cx="20" cy="15" r="5" fill="white" fillOpacity="0.6" className="animate-float-gentle" />
      <circle cx="25" cy="10" r="4" fill="white" fillOpacity="0.5" className="animate-float-gentle" style={{ animationDelay: '0.3s' }} />
      <circle cx="75" cy="12" r="5" fill="white" fillOpacity="0.6" className="animate-float-gentle" style={{ animationDelay: '0.5s' }} />
      <circle cx="80" cy="8" r="3.5" fill="white" fillOpacity="0.5" className="animate-float-gentle" style={{ animationDelay: '0.8s' }} />
    </>
  );
}

/* Scared — pale white, huge eyes, O-mouth, hands on cheeks */
function ScaredFace() {
  return (
    <>
      <circle cx="50" cy="50" r="45" fill="#F0F0F0" stroke="#D0D0D0" strokeWidth="2.5" />
      {/* Spiky hair */}
      <path d="M30 15L35 8L40 18L45 5L50 16L55 4L60 17L65 7L70 15" stroke="#D0D0D0" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Huge wide eyes */}
      <circle cx="35" cy="42" r="10" fill="white" stroke="#A0A0A0" strokeWidth="1.5" />
      <circle cx="65" cy="42" r="10" fill="white" stroke="#A0A0A0" strokeWidth="1.5" />
      <circle cx="35" cy="43" r="3" fill="#2D2D3A" />
      <circle cx="65" cy="43" r="3" fill="#2D2D3A" />
      <circle cx="36" cy="42" r="1" fill="white" />
      <circle cx="66" cy="42" r="1" fill="white" />
      {/* O-shaped mouth */}
      <ellipse cx="50" cy="68" rx="8" ry="10" fill="#E0E0E0" stroke="#B0B0B0" strokeWidth="2" />
      {/* Hands on cheeks */}
      <circle cx="15" cy="52" r="8" fill="#FFD5B8" stroke="#E8A87C" strokeWidth="1.5" />
      <circle cx="85" cy="52" r="8" fill="#FFD5B8" stroke="#E8A87C" strokeWidth="1.5" />
    </>
  );
}

/* Excited — orange, huge grin, star eyes, energy lines */
function ExcitedFace() {
  return (
    <>
      <circle cx="50" cy="50" r="45" fill="#FFB74D" stroke="#FF9800" strokeWidth="2.5" />
      {/* Star eyes */}
      <path d="M35 40L37 44L41 44L38 47L39 51L35 48L31 51L32 47L29 44L33 44Z" fill="#2D2D3A" />
      <path d="M65 40L67 44L71 44L68 47L69 51L65 48L61 51L62 47L59 44L63 44Z" fill="#2D2D3A" />
      {/* Huge open-mouth grin */}
      <path d="M28 58C28 58 35 75 50 75C65 75 72 58 72 58" fill="white" stroke="#E65100" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M35 58C35 58 42 62 50 62C58 62 65 58 65 58" stroke="#FFCC80" strokeWidth="1" fill="none" />
      {/* Arms raised */}
      <line x1="10" y1="35" x2="18" y2="25" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" />
      <line x1="90" y1="35" x2="82" y2="25" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" />
      {/* Energy lines */}
      <line x1="5" y1="50" x2="0" y2="50" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="35" x2="3" y2="30" stroke="#FFE66D" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="65" x2="3" y2="70" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
      <line x1="95" y1="50" x2="100" y2="50" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />
      <line x1="92" y1="35" x2="97" y2="30" stroke="#FFE66D" strokeWidth="2" strokeLinecap="round" />
      <line x1="92" y1="65" x2="97" y2="70" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

/* Calm — soft green, half-lidded eyes, gentle smile */
function CalmFace() {
  return (
    <>
      <circle cx="50" cy="50" r="45" fill="#A8E6CF" stroke="#7DCEA0" strokeWidth="2.5" />
      {/* Half-lidded peaceful eyes */}
      <path d="M28 42C32 38 38 38 42 42" stroke="#2D2D3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M58 42C62 38 68 38 72 42" stroke="#2D2D3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Gentle smile */}
      <path d="M36 60C42 66 58 66 64 60" stroke="#4A8C6A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Soft cheeks */}
      <circle cx="26" cy="54" r="6" fill="#7DCEA0" fillOpacity="0.4" />
      <circle cx="74" cy="54" r="6" fill="#7DCEA0" fillOpacity="0.4" />
      {/* Content eyebrows */}
      <path d="M29 36C33 34 37 34 41 36" stroke="#4A8C6A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M59 36C63 34 67 34 71 36" stroke="#4A8C6A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </>
  );
}

/* Proud — golden, confident smile, hands on hips, star halo */
function ProudFace() {
  return (
    <>
      {/* Wider body shape */}
      <ellipse cx="50" cy="55" rx="45" ry="42" fill="#FFD93D" stroke="#F5C518" strokeWidth="2.5" />
      {/* Eyes */}
      <ellipse cx="37" cy="42" rx="5" ry="5.5" fill="white" />
      <ellipse cx="63" cy="42" rx="5" ry="5.5" fill="white" />
      <circle cx="38" cy="43" r="3.5" fill="#2D2D3A" />
      <circle cx="64" cy="43" r="3.5" fill="#2D2D3A" />
      <circle cx="39" cy="41.5" r="1.2" fill="white" />
      <circle cx="65" cy="41.5" r="1.2" fill="white" />
      {/* Confident smirk */}
      <path d="M38 60C44 66 56 66 68 62" stroke="#D4A017" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Confident eyebrows */}
      <path d="M29 34L42 32" stroke="#D4A017" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M58 32L71 34" stroke="#D4A017" strokeWidth="2.5" strokeLinecap="round" />
      {/* Hands on hips */}
      <path d="M5 65L15 55" stroke="#F5C518" strokeWidth="3" strokeLinecap="round" />
      <path d="M95 65L85 55" stroke="#F5C518" strokeWidth="3" strokeLinecap="round" />
      {/* Star halo */}
      <path d="M50 5L52 10L57 10L53 13L55 18L50 15L45 18L47 13L43 10L48 10Z" fill="#FFE66D" stroke="#F5C518" strokeWidth="1" />
    </>
  );
}

/* Shy — pink, hand covering face, blushing, eyes to side */
function ShyFace() {
  return (
    <>
      <circle cx="50" cy="50" r="45" fill="#FFB6C1" stroke="#F48FB1" strokeWidth="2.5" />
      {/* Eyes looking to the side */}
      <ellipse cx="35" cy="42" rx="5" ry="5.5" fill="white" />
      <ellipse cx="65" cy="42" rx="5" ry="5.5" fill="white" />
      <circle cx="38" cy="43" r="3" fill="#2D2D3A" />
      <circle cx="68" cy="43" r="3" fill="#2D2D3A" />
      {/* Blush */}
      <circle cx="27" cy="55" r="7" fill="#FF80AB" fillOpacity="0.5" />
      <circle cx="73" cy="55" r="7" fill="#FF80AB" fillOpacity="0.5" />
      {/* Nervous smile */}
      <path d="M40 62C44 65 52 65 56 62" stroke="#D4768E" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Hand covering right side of face */}
      <ellipse cx="72" cy="50" rx="16" ry="20" fill="#FFD5B8" stroke="#E8A87C" strokeWidth="1.5" />
      {/* Shy eyebrows */}
      <path d="M28 34C32 32 38 33 42 35" stroke="#D4768E" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  );
}

/* Grateful — warm cream, closed-eye smile, clasped hands, heart */
function GratefulFace() {
  return (
    <>
      <circle cx="50" cy="50" r="45" fill="#FFECD2" stroke="#FFD5A0" strokeWidth="2.5" />
      {/* Closed happy eyes */}
      <path d="M28 42C32 38 38 38 42 42" stroke="#2D2D3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M58 42C62 38 68 38 72 42" stroke="#2D2D3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Warm smile */}
      <path d="M34 58C40 66 60 66 66 58" stroke="#C49A6C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Rosy cheeks */}
      <circle cx="26" cy="52" r="6" fill="#FFB6C1" fillOpacity="0.4" />
      <circle cx="74" cy="52" r="6" fill="#FFB6C1" fillOpacity="0.4" />
      {/* Clasped hands */}
      <ellipse cx="46" cy="80" rx="6" ry="5" fill="#FFD5B8" stroke="#E8A87C" strokeWidth="1.5" />
      <ellipse cx="54" cy="80" rx="6" ry="5" fill="#FFD5B8" stroke="#E8A87C" strokeWidth="1.5" />
      {/* Floating heart */}
      <path d="M50 10S44 4 44 8C44 12 50 16 50 16S56 12 56 8C56 4 50 10Z" fill="#FF6B6B" className="animate-float-gentle" />
    </>
  );
}

/* Confused — light purple, mismatched eyes, wavy mouth, question mark */
function ConfusedFace() {
  return (
    <>
      <circle cx="50" cy="50" r="45" fill="#D1C4E9" stroke="#B39DDB" strokeWidth="2.5" />
      {/* Mismatched eyes */}
      <circle cx="35" cy="42" r="7" fill="white" />
      <circle cx="65" cy="42" r="5" fill="white" />
      <circle cx="36" cy="43" r="4" fill="#2D2D3A" />
      <circle cx="66" cy="43" r="3" fill="#2D2D3A" />
      <circle cx="37" cy="41" r="1.2" fill="white" />
      <circle cx="67" cy="41" r="0.8" fill="white" />
      {/* One eyebrow raised */}
      <path d="M27 30L42 34" stroke="#7E57C2" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M58 36L73 36" stroke="#7E57C2" strokeWidth="2.5" strokeLinecap="round" />
      {/* Wavy mouth */}
      <path d="M34 62C38 58 42 66 50 62C58 58 62 66 66 62" stroke="#7E57C2" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Question mark */}
      <text x="70" y="18" fontSize="22" fontWeight="bold" fill="#7E57C2" className="animate-float-gentle">?</text>
      {/* Swirl */}
      <path d="M78 22C82 18 86 22 82 26" stroke="#B39DDB" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

const emotionMap: Record<string, React.FC> = {
  happy: HappyFace,
  sad: SadFace,
  angry: AngryFace,
  scared: ScaredFace,
  excited: ExcitedFace,
  calm: CalmFace,
  proud: ProudFace,
  shy: ShyFace,
  grateful: GratefulFace,
  confused: ConfusedFace,
};

const EmotionFace: React.FC<EmotionFaceProps> = React.memo(({ emotion, size = 100, className }) => {
  const Face = emotionMap[emotion.toLowerCase()] || HappyFace;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      <Face />
    </svg>
  );
});

EmotionFace.displayName = 'EmotionFace';
export default EmotionFace;
