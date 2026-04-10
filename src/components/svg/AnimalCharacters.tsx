import React from 'react';

interface AnimalCharacterProps {
  animal: string;
  size?: number;
  className?: string;
}

function DogCharacter() {
  return (
    <>
      {/* Tail */}
      <g className="animate-tail-wag" style={{ transformOrigin: '145px 120px' }}>
        <path d="M145 120C155 110 165 105 170 110C175 115 168 122 160 125" fill="#D2691E" stroke="#A0522D" strokeWidth="2" />
      </g>
      {/* Body */}
      <ellipse cx="100" cy="130" rx="50" ry="40" fill="#D2691E" stroke="#A0522D" strokeWidth="2.5" />
      <ellipse cx="100" cy="135" rx="30" ry="22" fill="#DEB887" />
      {/* Legs */}
      <ellipse cx="70" cy="165" rx="10" ry="14" fill="#D2691E" stroke="#A0522D" strokeWidth="2" />
      <ellipse cx="130" cy="165" rx="10" ry="14" fill="#D2691E" stroke="#A0522D" strokeWidth="2" />
      {/* Head */}
      <circle cx="100" cy="80" r="35" fill="#D2691E" stroke="#A0522D" strokeWidth="2.5" />
      {/* Floppy ears */}
      <ellipse cx="68" cy="65" rx="14" ry="25" fill="#A0522D" stroke="#8B4513" strokeWidth="2" transform="rotate(-15 68 65)" />
      <ellipse cx="132" cy="65" rx="14" ry="25" fill="#A0522D" stroke="#8B4513" strokeWidth="2" transform="rotate(15 132 65)" />
      {/* Face */}
      <ellipse cx="100" cy="90" rx="20" ry="15" fill="#DEB887" />
      {/* Eyes */}
      <ellipse cx="88" cy="75" rx="6" ry="7" fill="white" />
      <ellipse cx="112" cy="75" rx="6" ry="7" fill="white" />
      <circle cx="90" cy="76" r="4" fill="#2D2D3A" />
      <circle cx="114" cy="76" r="4" fill="#2D2D3A" />
      <circle cx="91" cy="74" r="1.5" fill="white" />
      <circle cx="115" cy="74" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="100" cy="88" rx="6" ry="4" fill="#2D2D3A" />
      {/* Tongue */}
      <ellipse cx="100" cy="100" rx="5" ry="8" fill="#FF8FAB" stroke="#E57373" strokeWidth="1" />
      {/* Cheeks */}
      <circle cx="78" cy="88" r="5" fill="#FFB6C1" fillOpacity="0.4" />
      <circle cx="122" cy="88" r="5" fill="#FFB6C1" fillOpacity="0.4" />
    </>
  );
}

