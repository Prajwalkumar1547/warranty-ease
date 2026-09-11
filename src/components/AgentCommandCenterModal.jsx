import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Mail,
  MessageCircle,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Send,
  Sliders,
  History,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Trash2,
  Smartphone
} from 'lucide-react';
import {
  scanProtectionsAndClaims,
  MailReminderAgent,
  WhatsAppReminderAgent,
  SmsReminderAgent,
  ClaimEscalationAgent,
  getAgentConfig,
  saveAgentConfig,
  getAgentHistory,
  recordAgentAction
} from '../utils/reminderAgents';
import BrandLogo from './BrandLogo';

export default function AgentCommandCenterModal({
  isOpen,
  onClose,
  protections = [],
  claims = []
}) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'agents' | 'history' | 'settings'
  const [config, setConfig] = useState(getAgentConfig);
  const [history, setHistory] = useState(getAgentHistory);
  const [isScanning, setIsScanning] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  // Scan live alerts
  const alerts = scanProtectionsAndClaims(protections, claims);

  useEffect(() => {
    if (isOpen) {
      setConfig(getAgentConfig());
      setHistory(getAgentHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showFeedback = (msg) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleScanNow = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHistory(getAgentHistory());
      showFeedback(`Agent scan complete! Found ${alerts.length} upcoming action items.`);
    }, 600);
  };

  const handleDispatchMail = (alert) => {
    const res = MailReminderAgent.dispatch(alert, config.emailAgent?.userEmail, config);
    setHistory(getAgentHistory());
    showFeedback(res.dispatchedDirect
      ? `✅ Direct Email alert sent automatically to ${res.recipient}!`
      : `Mail draft opened for "${alert.title}"`
    );
  };

  const handleDispatchWhatsApp = (alert) => {
    const res = WhatsAppReminderAgent.dispatch(alert, config.whatsappAgent?.userPhone, config);
    setHistory(getAgentHistory());
    showFeedback(res.dispatchedDirect
      ? `✅ Direct WhatsApp alert delivered automatically to +${res.phone}!`
      : `WhatsApp notification dispatched for "${alert.title}"`
    );
  };

  const handleDispatchSms = (alert) => {
    const res = SmsReminderAgent.dispatch(alert, config.smsAgent?.userPhone || config.customerPhone, config);
    setHistory(getAgentHistory());
    showFeedback(`✅ Direct Carrier SMS delivered automatically to +${res.phone}!`);
  };

  const handleDispatchCalendar = (alert) => {
    ClaimEscalationAgent.dispatchCalendar(alert);
    setHistory(getAgentHistory());
    showFeedback(`Calendar reminder (.ics) downloaded for "${alert.title}"`);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveAgentConfig(config);
    showFeedback('Agent configuration saved successfully!');
  };

  const handleClearHistory = () => {
    localStorage.removeItem('warranty_ease_agent_history');
    setHistory([]);
    showFeedback('Agent dispatch history cleared.');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '0.65rem', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
              <Bot size={22} color="#0066cc" />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>AI Reminder Agents Command Center</h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Autonomous Email, WhatsApp & Escalation reminder bots monitoring warranties & claims
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackNotice && (
          <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '0.5rem 1.25rem', color: '#15803d', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} />
            <span>{feedbackNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.5rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-secondary ${activeTab === 'queue' ? 'btn-primary' : ''}`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setActiveTab('queue')}
            >
              <Clock size={14} />
              <span>Reminder Queue ({alerts.length})</span>
            </button>

            <button
              type="button"
              className={`btn btn-secondary ${activeTab === 'agents' ? 'btn-primary' : ''}`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setActiveTab('agents')}
            >
              <Bot size={14} />
              <span>Active Agents (3)</span>
            </button>

            <button
              type="button"
              className={`btn btn-secondary ${activeTab === 'history' ? 'btn-primary' : ''}`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} />
              <span>Dispatch Logs ({history.length})</span>
            </button>

            <button
              type="button"
              className={`btn btn-secondary ${activeTab === 'settings' ? 'btn-primary' : ''}`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setActiveTab('settings')}
            >
              <Sliders size={14} />
              <span>Configure Channels</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={handleScanNow}
            disabled={isScanning}
          >
            <RefreshCw size={13} className={isScanning ? 'spin-animation' : ''} />
            <span>Scan Now</span>
          </button>
        </div>

        <div className="modal-body" style={{ minHeight: '380px', maxHeight: '520px', overflowY: 'auto' }}>
          {/* TAB 1: UPCOMING REMINDER QUEUE */}
          {activeTab === 'queue' && (
            <div>
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>All Clear! No Impending Deadlines</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '380px', margin: '0 auto' }}>
                    All your registered warranties are safely within coverage and no claims have exceeded standard 48h SLA response times.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {alerts.map((alert) => {
                    const isCritical = alert.urgency === 'critical';
                    const isHigh = alert.urgency === 'high';
                    const badgeBg = isCritical ? '#fef2f2' : isHigh ? '#fff7ed' : '#eff6ff';
                    const badgeColor = isCritical ? '#dc2626' : isHigh ? '#ea580c' : '#0066cc';

                    return (
                      <div
                        key={alert.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '0.85rem',
                          border: isCritical ? '1px solid #fecaca' : '1px solid #e2e8f0',
                          padding: '1rem',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <BrandLogo brand={alert.brand} size={32} />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{alert.title}</strong>
                                <span style={{ background: badgeBg, color: badgeColor, fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                  {alert.urgency.toUpperCase()}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                                {alert.message}
                              </p>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: badgeColor }}>
                              {alert.daysLeft < 0 ? 'EXPIRED' : `${alert.daysLeft}d remaining`}
                            </span>
                            {alert.expiryDate && (
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{alert.expiryDate}</div>
                            )}
                          </div>
                        </div>

                        {/* 1-Click Multi-Agent Dispatch Bar */}
                        <div style={{ background: '#f8fafc', borderRadius: '0.6rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', border: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Bot size={13} color="#0066cc" /> Trigger Autonomous Reminder:
                          </span>

                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => handleDispatchMail(alert)}
                              title="Send pre-filled email draft to yourself or brand support"
                            >
                              <Mail size={13} color="#0066cc" />
                              <span>Email Agent</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => handleDispatchWhatsApp(alert)}
                              title="Send formatted alert to WhatsApp"
                            >
                              <MessageCircle size={13} color="#16a34a" />
                              <span>WhatsApp Agent</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => handleDispatchSms(alert)}
                              title="Send direct SMS alert via Carrier Gateway"
                            >
                              <Smartphone size={13} color="#7c3aed" />
                              <span>Direct SMS</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => handleDispatchCalendar(alert)}
                              title="Export reminder event into Apple/Google Calendar (.ics)"
                            >
                              <Calendar size={13} color="#af52de" />
                              <span>Calendar .ics</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE AGENTS OVERVIEW */}
          {activeTab === 'agents' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
              {/* Agent 1 */}
              <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '0.65rem', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={22} color="#0066cc" />
                  </div>
                  <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                    🟢 ONLINE
                  </span>
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                  Mail Reminder Agent
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 0.85rem 0' }}>
                  Drafts and dispatches email alerts for upcoming warranty expiries & pending claim updates directly via your email client.
                </p>
                <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#475569' }}>
                  <div><strong>Channel:</strong> SMTP / mailto:</div>
                  <div><strong>Default Recipient:</strong> {config.emailAgent.userEmail}</div>
                  <div><strong>Trigger Lead Time:</strong> 30d, 15d, 7d, 1d</div>
                </div>
              </div>

              {/* Agent 2 */}
              <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '0.65rem', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={22} color="#16a34a" />
                  </div>
                  <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                    🟢 ONLINE
                  </span>
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                  WhatsApp Reminder Agent
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 0.85rem 0' }}>
                  Formats rich WhatsApp push alerts with bolding, claim reference numbers, OTP codes, and 1-tap action deep links.
                </p>
                <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#475569' }}>
                  <div><strong>Channel:</strong> WhatsApp (wa.me)</div>
                  <div><strong>Default Phone:</strong> {config.whatsappAgent.userPhone}</div>
                  <div><strong>Trigger Lead Time:</strong> 7d, 3d, 1d</div>
                </div>
              </div>

              {/* Agent 3 */}
              <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '0.65rem', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={22} color="#af52de" />
                  </div>
                  <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                    🟢 ONLINE
                  </span>
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                  Claim Escalation & Calendar Agent
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 0.85rem 0' }}>
                  Monitors statutory 48h manufacturer SLAs, auto-generates .ics calendar reminders, and drafts statutory consumer notices.
                </p>
                <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#475569' }}>
                  <div><strong>Channel:</strong> iCalendar (.ics) / Escalation</div>
                  <div><strong>SLA Threshold:</strong> 48 Business Hours</div>
                  <div><strong>Integration:</strong> Apple / Google / Outlook</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISPATCH LOGS & HISTORY */}
          {activeTab === 'history' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  Recent Autonomous Actions & Dispatch Logs ({history.length})
                </span>
                {history.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', color: '#dc2626' }}
                    onClick={handleClearHistory}
                  >
                    <Trash2 size={12} />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <History size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.6 }} />
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>No agent actions recorded yet. Trigger an action from the Reminder Queue.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {history.map((h) => (
                    <div
                      key={h.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.65rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {h.channel.includes('WhatsApp') ? (
                          <MessageCircle size={18} color="#16a34a" />
                        ) : h.channel.includes('Email') ? (
                          <Mail size={18} color="#0066cc" />
                        ) : (
                          <Calendar size={18} color="#af52de" />
                        )}
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{h.subject || h.targetTitle}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {h.agentName} • Sent to: <strong>{h.recipient}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                          {h.status}
                        </span>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONFIGURE CHANNELS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={16} color="#0066cc" /> Mail Reminder Agent Settings
                </h4>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Recipient Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={config.emailAgent.userEmail}
                    onChange={(e) => setConfig({ ...config, emailAgent: { ...config.emailAgent, userEmail: e.target.value } })}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>All expiry and claim status notices will be pre-filled to this address.</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageCircle size={16} color="#16a34a" /> WhatsApp Reminder Agent Settings
                </h4>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>WhatsApp Phone Number (With Country Code)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+919876543210"
                    value={config.whatsappAgent.userPhone}
                    onChange={(e) => setConfig({ ...config, whatsappAgent: { ...config.whatsappAgent, userPhone: e.target.value } })}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Used to construct direct wa.me click-to-chat links with rich claim information.</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  Save Agent Settings
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            ⚡ 3 Agents Monitoring {protections.length} Protections & {claims.length} Claims
          </div>
        </div>
      </div>
    </div>
  );
}
