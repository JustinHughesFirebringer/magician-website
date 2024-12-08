import React from 'react';
import { Magician } from '../types/magician';

interface MagicianCardProps {
  magician: Magician;
}

const MagicianCard: React.FC<MagicianCardProps> = ({ magician }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <img 
        src={magician.imageUrl || '/placeholder-magician.jpg'} 
        alt={magician.name} 
        className="w-full h-48 object-cover rounded-md" 
      />
      <h3 className="text-xl font-semibold">{magician.name}</h3>
      {magician.business_name && <p>{magician.business_name}</p>}
      {(magician.city && magician.state) && <p>{magician.city}, {magician.state}</p>}
      {(magician.rating && magician.review_count) && (
        <p>Rating: {magician.rating} ({magician.review_count} reviews)</p>
      )}
      {magician.description && <p>{magician.description}</p>}
      {magician.website_url && (
        <a href={magician.website_url} className="text-blue-500">Visit Website</a>
      )}
    </div>
  );
};

export default MagicianCard;
