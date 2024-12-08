import React from 'react';

const Badge: React.FC<{ text: string }> = ({ text }) => {
    return <span className="badge">{text}</span>;
};

export default Badge;
