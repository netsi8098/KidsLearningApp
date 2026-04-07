import { useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { getCharacterById, type CharacterData } from '../data/charactersData';

type ContextType = 'greeting' | 'encouragement' | 'celebration';

interface UseCharacterReturn {
  character: CharacterData;
  getContextMessage: (context: ContextType) => string;
}

export function useCharacter(): UseCharacterReturn {
  const { activeCharacter } = useApp();

  const character = useMemo(
    () => getCharacterById(activeCharacter || 'leo'),
    [activeCharacter]
  );

  const getContextMessage = useCallback(
    (context: ContextType): string => {
      let messages: string[];
      switch (context) {
        case 'greeting':
          messages = character.greetings;
          break;
        case 'encouragement':
          messages = character.encouragements;
          break;
        case 'celebration':
          messages = character.celebrations;
          break;
        default:
          messages = character.greetings;
      }
      const index = Math.floor(Math.random() * messages.length);
      return messages[index];
    },
    [character]
  );

  return { character, getContextMessage };
}
