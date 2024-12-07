import React from 'react';
import { Magician } from '../types/magician';
import MagicianCard from './MagicianCard';

interface MagicianListProps {
  magicians: Magician[];
}

const MagicianList: React.FC<MagicianListProps> = ({ magicians }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {magicians.map((magician) => (
        <MagicianCard key={magician.id} magician={magician} />
      ))}
    </div>
  );
};

export default MagicianList;
