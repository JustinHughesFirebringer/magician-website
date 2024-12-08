import React from 'react';

const Separator: React.FC<{ className?: string }> = ({ className }) => {
  return <hr className={`border-t border-gray-300 ${className}`} />;
};

export default Separator;
