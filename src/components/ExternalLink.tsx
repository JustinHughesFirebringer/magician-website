'use client';

import React from 'react';

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function ExternalLink({ href, className, children }: ExternalLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
