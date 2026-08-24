import React from 'react';

/**
 * AdaptLearn Official Brand Logo Component
 * Renders the master high-resolution AI Brain & Circuit Logo badge.
 * 
 * Dimensions:
 * - Desktop: 36px - 44px (default: 40px)
 * - Tablet & Mobile: 28px - 36px
 */
export const AdaptLearnLogo = ({ 
  size = 40, 
  className = '', 
  style = {} 
}) => {
  return (
    <div 
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(23, 140, 142, 0.15)',
        ...style
      }}
    >
      <img 
        src="/adaptlearn-logo.png" 
        alt="AdaptLearn Logo" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
    </div>
  );
};

export default AdaptLearnLogo;
