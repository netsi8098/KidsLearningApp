/**
 * AlphabetIllustrations — SVG illustrations for each letter of the alphabet.
 * Cute flat cartoon style with chunky strokes and pastel fills.
 */
import React from 'react';

interface AlphabetIllustrationProps {
  letter: string;
  size?: number;
  className?: string;
}

/* A = Apple */
function Apple() {
  return (<>
    <circle cx="50" cy="55" r="30" fill="#FF6B6B" stroke="#EF4444" strokeWidth="2.5"/>
    <ellipse cx="50" cy="48" rx="12" ry="8" fill="#FF8E8E" opacity="0.5"/>
    <path d="M50 25V18" stroke="#8B4513" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="56" cy="20" rx="8" ry="5" fill="#6BCB77" transform="rotate(-20 56 20)"/>
    <circle cx="42" cy="50" r="2" fill="#2D2D3A"/><circle cx="56" cy="50" r="2" fill="#2D2D3A"/>
    <path d="M44 58C47 62 53 62 56 58" stroke="#2D2D3A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </>);
}

/* B = Butterfly */
function Butterfly() {
  return (<>
    <ellipse cx="50" cy="50" rx="3" ry="15" fill="#8B4513" stroke="#6B3410" strokeWidth="1.5"/>
    <ellipse cx="35" cy="40" rx="15" ry="12" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="2" transform="rotate(-15 35 40)"/>
    <ellipse cx="65" cy="40" rx="15" ry="12" fill="#FF8FAB" stroke="#F472B6" strokeWidth="2" transform="rotate(15 65 40)"/>
    <ellipse cx="38" cy="58" rx="12" ry="9" fill="#4ECDC4" stroke="#2DD4BF" strokeWidth="2" transform="rotate(-10 38 58)"/>
    <ellipse cx="62" cy="58" rx="12" ry="9" fill="#FFE66D" stroke="#F59E0B" strokeWidth="2" transform="rotate(10 62 58)"/>
    <circle cx="35" cy="40" r="3" fill="white" opacity="0.4"/><circle cx="65" cy="40" r="3" fill="white" opacity="0.4"/>
    <path d="M47 32C44 25 40 22 38 24" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M53 32C56 25 60 22 62 24" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="37" cy="23" r="2" fill="#8B4513"/><circle cx="63" cy="23" r="2" fill="#8B4513"/>
  </>);
}

/* C = Cat */
function Cat() {
  return (<>
    <circle cx="50" cy="55" r="25" fill="#F4A460" stroke="#D2691E" strokeWidth="2.5"/>
    <path d="M30 40L25 18L40 35Z" fill="#F4A460" stroke="#D2691E" strokeWidth="2"/>
    <path d="M70 40L75 18L60 35Z" fill="#F4A460" stroke="#D2691E" strokeWidth="2"/>
    <circle cx="40" cy="48" r="4" fill="white"/><circle cx="60" cy="48" r="4" fill="white"/>
    <circle cx="41" cy="49" r="2.5" fill="#4CAF50"/><circle cx="61" cy="49" r="2.5" fill="#4CAF50"/>
    <path d="M47 56L50 53L53 56Z" fill="#FF8FAB"/>
    <path d="M44 60C47 63 53 63 56 60" stroke="#D2691E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <line x1="30" y1="52" x2="18" y2="49" stroke="#D2691E" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="30" y1="56" x2="16" y2="57" stroke="#D2691E" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="70" y1="52" x2="82" y2="49" stroke="#D2691E" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="70" y1="56" x2="84" y2="57" stroke="#D2691E" strokeWidth="1.5" strokeLinecap="round"/>
  </>);
}

/* D = Dog */
function Dog() {
  return (<>
    <circle cx="50" cy="55" r="25" fill="#D2691E" stroke="#A0522D" strokeWidth="2.5"/>
    <ellipse cx="35" cy="38" rx="10" ry="18" fill="#A0522D" stroke="#8B4513" strokeWidth="2" transform="rotate(-15 35 38)"/>
    <ellipse cx="65" cy="38" rx="10" ry="18" fill="#A0522D" stroke="#8B4513" strokeWidth="2" transform="rotate(15 65 38)"/>
    <ellipse cx="50" cy="60" rx="14" ry="10" fill="#DEB887"/>
    <circle cx="42" cy="48" r="4" fill="white"/><circle cx="58" cy="48" r="4" fill="white"/>
    <circle cx="43" cy="49" r="2.5" fill="#2D2D3A"/><circle cx="59" cy="49" r="2.5" fill="#2D2D3A"/>
    <ellipse cx="50" cy="58" rx="5" ry="3" fill="#2D2D3A"/>
    <ellipse cx="50" cy="67" rx="4" ry="6" fill="#FF8FAB" stroke="#E57373" strokeWidth="1"/>
  </>);
}

/* E = Elephant */
function Elephant() {
  return (<>
    <circle cx="50" cy="50" r="28" fill="#9E9E9E" stroke="#757575" strokeWidth="2.5"/>
    <ellipse cx="25" cy="45" rx="15" ry="18" fill="#BDBDBD" stroke="#757575" strokeWidth="2"/>
    <ellipse cx="75" cy="45" rx="15" ry="18" fill="#BDBDBD" stroke="#757575" strokeWidth="2"/>
    <ellipse cx="25" cy="45" rx="8" ry="10" fill="#FFB6C1" opacity="0.4"/>
    <ellipse cx="75" cy="45" rx="8" ry="10" fill="#FFB6C1" opacity="0.4"/>
    <path d="M50 62C50 72 45 80 40 82C38 83 37 81 39 78C42 72 44 68 43 62" fill="#9E9E9E" stroke="#757575" strokeWidth="2"/>
    <circle cx="42" cy="44" r="3" fill="white"/><circle cx="58" cy="44" r="3" fill="white"/>
    <circle cx="43" cy="45" r="2" fill="#2D2D3A"/><circle cx="59" cy="45" r="2" fill="#2D2D3A"/>
  </>);
}

/* F = Frog */
function Frog() {
  return (<>
    <ellipse cx="50" cy="55" rx="28" ry="22" fill="#6BCB77" stroke="#4CAF50" strokeWidth="2.5"/>
    <circle cx="35" cy="32" r="10" fill="#6BCB77" stroke="#4CAF50" strokeWidth="2"/>
    <circle cx="65" cy="32" r="10" fill="#6BCB77" stroke="#4CAF50" strokeWidth="2"/>
    <circle cx="35" cy="30" r="6" fill="white"/><circle cx="65" cy="30" r="6" fill="white"/>
    <circle cx="36" cy="31" r="3.5" fill="#2D2D3A"/><circle cx="66" cy="31" r="3.5" fill="#2D2D3A"/>
    <path d="M35 62C42 68 58 68 65 62" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="30" cy="55" r="4" fill="#FFB6C1" opacity="0.4"/><circle cx="70" cy="55" r="4" fill="#FFB6C1" opacity="0.4"/>
  </>);
}

/* G = Grapes */
function Grapes() {
  return (<>
    <circle cx="40" cy="40" r="8" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="1.5"/>
    <circle cx="55" cy="38" r="8" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="1.5"/>
    <circle cx="35" cy="53" r="8" fill="#9B59B6" stroke="#8B5CF6" strokeWidth="1.5"/>
    <circle cx="50" cy="52" r="8" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="1.5"/>
    <circle cx="65" cy="50" r="8" fill="#9B59B6" stroke="#8B5CF6" strokeWidth="1.5"/>
    <circle cx="42" cy="65" r="8" fill="#9B59B6" stroke="#8B5CF6" strokeWidth="1.5"/>
    <circle cx="57" cy="63" r="8" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="1.5"/>
    <path d="M48 32V20" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round"/>
    <ellipse cx="55" cy="18" rx="8" ry="5" fill="#6BCB77" transform="rotate(15 55 18)"/>
    <ellipse cx="42" cy="20" rx="6" ry="4" fill="#4CAF50" transform="rotate(-20 42 20)"/>
  </>);
}

/* H = House */
function House() {
  return (<>
    <rect x="25" y="45" width="50" height="35" rx="2" fill="#FF8C42" stroke="#E67E22" strokeWidth="2.5"/>
    <path d="M20 48L50 22L80 48" fill="#EF4444" stroke="#DC2626" strokeWidth="2.5" strokeLinejoin="round"/>
    <rect x="42" y="58" width="16" height="22" rx="2" fill="#8B4513" stroke="#6B3410" strokeWidth="1.5"/>
    <circle cx="55" cy="70" r="1.5" fill="#FFE66D"/>
    <rect x="30" y="52" width="10" height="10" rx="1" fill="#45B7D1" stroke="#2196F3" strokeWidth="1.5"/>
    <rect x="60" y="52" width="10" height="10" rx="1" fill="#45B7D1" stroke="#2196F3" strokeWidth="1.5"/>
  </>);
}

/* I = Ice Cream */
function IceCream() {
  return (<>
    <path d="M38 50L50 85L62 50" fill="#DEB887" stroke="#C9A96E" strokeWidth="2"/>
    <circle cx="50" cy="40" r="15" fill="#FF8FAB" stroke="#F472B6" strokeWidth="2"/>
    <circle cx="40" cy="32" r="10" fill="#FFE66D" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="60" cy="34" r="10" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="2"/>
    <circle cx="50" cy="28" r="3" fill="#FF6B6B"/><circle cx="42" cy="38" r="2" fill="#4ECDC4"/>
    <circle cx="58" cy="36" r="2.5" fill="#FFE66D"/>
  </>);
}

/* J = Juggler (star character) */
function Juggler() {
  return (<>
    <circle cx="50" cy="50" r="15" fill="#FFE66D" stroke="#F59E0B" strokeWidth="2.5"/>
    <circle cx="45" cy="47" r="2" fill="#2D2D3A"/><circle cx="55" cy="47" r="2" fill="#2D2D3A"/>
    <path d="M45 55C47 58 53 58 55 55" stroke="#2D2D3A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M35 50L20 35" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    <path d="M65 50L80 35" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="18" cy="32" r="5" fill="#FF6B6B"/><circle cx="50" cy="18" r="5" fill="#4ECDC4"/><circle cx="82" cy="32" r="5" fill="#A78BFA"/>
  </>);
}

/* K = Kite */
function Kite() {
  return (<>
    <path d="M50 15L70 45L50 70L30 45Z" fill="#FF6B6B" stroke="#EF4444" strokeWidth="2.5"/>
    <line x1="50" y1="15" x2="50" y2="70" stroke="#EF4444" strokeWidth="1.5"/>
    <line x1="30" y1="45" x2="70" y2="45" stroke="#EF4444" strokeWidth="1.5"/>
    <path d="M50 70C52 75 48 80 50 85" stroke="#8B4513" strokeWidth="2" fill="none"/>
    <circle cx="48" cy="78" r="3" fill="#FFE66D"/><circle cx="53" cy="83" r="3" fill="#4ECDC4"/>
  </>);
}

/* L = Lion */
function Lion() {
  return (<>
    <circle cx="50" cy="50" r="25" fill="#D2691E"/>
    <circle cx="50" cy="52" r="18" fill="#F4A460"/>
    <circle cx="43" cy="47" r="3" fill="white"/><circle cx="57" cy="47" r="3" fill="white"/>
    <circle cx="44" cy="48" r="2" fill="#2D2D3A"/><circle cx="58" cy="48" r="2" fill="#2D2D3A"/>
    <ellipse cx="50" cy="55" rx="3" ry="2" fill="#8B4513"/>
    <path d="M45 59C48 62 52 62 55 59" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="38" cy="56" r="3" fill="#FFB6C1" opacity="0.5"/><circle cx="62" cy="56" r="3" fill="#FFB6C1" opacity="0.5"/>
  </>);
}

/* M = Moon */
function Moon() {
  return (<>
    <path d="M55 20C40 20 28 32 28 50C28 68 40 80 55 80C42 75 35 63 38 50C41 37 48 25 60 22C58 20 56 20 55 20Z" fill="#FFE66D" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="70" cy="25" r="2" fill="#FFE66D"/><circle cx="75" cy="40" r="1.5" fill="#FFE66D"/><circle cx="72" cy="55" r="1.8" fill="#FFE66D"/>
  </>);
}

/* N = Nut */
function Nut() {
  return (<>
    <ellipse cx="50" cy="55" rx="18" ry="22" fill="#DEB887" stroke="#C9A96E" strokeWidth="2.5"/>
    <ellipse cx="50" cy="50" rx="10" ry="14" fill="#D2B48C" opacity="0.5"/>
    <path d="M50 33V26" stroke="#8B4513" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="44" cy="25" rx="6" ry="4" fill="#6BCB77"/><ellipse cx="56" cy="25" rx="6" ry="4" fill="#4CAF50"/>
  </>);
}

/* O = Octopus */
function Octopus() {
  return (<>
    <ellipse cx="50" cy="40" rx="22" ry="18" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="2.5"/>
    <circle cx="42" cy="36" r="4" fill="white"/><circle cx="58" cy="36" r="4" fill="white"/>
    <circle cx="43" cy="37" r="2.5" fill="#2D2D3A"/><circle cx="59" cy="37" r="2.5" fill="#2D2D3A"/>
    <path d="M44 46C47 49 53 49 56 46" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M30 55C25 65 28 75 32 72" stroke="#A78BFA" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M38 58C34 68 36 76 40 73" stroke="#A78BFA" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M50 58C50 70 48 78 50 75" stroke="#A78BFA" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M62 58C66 68 64 76 60 73" stroke="#A78BFA" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M70 55C75 65 72 75 68 72" stroke="#A78BFA" strokeWidth="3" fill="none" strokeLinecap="round"/>
  </>);
}

/* P = Penguin */
function Penguin() {
  return (<>
    <ellipse cx="50" cy="55" rx="22" ry="28" fill="#2D2D3A" stroke="#1a1a2e" strokeWidth="2"/>
    <ellipse cx="50" cy="60" rx="14" ry="20" fill="white"/>
    <circle cx="42" cy="42" r="4" fill="white"/><circle cx="58" cy="42" r="4" fill="white"/>
    <circle cx="43" cy="43" r="2.5" fill="#2D2D3A"/><circle cx="59" cy="43" r="2.5" fill="#2D2D3A"/>
    <path d="M47 50L50 46L53 50Z" fill="#FF8C42"/>
    <circle cx="38" cy="55" r="4" fill="#FFB6C1" opacity="0.4"/><circle cx="62" cy="55" r="4" fill="#FFB6C1" opacity="0.4"/>
    <path d="M28 55L22 65" stroke="#2D2D3A" strokeWidth="4" strokeLinecap="round"/>
    <path d="M72 55L78 65" stroke="#2D2D3A" strokeWidth="4" strokeLinecap="round"/>
  </>);
}

/* Q = Queen (crown) */
function Queen() {
  return (<>
    <path d="M25 50L30 30L40 45L50 25L60 45L70 30L75 50Z" fill="#FFD93D" stroke="#F59E0B" strokeWidth="2.5"/>
    <rect x="25" y="50" width="50" height="15" rx="3" fill="#FFD93D" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="30" cy="30" r="3" fill="#FF6B6B"/><circle cx="50" cy="25" r="3" fill="#4ECDC4"/><circle cx="70" cy="30" r="3" fill="#A78BFA"/>
    <rect x="30" y="68" width="40" height="12" rx="4" fill="#FF8FAB" stroke="#F472B6" strokeWidth="1.5"/>
    <circle cx="42" cy="72" r="2" fill="#2D2D3A"/><circle cx="58" cy="72" r="2" fill="#2D2D3A"/>
    <path d="M45 77C48 79 52 79 55 77" stroke="#2D2D3A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
  </>);
}

/* R = Rainbow */
function Rainbow() {
  return (<>
    <path d="M15 70C15 42 30 20 50 20C70 20 85 42 85 70" stroke="#FF6B6B" strokeWidth="5" fill="none"/>
    <path d="M20 70C20 46 33 26 50 26C67 26 80 46 80 70" stroke="#FF8C42" strokeWidth="4" fill="none"/>
    <path d="M25 70C25 50 36 32 50 32C64 32 75 50 75 70" stroke="#FFE66D" strokeWidth="4" fill="none"/>
    <path d="M30 70C30 54 38 38 50 38C62 38 70 54 70 70" stroke="#6BCB77" strokeWidth="4" fill="none"/>
    <path d="M35 70C35 58 40 44 50 44C60 44 65 58 65 70" stroke="#45B7D1" strokeWidth="4" fill="none"/>
    <ellipse cx="18" cy="72" rx="10" ry="6" fill="white" opacity="0.6"/><ellipse cx="82" cy="72" rx="10" ry="6" fill="white" opacity="0.6"/>
  </>);
}

/* S = Star */
function Star() {
  return (<>
    <path d="M50 10L58 35L85 35L63 52L72 78L50 62L28 78L37 52L15 35L42 35Z" fill="#FFE66D" stroke="#F59E0B" strokeWidth="2.5"/>
    <circle cx="44" cy="42" r="2.5" fill="#2D2D3A"/><circle cx="56" cy="42" r="2.5" fill="#2D2D3A"/>
    <path d="M45 50C48 53 52 53 55 50" stroke="#2D2D3A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="38" cy="48" r="3" fill="#FFB6C1" opacity="0.4"/><circle cx="62" cy="48" r="3" fill="#FFB6C1" opacity="0.4"/>
  </>);
}

/* T = Turtle */
function Turtle() {
  return (<>
    <ellipse cx="50" cy="55" rx="28" ry="20" fill="#6BCB77" stroke="#4CAF50" strokeWidth="2.5"/>
    <ellipse cx="50" cy="55" rx="20" ry="14" fill="#8DD691" opacity="0.5"/>
    <path d="M40 50L50 42L60 50L50 58Z" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>
    <circle cx="28" cy="42" r="8" fill="#6BCB77" stroke="#4CAF50" strokeWidth="2"/>
    <circle cx="24" cy="40" r="2" fill="white"/><circle cx="25" cy="41" r="1.2" fill="#2D2D3A"/>
    <path d="M20 45C19 46 20 47 22 46" stroke="#4CAF50" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <ellipse cx="32" cy="70" rx="6" ry="4" fill="#6BCB77"/><ellipse cx="68" cy="70" rx="6" ry="4" fill="#6BCB77"/>
    <path d="M75 60C80 58 82 62 78 64" fill="#6BCB77"/>
  </>);
}

/* U = Umbrella */
function Umbrella() {
  return (<>
    <path d="M20 45C20 28 33 15 50 15C67 15 80 28 80 45" fill="#FF6B6B" stroke="#EF4444" strokeWidth="2.5"/>
    <line x1="50" y1="15" x2="50" y2="75" stroke="#8B4513" strokeWidth="3" strokeLinecap="round"/>
    <path d="M50 75C50 80 55 82 58 78" stroke="#8B4513" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M20 45C20 38 28 32 35 45" fill="#FF8E8E" stroke="none"/>
    <path d="M35 45C35 38 42 32 50 45" fill="#FF6B6B" stroke="none"/>
    <path d="M50 45C50 38 58 32 65 45" fill="#FF8E8E" stroke="none"/>
    <path d="M65 45C65 38 72 32 80 45" fill="#FF6B6B" stroke="none"/>
  </>);
}

/* V = Violin */
function Violin() {
  return (<>
    <ellipse cx="45" cy="55" rx="12" ry="16" fill="#D2691E" stroke="#A0522D" strokeWidth="2"/>
    <ellipse cx="45" cy="40" rx="10" ry="12" fill="#DEB887" stroke="#A0522D" strokeWidth="2"/>
    <rect x="43" y="20" width="4" height="30" fill="#8B4513"/>
    <rect x="39" y="15" width="12" height="6" rx="2" fill="#8B4513"/>
    <line x1="41" y1="17" x2="41" y2="21" stroke="#FFE66D" strokeWidth="1"/><line x1="45" y1="17" x2="45" y2="21" stroke="#FFE66D" strokeWidth="1"/>
    <line x1="49" y1="17" x2="49" y2="21" stroke="#FFE66D" strokeWidth="1"/>
    <path d="M65 25L35 70" stroke="#C9A96E" strokeWidth="1.5"/>
    <ellipse cx="40" cy="48" rx="2" ry="3" fill="#2D2D3A"/>
    <ellipse cx="50" cy="48" rx="2" ry="3" fill="#2D2D3A"/>
  </>);
}

/* W = Whale */
function Whale() {
  return (<>
    <ellipse cx="50" cy="50" rx="32" ry="22" fill="#45B7D1" stroke="#2196F3" strokeWidth="2.5"/>
    <ellipse cx="45" cy="55" rx="18" ry="12" fill="#B3E5FC" opacity="0.4"/>
    <path d="M78 42C85 35 88 38 82 44" fill="#45B7D1" stroke="#2196F3" strokeWidth="2"/>
    <circle cx="35" cy="45" r="4" fill="white"/><circle cx="36" cy="46" r="2.5" fill="#2D2D3A"/>
    <path d="M25 58C30 62 40 62 45 58" stroke="#2196F3" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M55 30C52 22 48 22 50 28" stroke="#45B7D1" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="50" cy="18" r="3" fill="white" opacity="0.5"/>
  </>);
}

/* X = Xylophone */
function Xylophone() {
  return (<>
    <rect x="15" y="30" width="55" height="8" rx="3" fill="#FF6B6B" stroke="#EF4444" strokeWidth="1.5"/>
    <rect x="18" y="42" width="48" height="8" rx="3" fill="#FF8C42" stroke="#E67E22" strokeWidth="1.5"/>
    <rect x="22" y="54" width="40" height="8" rx="3" fill="#FFE66D" stroke="#F59E0B" strokeWidth="1.5"/>
    <rect x="26" y="66" width="32" height="8" rx="3" fill="#4ECDC4" stroke="#2DD4BF" strokeWidth="1.5"/>
    <line x1="42" y1="28" x2="42" y2="76" stroke="#8B4513" strokeWidth="2"/>
    <path d="M72 25L78 20" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="80" cy="18" r="4" fill="#A78BFA"/>
    <path d="M72 35L78 40" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="80" cy="42" r="4" fill="#FF8FAB"/>
  </>);
}

/* Y = Yarn */
function Yarn() {
  return (<>
    <circle cx="50" cy="55" r="24" fill="#FF8FAB" stroke="#F472B6" strokeWidth="2.5"/>
    <path d="M30 45C40 35 60 35 70 45" stroke="#F472B6" strokeWidth="1.5" fill="none" opacity="0.4"/>
    <path d="M28 55C38 45 62 45 72 55" stroke="#F472B6" strokeWidth="1.5" fill="none" opacity="0.4"/>
    <path d="M30 65C40 55 60 55 70 65" stroke="#F472B6" strokeWidth="1.5" fill="none" opacity="0.4"/>
    <path d="M65 35C70 30 75 28 78 32C80 36 75 38 70 36" stroke="#FF8FAB" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M78 32C82 28 85 30 83 34" stroke="#FF8FAB" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </>);
}

/* Z = Zebra */
function Zebra() {
  return (<>
    <ellipse cx="50" cy="55" rx="25" ry="20" fill="white" stroke="#2D2D3A" strokeWidth="2.5"/>
    <path d="M30 45L40 55L30 65" stroke="#2D2D3A" strokeWidth="3" fill="none"/>
    <path d="M40 42L50 55L40 68" stroke="#2D2D3A" strokeWidth="3" fill="none"/>
    <path d="M50 40L60 55L50 70" stroke="#2D2D3A" strokeWidth="3" fill="none"/>
    <path d="M60 42L70 55L60 68" stroke="#2D2D3A" strokeWidth="3" fill="none"/>
    <circle cx="35" cy="35" r="10" fill="white" stroke="#2D2D3A" strokeWidth="2"/>
    <circle cx="33" cy="33" r="2" fill="#2D2D3A"/><circle cx="38" cy="33" r="2" fill="#2D2D3A"/>
    <path d="M32 38C34 40 37 40 39 38" stroke="#2D2D3A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M30 22L28 14" stroke="#2D2D3A" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M38 22L40 14" stroke="#2D2D3A" strokeWidth="2.5" strokeLinecap="round"/>
  </>);
}

const letterMap: Record<string, React.FC> = {
  A: Apple, B: Butterfly, C: Cat, D: Dog, E: Elephant, F: Frog,
  G: Grapes, H: House, I: IceCream, J: Juggler, K: Kite, L: Lion,
  M: Moon, N: Nut, O: Octopus, P: Penguin, Q: Queen, R: Rainbow,
  S: Star, T: Turtle, U: Umbrella, V: Violin, W: Whale, X: Xylophone,
  Y: Yarn, Z: Zebra,
};

const AlphabetIllustration: React.FC<AlphabetIllustrationProps> = React.memo(({ letter, size = 120, className }) => {
  const Illustration = letterMap[letter.toUpperCase()];
  if (!Illustration) return null;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <Illustration />
    </svg>
  );
});

AlphabetIllustration.displayName = 'AlphabetIllustration';
export default AlphabetIllustration;
