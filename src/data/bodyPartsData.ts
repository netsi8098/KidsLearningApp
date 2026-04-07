export interface BodyPartItem {
  name: string;
  emoji: string;
  funFact: string;
  action: string; // e.g., "Touch your head!"
}

export const bodyPartsData: BodyPartItem[] = [
  { name: 'Head', emoji: '🧠', funFact: 'Your brain is inside your head!', action: 'Touch your head!' },
  { name: 'Eyes', emoji: '👀', funFact: 'Your eyes help you see the world!', action: 'Blink your eyes!' },
  { name: 'Nose', emoji: '👃', funFact: 'Your nose helps you smell flowers!', action: 'Touch your nose!' },
  { name: 'Mouth', emoji: '👄', funFact: 'Your mouth helps you eat and talk!', action: 'Open your mouth wide!' },
  { name: 'Ears', emoji: '👂', funFact: 'Your ears help you hear music!', action: 'Touch your ears!' },
  { name: 'Hands', emoji: '🤲', funFact: 'You have 10 fingers on your hands!', action: 'Clap your hands!' },
  { name: 'Feet', emoji: '🦶', funFact: 'Your feet help you walk and run!', action: 'Stomp your feet!' },
  { name: 'Tummy', emoji: '😋', funFact: 'Your tummy digests your food!', action: 'Pat your tummy!' },
  { name: 'Knees', emoji: '🦵', funFact: 'Your knees help you bend your legs!', action: 'Bend your knees!' },
  { name: 'Shoulders', emoji: '💪', funFact: 'Your shoulders help you carry things!', action: 'Shrug your shoulders!' },
];
