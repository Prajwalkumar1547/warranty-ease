import React from 'react';
import { Phone, Mail, ExternalLink, MessageCircle, Sparkles } from 'lucide-react';
import BrandLogoIcon from './BrandLogoIcon';

export default function BrandCard({ brand, onStartLiveChat, onOpenAiClaim }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '1rem',
      border: '1px solid #e2e8f0',
      padding: '1rem',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      minHeight: '200px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '0.65rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 2 }}>
            <BrandLogoIcon brand={brand.name} size={26} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {brand.name}
              </h3>
              {brand.hasLiveChat && (
                <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Live Chat
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
              {brand.category} • Avg {brand.avgResponseTime || '< 10m'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
          <a href={`tel:${brand.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', textDecoration: 'none', fontWeight: 600 }}>
            <Phone size={13} color="#0066cc" />
            <span>{brand.phone}</span>
          </a>

          <a href={`mailto:${brand.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', textDecoration: 'none', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Mail size={13} color="#0066cc" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{brand.email}</span>
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.72rem', backgroundColor: '#fff7ed', borderColor: '#ffedd5', color: '#c2410c' }}
          onClick={() => onOpenAiClaim(brand)}
          title="Generate official claim letter"
        >
          <Sparkles size={12} />
          <span>AI Claim Email</span>
        </button>

        {brand.hasLiveChat ? (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.72rem', backgroundColor: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}
            onClick={() => onStartLiveChat(brand)}
          >
            <MessageCircle size={12} />
            <span>Live Support</span>
          </button>
        ) : (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.72rem', textDecoration: 'none', justifyContent: 'center' }}
          >
            <ExternalLink size={12} />
            <span>Website</span>
          </a>
        )}
      </div>
    </div>
  );
}