function CatCharacter() {
  return (
    <>
      {/* Tail */}
      <path d="M145 130C160 120 170 100 165 85C162 78 155 82 158 90C161 100 155 118 145 125" fill="#F4A460" stroke="#D2691E" strokeWidth="2" />
      {/* Body */}
      <ellipse cx="100" cy="135" rx="45" ry="38" fill="#F4A460" stroke="#D2691E" strokeWidth="2.5" />
      <ellipse cx="100" cy="140" rx="28" ry="20" fill="#FFE4C4" />
      {/* Legs */}
      <ellipse cx="72" cy="168" rx="10" ry="12" fill="#F4A460" stroke="#D2691E" strokeWidth="2" />
      <ellipse cx="128" cy="168" rx="10" ry="12" fill="#F4A460" stroke="#D2691E" strokeWidth="2" />
      {/* Head */}
      <circle cx="100" cy="80" r="34" fill="#F4A460" stroke="#D2691E" strokeWidth="2.5" />
      {/* Pointed ears */}
      <path d="M72 55L65 25L88 50Z" fill="#F4A460" stroke="#D2691E" strokeWidth="2" />
      <path d="M82 45L72 30L85 48Z" fill="#FFB6C1" />
      <path d="M128 55L135 25L112 50Z" fill="#F4A460" stroke="#D2691E" strokeWidth="2" />
      <path d="M118 45L128 30L115 48Z" fill="#FFB6C1" />
      {/* Eyes — green */}
      <ellipse cx="86" cy="75" rx="7" ry="8" fill="white" />
      <ellipse cx="114" cy="75" rx="7" ry="8" fill="white" />
      <ellipse cx="87" cy="76" rx="4" ry="5" fill="#4CAF50" />
      <ellipse cx="115" cy="76" r="4" fill="#4CAF50" />
      <circle cx="86" cy="74" r="2" fill="#2D2D3A" />
      <circle cx="114" cy="74" r="2" fill="#2D2D3A" />
      {/* Nose */}
      <path d="M97 87L100 83L103 87Z" fill="#FF8FAB" />
      {/* Mouth */}
      <path d="M95 90C98 93 102 93 105 90" stroke="#D2691E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="70" y1="82" x2="55" y2="78" stroke="#D2691E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="87" x2="53" y2="88" stroke="#D2691E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="92" x2="55" y2="97" stroke="#D2691E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="130" y1="82" x2="145" y2="78" stroke="#D2691E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="130" y1="87" x2="147" y2="88" stroke="#D2691E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="130" y1="92" x2="145" y2="97" stroke="#D2691E" strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

function FishCharacter() {
  return (
    <>
      {/* Bubbles */}
      <circle cx="140" cy="40" r="5" fill="none" stroke="#45B7D1" strokeWidth="1.5" className="animate-float" opacity="0.6" />
      <circle cx="150" cy="55" r="3.5" fill="none" stroke="#45B7D1" strokeWidth="1" className="animate-float-gentle" opacity="0.5" />
      <circle cx="135" cy="25" r="4" fill="none" stroke="#45B7D1" strokeWidth="1" className="animate-float" style={{ animationDelay: '1s' }} opacity="0.4" />
      {/* Tail fin */}
      <path d="M145 100L175 80L175 120Z" fill="#FFE66D" stroke="#F59E0B" strokeWidth="2" />
      {/* Body */}
      <ellipse cx="100" cy="100" rx="55" ry="35" fill="#45B7D1" stroke="#2196F3" strokeWidth="2.5" />
      {/* Scales pattern */}
      <path d="M70 90C75 85 80 90 85 85" stroke="#2196F3" strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M85 100C90 95 95 100 100 95" stroke="#2196F3" strokeWidth="1" fill="none" opacity="0.3" />
      <path d="M75 110C80 105 85 110 90 105" stroke="#2196F3" strokeWidth="1" fill="none" opacity="0.3" />
      {/* Top fin */}
      <path d="M90 65L100 45L115 65" fill="#FFE66D" stroke="#F59E0B" strokeWidth="2" />
      {/* Side fin */}
      <path d="M80 110L65 130L90 120" fill="#FFE66D" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Belly */}
      <ellipse cx="95" cy="108" rx="30" ry="15" fill="#B3E5FC" opacity="0.5" />
      {/* Eye */}
      <circle cx="70" cy="92" r="10" fill="white" stroke="#2196F3" strokeWidth="1.5" />
      <circle cx="72" cy="93" r="5" fill="#2D2D3A" />
      <circle cx="73" cy="91" r="2" fill="white" />
      {/* Mouth */}
      <path d="M52 100C55 103 58 103 60 100" stroke="#2196F3" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

function BirdCharacter() {
  return (
    <>
      {/* Tail feathers */}
      <path d="M135 120L160 130L155 115L165 120L150 110" fill="#FF6B6B" stroke="#EF4444" strokeWidth="1.5" />
      {/* Body */}
      <ellipse cx="100" cy="110" rx="40" ry="32" fill="#FF6B6B" stroke="#EF4444" strokeWidth="2.5" />
      <ellipse cx="100" cy="118" rx="25" ry="18" fill="#FFE0E0" />
      {/* Wings */}
      <path d="M60 100C45 90 40 105 55 110" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
      <path d="M140 100C155 90 160 105 145 110" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
      {/* Head */}
      <circle cx="100" cy="70" r="28" fill="#FF6B6B" stroke="#EF4444" strokeWidth="2.5" />
      {/* Crest */}
      <path d="M95 42L100 30L108 44" fill="#EF4444" stroke="#DC2626" strokeWidth="1.5" />
      {/* Eye */}
      <circle cx="90" cy="65" r="7" fill="white" />
      <circle cx="92" cy="66" r="4" fill="#2D2D3A" />
      <circle cx="93" cy="64" r="1.5" fill="white" />
      {/* Beak */}
      <path d="M75 72L60 75L75 80Z" fill="#FFE66D" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Legs */}
      <line x1="88" y1="142" x2="85" y2="165" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="112" y1="142" x2="115" y2="165" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M78 165L85 165L90 165" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M108 165L115 165L120 165" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      {/* Cheek */}
      <circle cx="80" cy="75" r="4" fill="#FFB6C1" fillOpacity="0.5" />
    </>
  );
}

function ElephantCharacter() {
  return (
    <>
      {/* Tail */}
      <path d="M155 120C165 115 170 110 168 105" stroke="#9E9E9E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="168" cy="103" r="3" fill="#757575" />
      {/* Body */}
      <ellipse cx="105" cy="125" rx="55" ry="45" fill="#9E9E9E" stroke="#757575" strokeWidth="2.5" />
      <ellipse cx="105" cy="130" rx="35" ry="25" fill="#BDBDBD" opacity="0.5" />
      {/* Legs */}
      <rect x="65" y="155" width="18" height="28" rx="9" fill="#9E9E9E" stroke="#757575" strokeWidth="2" />
      <rect x="120" y="155" width="18" height="28" rx="9" fill="#9E9E9E" stroke="#757575" strokeWidth="2" />
      {/* Head */}
      <circle cx="100" cy="75" r="35" fill="#9E9E9E" stroke="#757575" strokeWidth="2.5" />
      {/* Ears */}
      <ellipse cx="58" cy="70" rx="22" ry="28" fill="#BDBDBD" stroke="#757575" strokeWidth="2" />
      <ellipse cx="58" cy="70" rx="14" ry="18" fill="#FFB6C1" opacity="0.5" />
      <ellipse cx="142" cy="70" rx="22" ry="28" fill="#BDBDBD" stroke="#757575" strokeWidth="2" />
      <ellipse cx="142" cy="70" rx="14" ry="18" fill="#FFB6C1" opacity="0.5" />
      {/* Trunk */}
      <path d="M100 95C100 110 95 125 85 135C80 140 78 138 82 132C88 122 92 115 90 100" fill="#9E9E9E" stroke="#757575" strokeWidth="2.5" />
      {/* Eyes */}
      <circle cx="85" cy="68" r="6" fill="white" />
      <circle cx="115" cy="68" r="6" fill="white" />
      <circle cx="87" cy="69" r="3.5" fill="#2D2D3A" />
      <circle cx="117" cy="69" r="3.5" fill="#2D2D3A" />
      <circle cx="88" cy="67" r="1.2" fill="white" />
      <circle cx="118" cy="67" r="1.2" fill="white" />
      {/* Tusks */}
      <path d="M88 88C85 95 82 92 84 88" fill="white" stroke="#E0E0E0" strokeWidth="1" />
      <path d="M112 88C115 95 118 92 116 88" fill="white" stroke="#E0E0E0" strokeWidth="1" />
      {/* Wrinkle lines */}
      <path d="M92 98C96 96 104 96 108 98" stroke="#757575" strokeWidth="1" fill="none" opacity="0.4" />
    </>
  );
}

function LionCharacter() {
  return (
    <>
      {/* Tail */}
      <g className="animate-tail-wag" style={{ transformOrigin: '150px 130px' }}>
        <path d="M150 130C160 120 170 115 172 118C174 122 165 128 155 132" fill="#D2691E" stroke="#A0522D" strokeWidth="2" />
        <ellipse cx="173" cy="117" rx="5" ry="4" fill="#8B4513" />
      </g>
      {/* Body */}
      <ellipse cx="100" cy="135" rx="48" ry="38" fill="#F4A460" stroke="#D2691E" strokeWidth="2.5" />
      <ellipse cx="100" cy="140" rx="28" ry="20" fill="#FFE4C4" />
      {/* Legs */}
      <ellipse cx="70" cy="168" rx="12" ry="14" fill="#F4A460" stroke="#D2691E" strokeWidth="2" />
      <ellipse cx="130" cy="168" rx="12" ry="14" fill="#F4A460" stroke="#D2691E" strokeWidth="2" />
      {/* Mane */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
        <circle
          key={i}
          cx={100 + 38 * Math.cos((deg * Math.PI) / 180)}
          cy={75 + 38 * Math.sin((deg * Math.PI) / 180)}
          r="14"
          fill="#D2691E"
          stroke="#A0522D"
          strokeWidth="1.5"
        />
      ))}
      {/* Head */}
      <circle cx="100" cy="75" r="32" fill="#F4A460" stroke="#D2691E" strokeWidth="2.5" />
      {/* Ears */}
      <circle cx="72" cy="50" r="8" fill="#D2691E" />
      <circle cx="72" cy="50" r="5" fill="#FFB6C1" />
      <circle cx="128" cy="50" r="8" fill="#D2691E" />
      <circle cx="128" cy="50" r="5" fill="#FFB6C1" />
      {/* Eyes */}
      <ellipse cx="88" cy="70" rx="6" ry="7" fill="white" />
      <ellipse cx="112" cy="70" rx="6" ry="7" fill="white" />
      <circle cx="90" cy="71" r="4" fill="#2D2D3A" />
      <circle cx="114" cy="71" r="4" fill="#2D2D3A" />
      <circle cx="91" cy="69" r="1.5" fill="white" />
      <circle cx="115" cy="69" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="100" cy="82" rx="5" ry="3.5" fill="#8B4513" />
      {/* Mouth */}
      <path d="M93 87C96 91 104 91 107 87" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Whisker dots */}
      <circle cx="85" cy="84" r="1.5" fill="#8B4513" />
      <circle cx="82" cy="80" r="1.5" fill="#8B4513" />
      <circle cx="115" cy="84" r="1.5" fill="#8B4513" />
      <circle cx="118" cy="80" r="1.5" fill="#8B4513" />
      {/* Cheeks */}
      <circle cx="78" cy="82" r="5" fill="#FFB6C1" fillOpacity="0.4" />
      <circle cx="122" cy="82" r="5" fill="#FFB6C1" fillOpacity="0.4" />
    </>
  );
}

const animalMap: Record<string, React.FC> = {
  dog: DogCharacter,
  cat: CatCharacter,
  fish: FishCharacter,
  bird: BirdCharacter,
  elephant: ElephantCharacter,
  lion: LionCharacter,
};

const AnimalCharacter: React.FC<AnimalCharacterProps> = React.memo(({ animal, size = 200, className }) => {
  const Character = animalMap[animal.toLowerCase()];

  if (!Character) {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
        <circle cx="100" cy="100" r="60" fill="#FFE66D" stroke="#F59E0B" strokeWidth="2" />
        <text x="100" y="108" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2D2D3A">{animal}</text>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className}>
      <Character />
    </svg>
  );
});

AnimalCharacter.displayName = 'AnimalCharacter';
export default AnimalCharacter;
