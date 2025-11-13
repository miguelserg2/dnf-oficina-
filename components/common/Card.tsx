
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-2xl p-6 transition-shadow ${className}`}>
      {children}
    </div>
  );
};

export default Card;