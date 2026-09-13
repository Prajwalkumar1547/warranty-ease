import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Inbox,
  CheckCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function NotificationsPage({ onNavigateToWarranties, onNavigateToClaims }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '0.6rem', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Bell size={18} />
            </div>
            <h1 className="page-title" style={{ margin: 0 }}>Notification Center</h1>
          </div>
          <p className="page-description">
            Real-time status updates, brand messages, and expiry reminder milestones (30d, 7d, 1d)
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleMarkAllRead}
          style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <CheckCheck size={14} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
          <Inbox size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>No Notifications</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>You're all caught up! New claim updates and expiry alerts will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {notifications.map((notif) => {
            const isExpiry = notif.type === 'expiry_reminder';
            const isClaim = notif.type === 'claim_update' || notif.type === 'claim_status';

            return (
              <div
                key={notif.id}
                style={{
                  background: notif.is_read ? '#ffffff' : '#f8fafc',
                  border: `1px solid ${notif.is_read ? '#e2e8f0' : '#bfdbfe'}`,
                  borderRadius: '1rem',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: notif.is_read ? 'none' : '0 2px 8px rgba(37,99,235,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '0.75rem', flexShrink: 0,
                    background: isExpiry ? '#fff7ed' : isClaim ? '#eff6ff' : '#f0fdf4',
                    color: isExpiry ? '#ea580c' : isClaim ? '#2563eb' : '#16a34a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isExpiry ? <Clock size={20} /> : isClaim ? <FileText size={20} /> : <ShieldCheck size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{notif.title}</strong>
                      {!notif.is_read && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb' }} />
                      )}
                    </div>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.83rem', color: '#475569', lineHeight: 1.45 }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {notif.created_at ? new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                </div>

                {notif.link && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => notif.link === 'claims' ? onNavigateToClaims() : onNavigateToWarranties()}
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', flexShrink: 0 }}
                  >
                    <span>View</span>
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
