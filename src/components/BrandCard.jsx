import React from 'react';
import { Phone, Mail, ExternalLink, MessageCircle, Sparkles, Clock } from 'lucide-react';
import BrandLogoIcon from './BrandLogoIcon';

export default function BrandCard({ brand, onStartLiveChat, onOpenAiClaim }) {
  const cleanWa = brand.whatsapp ? brand.whatsapp.replace(/[^0-9]/g, '') : null;
  const whatsappUrl = cleanWa
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hello ${brand.name} Support, I need assistance regarding my product warranty.`)}`
    : null;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid #e8edf2',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
    >
      {/* Card Header */}
      <div style={{ padding: '1rem 1rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Brand Logo */}
        <div style={{
          width: 46, height: 46, borderRadius: '0.75rem',
          background: '#f8fafc', border: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, padding: 3
        }}>
          <BrandLogoIcon brand={brand.name} size={30} />
        </div>

        {/* Brand Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
              {brand.name}
            </h3>
            {brand.hasLiveChat && (
              <span style={{
                fontSize: '0.62rem', background: '#dcfce7', color: '#15803d',
                padding: '0.1rem 0.45rem', borderRadius: '20px', fontWeight: 700, whiteSpace: 'nowrap'
              }}>
                ● Live Support
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {brand.category}
            {brand.avgResponseTime && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                <Clock size={10} />
                <span>Avg {brand.avgResponseTime}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div style={{ padding: '0 1rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {/* Phone */}
        <a href={`tel:${brand.phone}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.45rem 0.65rem', background: '#f8fafc', borderRadius: '0.55rem', textDecoration: 'none', color: '#1e293b', transition: 'background 0.15s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
        >
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Phone size={13} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1 }}>Toll-Free</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{brand.phone}</div>
          </div>
        </a>

        {/* Email */}
        <a href={`mailto:${brand.email}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.45rem 0.65rem', background: '#f8fafc', borderRadius: '0.55rem', textDecoration: 'none', color: '#1e293b', transition: 'background 0.15s', minWidth: 0 }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
        >
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mail size={13} color="#2563eb" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1 }}>Email</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.email}</div>
          </div>
        </a>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.4rem', padding: '0.65rem 1rem', borderTop: '1px solid #f1f5f9' }}>
        {/* AI Claim */}
        <button type="button" onClick={() => onOpenAiClaim(brand)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.45rem 0.5rem', borderRadius: '0.55rem', border: '1px solid #ffedd5', background: '#fff7ed', color: '#c2410c', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
          title="AI Claim Letter Generator"
        >
          <Sparkles size={13} />
          <span>AI Claim</span>
        </button>

        {/* WhatsApp / Live Chat / Website */}
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.45rem 0.5rem', borderRadius: '0.55rem', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none' }}>
            <MessageCircle size={13} />
            <span>WhatsApp</span>
          </a>
        ) : brand.hasLiveChat ? (
          <button type="button" onClick={() => onStartLiveChat(brand)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.45rem 0.5rem', borderRadius: '0.55rem', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
            <MessageCircle size={13} />
            <span>Live Chat</span>
          </button>
        ) : (
          <a href={brand.website} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.45rem 0.5rem', borderRadius: '0.55rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none' }}>
            <ExternalLink size={13} />
            <span>Website</span>
          </a>
        )}
      </div>
    </div>
  );
}
