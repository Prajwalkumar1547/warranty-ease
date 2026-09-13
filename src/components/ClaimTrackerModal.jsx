import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  Wrench,
  ShieldCheck,
  Send,
  Building2,
  AlertCircle,
  MessageSquare,
  FileText,
  MapPin,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';
import BrandLogoIcon from './BrandLogoIcon';
import { api } from '../services/api';

const STAGES = [
  { id: 'SUBMITTED', label: 'Submitted' },
  { id: 'UNDER_REVIEW', label: 'Documents Verified' },
  { id: 'APPROVED', label: 'Company Reviewing' },
  { id: 'ASSIGNED_TO_SERVICE_CENTRE', label: 'Service Centre' },
  { id: 'RESOLVED', label: 'Completed' },
];

export default function ClaimTrackerModal({ claim, onClose, onDeleteClaim }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'messages'

  useEffect(() => {
    if (claim?.id) {
      api.getClaimById(claim.id).then(c => {
        if (c?.messages) setMessages(c.messages);
      }).catch(() => {});
    }
  }, [claim]);

  if (!claim) return null;

  const getStageIndex = (statusStr) => {
    const s = (statusStr || '').toUpperCase();
    if (['RESOLVED', 'CLOSED'].includes(s)) return 4;
    if (['ASSIGNED_TO_SERVICE_CENTRE', 'IN_REPAIR', 'REPLACEMENT_PROCESS'].includes(s)) return 3;
    if (['APPROVED', 'MORE_INFORMATION_REQUIRED'].includes(s)) return 2;
    if (['UNDER_REVIEW'].includes(s)) return 1;
    return 0; // SUBMITTED
  };

  const currentStage = getStageIndex(claim.status);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsSending(true);
    try {
      const msg = await api.addClaimMessage(
        claim.id,
        'usr-cust-1',
        'Rahul Sharma',
        'customer',
        newMessage.trim()
      );
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-content" style={{ maxWidth: '640px', background: '#f8fafc' }} onClick={(e) => e.stopPropagation()}>

        {/* Modal Header */}
        <div style={{ background: '#ffffff', padding: '1.2rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
              <BrandLogoIcon brand={claim.brand} domain={claim.logoDomain} size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#2563eb', fontFamily: 'monospace' }}>
                  {claim.id}
                </span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '10px',
                  background: ['APPROVED', 'RESOLVED'].includes(claim.status) ? '#f0fdf4' : ['REJECTED'].includes(claim.status) ? '#fef2f2' : '#eff6ff',
                  color: ['APPROVED', 'RESOLVED'].includes(claim.status) ? '#16a34a' : ['REJECTED'].includes(claim.status) ? '#dc2626' : '#2563eb'
                }}>
                  {claim.status}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0 0' }}>
                {claim.brand} {claim.productName || claim.model}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {onDeleteClaim && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onDeleteClaim(claim.id)}
                style={{ padding: '0.35rem 0.65rem', color: '#dc2626', fontSize: '0.75rem' }}
                title="Cancel claim"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        {/* Tab switcher: Timeline vs Communication */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#ffffff', padding: '0 1.5rem' }}>
          <button
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '0.75rem 1rem', border: 'none', background: 'transparent',
              fontWeight: activeTab === 'timeline' ? 800 : 600,
              color: activeTab === 'timeline' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'timeline' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer', fontSize: '0.85rem'
            }}
          >
            Claim Progress Timeline
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            style={{
              padding: '0.75rem 1rem', border: 'none', background: 'transparent',
              fontWeight: activeTab === 'messages' ? 800 : 600,
              color: activeTab === 'messages' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'messages' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem'
            }}
          >
            <MessageSquare size={14} />
            <span>Messages ({messages.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Visual 5-Stage Timeline (Section 13) */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.25rem' }}>
                  Lifecycle Status:
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {STAGES.map((s, idx) => {
                    const isDone = idx < currentStage;
                    const isCurrent = idx === currentStage;
                    const isPending = idx > currentStage;

                    return (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', position: 'relative' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: isDone ? '#16a34a' : isCurrent ? '#2563eb' : '#e2e8f0',
                          color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 800, zIndex: 1
                        }}>
                          {isDone ? '✓' : isCurrent ? '●' : '○'}
                        </div>

                        {idx < STAGES.length - 1 && (
                          <div style={{
                            position: 'absolute', left: 13, top: 28, width: 2, height: 20,
                            background: isDone ? '#16a34a' : '#e2e8f0'
                          }} />
                        )}

                        <div style={{ paddingTop: '0.15rem' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#0f172a' : isDone ? '#16a34a' : '#64748b' }}>
                            {s.label}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {isDone ? 'Completed' : isCurrent ? 'In progress' : 'Awaiting previous milestone'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Centre Hub Details if Assigned */}
              {claim.service_centre_info && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.85rem', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <MapPin size={18} color="#15803d" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#15803d', display: 'block' }}>Authorized Service Center Assigned</strong>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#166534', lineHeight: 1.4 }}>
                      {claim.service_centre_info}
                    </p>
                  </div>
                </div>
              )}

              {/* Problem Details */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '1rem' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', marginBottom: '0.25rem' }}>
                  Problem Details:
                </div>
                <p style={{ margin: 0, fontSize: '0.83rem', color: '#0f172a', lineHeight: 1.5 }}>
                  {claim.problemDescription}
                </p>
              </div>

              {/* Section 15 Truthful Routing Info */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.85rem 1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <Info size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.45 }}>
                  This claim is active in the WarrantyEase system and queued for {claim.brand} brand processing.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ minHeight: '180px', maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '1rem' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', fontSize: '0.82rem' }}>
                    No messages yet. You can communicate with WarrantyEase support or brand team below.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isCustomer = m.sender_role === 'customer';
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isCustomer ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          background: isCustomer ? '#2563eb' : '#f1f5f9',
                          color: isCustomer ? '#fff' : '#0f172a',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '0.75rem',
                          fontSize: '0.82rem',
                          lineHeight: 1.45
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, opacity: 0.85, marginBottom: '0.2rem' }}>
                          {m.sender_name} ({m.sender_role})
                        </div>
                        <div>{m.message}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Type a message or question regarding your claim..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem 0.85rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', fontSize: '0.83rem' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSending || !newMessage.trim()}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close Tracker</button>
        </div>

      </div>
    </div>
  );
}
