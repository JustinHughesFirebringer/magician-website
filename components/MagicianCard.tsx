import React from 'react';
import { Magician } from '../types/magician';

interface MagicianCardProps {
  magician: Magician;
}

const MagicianCard: React.FC<MagicianCardProps> = ({ magician }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <img src={magician.imageUrl} alt={magician.name} className="w-full h-48 object-cover rounded-md" />
      <h3 className="text-xl font-semibold">{magician.name}</h3>
      <p>{magician.businessName}</p>
      <p>{magician.city}, {magician.state}</p>
      <p>Rating: {magician.rating} ({magician.reviewCount} reviews)</p>
      <p>{magician.description}</p>
      <a href={magician.website} className="text-blue-500">Visit Website</a>
    </div>
  );
};

export default MagicianCard;
