import { useState } from 'react';
import { Icon } from '@iconify/react';

type Character = {
  id: string;
  name: string;
};

const sampleCharacters: Character[] = [
  { id: '1', name: '女1' },
  { id: '2', name: '男1' },
  { id: '3', name: '女2' },
  { id: '4', name: '男2' }
];

type CharacterSelectorProps = {
  characters?: Character[];
  onSelect?: (character: Character) => void;
};

function CharacterSelector({ characters = sampleCharacters, onSelect }: CharacterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);

  const handleSelect = (character: Character) => {
    setSelectedCharacter(character);
    setIsOpen(false);
    if (onSelect) {
      onSelect(character);
    }
  };

  return (
    <div className="relative">
      <button
        className="flex items-center justify-between w-32 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedCharacter.name}</span>
        <Icon
          icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
          className="w-5 h-5 ml-2"
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul className="py-1 overflow-auto text-base">
            {characters.map((character) => (
              <li
                key={character.id}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                  selectedCharacter.id === character.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleSelect(character)}
              >
                <div className="flex items-center">
                  <span className="font-normal block truncate">{character.name}</span>
                </div>
                {selectedCharacter.id === character.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <Icon icon="mdi:check" className="w-5 h-5 text-gray-700" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CharacterSelector; 