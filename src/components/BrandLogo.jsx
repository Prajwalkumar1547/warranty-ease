import React, { useState } from 'react';
import { getBrandMetadata } from '../utils/brandLogos';

export default function BrandLogo({ brand, domain, logoUrl, size = 28, style = {} }) {
  const [hasError, setHasError] = useState(false);
  const metadata = getBrandMetadata(brand, domain);
  const activeLogoUrl = logoUrl || metadata.logoUrl;

  // Fallback Monogram Badge (Tier 4)
  if (hasError || !activeLogoUrl) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: size <= 32 ? '6px' : '10px',
          background: metadata.color || '#0066cc',
          color: '#ffffff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: size <= 28 ? '0.65rem' : '0.85rem',
          letterSpacing: '-0.02em',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          flexShrink: 0,
          ...style
        }}
      >
        {metadata.monogram}
      </div>
    );
  }

  return (
    <img
      src={activeLogoUrl}
      alt={`${brand || 'Brand'} logo`}
      onError={() => setHasError(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        borderRadius: size <= 32 ? '6px' : '10px',
        background: '#ffffff',
        padding: '2px',
        border: '1px solid #e5e5ea',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        flexShrink: 0,
        ...style
      }}
    />
  );
}
