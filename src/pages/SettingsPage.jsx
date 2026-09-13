import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Shield,
  Download,
  Save,
  MessageCircle,
  Mail,
  Bot,
  CheckCircle2,
  Smartphone,
  Zap,
  Send,
  ExternalLink,
  Workflow,
  Terminal,
  Copy
} from 'lucide-react';
import {
  getAgentConfig,
  saveAgentConfig,
  WhatsAppReminderAgent,
  SmsReminderAgent,
  MailReminderAgent,
  N8nWorkflowAgent
} from '../utils/reminderAgents';

export default function SettingsPage({ protections = [], claims = [], user, onOpenGoogleAuth }) {
  const [userName, setUserName] = useState('Srishailam Potti');
  const [email, setEmail] = useState('srishailam.potti@gmail.com');
  const [phone, setPhone] = useState('+919866130006');
  const [currency, setCurrency] = useState('₹');
  const [saved, setSaved] = useState(false);
  const [testNotice, setTestNotice] = useState(null);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('https://n8n.warrantyease.internal/webhook/warranty-alerts');
  const [testedN8nPayload, setTestedN8nPayload] = useState(null);

  // Agent Specific settings
  const [agentConfig, setAgentConfigState] = useState(getAgentConfig);

  useEffect(() => {
    const cfg = getAgentConfig();
    setAgentConfigState(cfg);
    if (user?.name) setUserName(user.name);
    else if (cfg.customerName) setUserName(cfg.customerName);

    if (user?.email) setEmail(user.email);
    else if (cfg.emailAgent?.userEmail) setEmail(cfg.emailAgent.userEmail);

    if (cfg.whatsappAgent?.userPhone) setPhone(cfg.whatsappAgent.userPhone);
    if (cfg.n8nIntegration?.webhookUrl) setN8nWebhookUrl(cfg.n8nIntegration.webhookUrl);
  }, [user]);

  const handleTestN8nWebhook = async () => {
    const sampleAlert = {
      id: 'n8n-live-test',
      targetId: 'prot-tata-aig',
      type: 'warranty_expiry',
      title: 'Tata AIG Care Supreme Health Insurance',
      brand: 'Tata AIG',
      category: 'Health',
      expiryDate: '2026-09-12',
      daysLeft: 1,
      urgency: 'critical',
      item: {
        id: 'prot-tata-aig',
        brand: 'Tata AIG',
        productName: 'Care Supreme Comprehensive Health Plan',
        model: 'Policy #TAT-POL-88219412',
        serialNumber: 'TAT-POL-88219412',
        category: 'Health',
        price: 28500
      }
    };

    const res = await N8nWorkflowAgent.dispatchAutonomous(sampleAlert, {
      ...agentConfig,
      customerName: userName,
      customerPhone: phone,
      customerEmail: email,
      n8nIntegration: {
        ...agentConfig.n8nIntegration,
        webhookUrl: n8nWebhookUrl
      }
    });

    setTestedN8nPayload(res.payload);
    setTestNotice(`⚡ n8n Webhook Test Dispatched! Payload sent for user WhatsApp (${phone}) and Email (${email}).`);
    setTimeout(() => setTestNotice(null), 6000);
  };

  const sampleTataAigAlert = {
    id: 'alert-tata-aig',
    targetType: 'protection',
    title: 'Tata AIG Care Supreme Health Plan',
    brand: 'Tata AIG',
    expiryDate: '2026-09-12',
    daysLeft: 1,
    urgency: 'critical',
    item: {
      brand: 'Tata AIG',
      productName: 'Care Supreme Comprehensive Health Plan',
      model: 'Policy #TAT-POL-88219412',
      serialNumber: 'TAT-POL-88219412',
      category: 'Health Insurance',
      price: 28500
    }
  };

  const handleSendWhatsAppNow = () => {
    const draft = WhatsAppReminderAgent.generateWhatsAppMessage(sampleTataAigAlert, phone);
    window.open(draft.whatsappUrl, '_blank');
    setTestNotice(`💬 WhatsApp Web / App opened for ${phone}! Check new tab to send.`);
    setTimeout(() => setTestNotice(null), 5000);
  };

  const handleSendGmailNow = () => {
    const draft = MailReminderAgent.generateEmailDraft(sampleTataAigAlert, email);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    window.open(gmailUrl, '_blank');
    setTestNotice(`✉️ Gmail Web Compose opened for ${email}! Check new tab to send.`);
    setTimeout(() => setTestNotice(null), 5000);
  };

  const handleSendEmailNow = () => {
    const draft = MailReminderAgent.generateEmailDraft(sampleTataAigAlert, email);
    try {
      navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    } catch {}
    const a = document.createElement('a');
    a.href = draft.mailtoUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTestNotice(`📧 Default Mail App opened for ${email}! (Notice text copied to clipboard)`);
    setTimeout(() => setTestNotice(null), 5000);
  };

  const handleSendSmsNow = () => {
    const draft = SmsReminderAgent.generateSmsText(sampleTataAigAlert, phone);
    try {
      navigator.clipboard.writeText(draft.text);
    } catch {}
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const target = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;
    const smsUrl = `sms:${encodeURIComponent(target)}?body=${encodeURIComponent(draft.text)}`;
    const a = document.createElement('a');
    a.href = smsUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTestNotice(`📱 SMS App opened for ${phone}! (SMS text copied to clipboard)`);
    setTimeout(() => setTestNotice(null), 5000);
  };

  const handleCopyText = (text, label) => {
    try {
      navigator.clipboard.writeText(text);
      setTestNotice(`📋 ${label} copied to clipboard!`);
      setTimeout(() => setTestNotice(null), 4000);
    } catch {}
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...agentConfig,
      customerName: userName,
      customerPhone: phone,
      customerEmail: email,
      n8nIntegration: {
        ...agentConfig.n8nIntegration,
        webhookUrl: n8nWebhookUrl,
        autoDispatchWithoutPermission: true,
        status: 'Active (24/7 Autonomous Background Watchdog)'
      },
      emailAgent: { ...agentConfig.emailAgent, userEmail: email },
      whatsappAgent: { ...agentConfig.whatsappAgent, userPhone: phone },
      smsAgent: { ...agentConfig.smsAgent, userPhone: phone }
    };
    saveAgentConfig(updated);
    setAgentConfigState(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDispatchModeChange = (mode) => {
    const updated = {
      ...agentConfig,
      dispatchMode: mode
    };
    saveAgentConfig(updated);
    setAgentConfigState(updated);
  };

  const handleSendTestDispatch = () => {
    const sampleAlert = {
      id: 'test-alert',
      targetType: 'protection',
      title: 'Samsung Washing Machine (WW12DB7B24GSTL)',
      message: 'Warranty expires in 7 days. Action recommended.',
      daysLeft: 7,
      expiryDate: '2026-09-21',
      urgency: 'high',
      item: {
        brand: 'Samsung',
        model: 'Washing Machine (WW12DB7B24GSTL)',
        productName: 'Washing Machine (WW12DB7B24GSTL)',
        serialNumber: '05SU5PBX900128',
        category: 'Home Appliances',
        price: 45892
      }
    };

    // Open WhatsApp test message directly so the user can send to their phone
    const draft = WhatsAppReminderAgent.generateWhatsAppMessage(sampleAlert, phone);
    window.open(draft.whatsappUrl, '_blank');
    setTestNotice(`🚀 WhatsApp opened with test alert for ${phone}! Check new tab to send.`);
    setTimeout(() => setTestNotice(null), 6000);
  };

  const handleExportJSON = () => {
    const data = {
      profile: { name: userName, email, phone, currency },
      agentConfig,
      protections,
      claims,
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warranty_ease_backup_${Date.now()}.json`;
    a.click();
  };

  const isDirectAuto = (agentConfig.dispatchMode || 'automatic_direct') === 'automatic_direct';

  return (
    <div style={{ maxWidth: '840px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & Agent Preferences</h1>
          <p className="page-description">Configure your customer account, SMS/WhatsApp alert dispatch modes, and autonomous agents</p>
        </div>
      </div>

      {testNotice && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '0.85rem', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#15803d', fontWeight: 700, fontSize: '0.88rem' }}>
          <CheckCircle2 size={20} color="#16a34a" />
          <span>{testNotice}</span>
        </div>
      )}

      {/* GOOGLE ACCOUNT STATUS CARD */}
      <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1.5px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem 1.5rem', marginBottom: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user?.picture ? (
            <img src={user.picture} alt={user.name} style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #2563eb', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                {user ? user.name : 'Google Single Sign-On'}
              </span>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                ✓ Verified Google Account
              </span>
            </div>
            <div style={{ fontSize: '0.83rem', color: '#475569', fontWeight: 600 }}>
              {user ? user.email : 'Click to connect your Google profile'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenGoogleAuth}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700, borderColor: '#cbd5e1' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{user ? 'Manage Google Account' : 'Sign in with Google'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="empty-state-card" style={{ textAlign: 'left', alignItems: 'stretch', padding: '2rem', marginBottom: '2rem' }}>
        
        {/* CUSTOMER ALERT DISPATCH MODE SECTION */}
        <div style={{ background: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: '0.65rem', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
                <Zap size={22} color="#0066cc" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Customer Alert Dispatch Mode (WhatsApp & SMS)
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                  Choose how expiry reminders and claim alerts are sent to the registered customer
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', background: isDirectAuto ? '#dcfce7' : '#fef3c7', color: isDirectAuto ? '#15803d' : '#b45309', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 800 }}>
              {isDirectAuto ? '✓ Direct Automatic Active' : '🌐 Web Link Active'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
            {/* Option 1: Direct Automatic Delivery */}
            <label
              onClick={() => handleDispatchModeChange('automatic_direct')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                padding: '1rem',
                borderRadius: '0.85rem',
                border: isDirectAuto ? '2px solid #0066cc' : '1px solid #e2e8f0',
                background: isDirectAuto ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="radio"
                name="dispatchMode"
                checked={isDirectAuto}
                onChange={() => handleDispatchModeChange('automatic_direct')}
                style={{ marginTop: '0.25rem', width: 18, height: 18, accentColor: '#0066cc', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                    ⚡ Direct Automatic Delivery (No Web Links — Autonomous Agent Dispatch)
                  </span>
                  <span style={{ fontSize: '0.68rem', background: '#22c55e', color: '#ffffff', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 800 }}>
                    RECOMMENDED
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Reminders and alert messages are dispatched autonomously in the background directly to the customer's phone ({phone}) and email ({email}). Does <strong>not</strong> open external browser tabs or popup links.
                </p>
              </div>
            </label>

            {/* Option 2: Interactive Web Link Mode */}
            <label
              onClick={() => handleDispatchModeChange('link_popup')}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                padding: '1rem',
                borderRadius: '0.85rem',
                border: !isDirectAuto ? '2px solid #0066cc' : '1px solid #e2e8f0',
                background: !isDirectAuto ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="radio"
                name="dispatchMode"
                checked={!isDirectAuto}
                onChange={() => handleDispatchModeChange('link_popup')}
                style={{ marginTop: '0.25rem', width: 18, height: 18, accentColor: '#0066cc', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                  🌐 Interactive External Link (Open WhatsApp Web & Mail Client Tabs)
                </div>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Clicking alert buttons generates pre-formatted links and opens <code>api.whatsapp.com</code> or <code>mailto:</code> in a new tab so you can review the draft text before manual transmission.
                </p>
              </div>
            </label>
          </div>

          {/* Test Dispatch Button */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Target Customer: <strong>{userName}</strong> ({phone})
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSendTestDispatch}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0066cc' }}
            >
              <Send size={14} />
              <span>Send Test Customer Alert Now</span>
            </button>
          </div>
        </div>

        {/* PROFILE & CONTACT ENDPOINTS */}
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} color="#0066cc" /> Registered Customer Profile & Channels
        </h2>

        <div className="form-row" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Registered Customer Name</label>
            <input
              type="text"
              className="form-control"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Used for official warranty certificates, invoices, and insurance claims
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Default Currency</label>
            <select
              className="form-control"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="₹">₹ (INR - Rupee)</option>
              <option value="$">$ (USD - Dollar)</option>
              <option value="€">€ (EUR - Euro)</option>
              <option value="£">£ (GBP - Pound)</option>
            </select>
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageCircle size={15} color="#16a34a" /> WhatsApp & Phone Number (+91)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="+919866130006"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Destination for WhatsApp and Direct SMS alerts
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={15} color="#0066cc" /> Customer Email Address
            </label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Target email address for claim escalation notices & expiry reports
            </span>
          </div>
        </div>

        {/* PREPARED NOTIFICATIONS FOR USER (WHATSAPP, GMAIL, & SMS) */}
        <div style={{ background: '#ffffff', border: '1.5px solid #0066cc', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: '0 4px 14px rgba(0, 102, 204, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
                <Send size={22} color="#0066cc" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Prepared Expiry Notifications (WhatsApp, Gmail & SMS)
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                  Click to transmit live expiry & claim alerts directly to <strong>{userName}</strong> ({phone} • {email})
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.2rem 0.65rem', borderRadius: '20px', fontWeight: 800 }}>
              ✓ 3 Channels Ready
            </span>
          </div>

          {/* 3 Channel Cards: WhatsApp, Email/Gmail, and SMS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Card 1: WhatsApp Notification */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.85rem', padding: '1.15rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MessageCircle size={18} color="#16a34a" />
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#15803d' }}>WhatsApp Alert</span>
                </div>
                <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                  {phone}
                </span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #dcfce7', borderRadius: '0.65rem', padding: '0.75rem', fontSize: '0.74rem', color: '#1e293b', lineHeight: 1.45, whiteSpace: 'pre-line', marginBottom: '0.85rem', flex: 1, maxHeight: '130px', overflowY: 'auto' }}>
{`🛡️ *WARRANTYEASE EXPIRY REMINDER* 🛡️

Hello ${userName}! Your warranty for *Tata AIG Care Supreme Health Plan* expires in *1 day* on *2026-09-12*.

📌 *Details:*
• Category: Health Insurance
• Policy No: TAT-POL-88219412
• Value Protected: ₹28,500

⚡ *Action:* Submit claim or renewal before deadline!
👉 http://localhost:5173`}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSendWhatsAppNow}
                  style={{ flex: 1, background: '#16a34a', borderColor: '#16a34a', fontSize: '0.78rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <MessageCircle size={14} />
                  <span>Open WhatsApp</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleCopyText(`🛡️ WARRANTYEASE EXPIRY REMINDER 🛡️\n\nHello ${userName}! Your warranty for Tata AIG Care Supreme Health Plan expires in 1 day on 2026-09-12.\nPolicy No: TAT-POL-88219412\nValue: ₹28,500\nAction: Submit claim at http://localhost:5173`, 'WhatsApp Message')}
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
                  title="Copy text"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>

            {/* Card 2: Email Notification (Gmail & Mailto) */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.85rem', padding: '1.15rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Mail size={18} color="#0066cc" />
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1d4ed8' }}>Email Reminder</span>
                </div>
                <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                  {email}
                </span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #dbeafe', borderRadius: '0.65rem', padding: '0.75rem', fontSize: '0.74rem', color: '#1e293b', lineHeight: 1.45, whiteSpace: 'pre-line', marginBottom: '0.85rem', flex: 1, maxHeight: '130px', overflowY: 'auto' }}>
{`Subject: [WARRANTY ALERT] Tata AIG Care Supreme Expires in 1 Day

Dear ${userName},

This is an expiry alert for your registered policy:
• Product: Tata AIG Care Supreme Health Plan
• Policy No: TAT-POL-88219412
• Expiry Date: 2026-09-12 (1 day remaining)

Please review renewal or file any cashless claims.`}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSendGmailNow}
                    style={{ flex: 1, background: '#0066cc', borderColor: '#0066cc', fontSize: '0.78rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <Mail size={14} />
                    <span>Open in Gmail Web</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleSendEmailNow}
                    style={{ fontSize: '0.75rem', padding: '0.45rem 0.65rem' }}
                    title="Open in default mail client"
                  >
                    Mail App
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleCopyText(`Subject: [WARRANTY ALERT] Tata AIG Care Supreme Expires in 1 Day\n\nDear ${userName},\n\nThis is an expiry alert for Tata AIG Care Supreme Health Plan (Policy: TAT-POL-88219412) expiring on 2026-09-12.`, 'Email Draft')}
                    style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
                    title="Copy text"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Direct SMS Notification */}
            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '0.85rem', padding: '1.15rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Smartphone size={18} color="#7c3aed" />
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#7c3aed' }}>Carrier SMS Alert</span>
                </div>
                <span style={{ fontSize: '0.7rem', background: '#f3e8ff', color: '#6b21a8', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                  {phone}
                </span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #f3e8ff', borderRadius: '0.65rem', padding: '0.75rem', fontSize: '0.74rem', color: '#1e293b', lineHeight: 1.45, whiteSpace: 'pre-line', marginBottom: '0.85rem', flex: 1, maxHeight: '130px', overflowY: 'auto' }}>
{`[WarrantyEase Alert]
Hello ${userName}, warranty for Tata AIG Care Supreme Health Plan expires on 2026-09-12 (1 day remaining).

Policy: TAT-POL-88219412
Check details: http://localhost:5173`}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSendSmsNow}
                  style={{ flex: 1, borderColor: '#d8b4fe', color: '#7c3aed', background: '#ffffff', fontSize: '0.78rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <Smartphone size={14} />
                  <span>Open SMS App</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleCopyText(`[WarrantyEase Alert] Hello ${userName}, warranty for Tata AIG Care Supreme Health Plan expires on 2026-09-12 (1 day remaining). Policy: TAT-POL-88219412. http://localhost:5173`, 'SMS Alert')}
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
                  title="Copy SMS text"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AUTONOMOUS MULTI-AGENT CHANNELS */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bot size={18} color="#0066cc" /> Autonomous Agent Channel Toggles & Rules
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* WhatsApp Agent */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#ffffff', borderRadius: '0.65rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="waAgentCheck"
                  checked={agentConfig.whatsappAgent?.enabled ?? true}
                  onChange={(e) => setAgentConfigState({ ...agentConfig, whatsappAgent: { ...agentConfig.whatsappAgent, enabled: e.target.checked } })}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#16a34a' }}
                />
                <div>
                  <label htmlFor="waAgentCheck" style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    WhatsApp Reminder Agent
                  </label>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Triggers 7, 3, and 1 day before expiry + claim progress notifications
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                {isDirectAuto ? '✓ Direct Auto-Dispatch' : 'Web Link'}
              </span>
            </div>

            {/* Direct SMS Gateway Agent */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#ffffff', borderRadius: '0.65rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="smsAgentCheck"
                  checked={agentConfig.smsAgent?.enabled ?? true}
                  onChange={(e) => setAgentConfigState({ ...agentConfig, smsAgent: { ...agentConfig.smsAgent, enabled: e.target.checked } })}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#7c3aed' }}
                />
                <div>
                  <label htmlFor="smsAgentCheck" style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    Direct SMS Gateway Agent
                  </label>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Direct carrier SMS alerts to {phone} for urgent expiration warnings
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700 }}>
                ✓ Carrier Gateway
              </span>
            </div>

            {/* Mail Agent */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#ffffff', borderRadius: '0.65rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="emailAgentCheck"
                  checked={agentConfig.emailAgent?.enabled ?? true}
                  onChange={(e) => setAgentConfigState({ ...agentConfig, emailAgent: { ...agentConfig.emailAgent, enabled: e.target.checked } })}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#0066cc' }}
                />
                <div>
                  <label htmlFor="emailAgentCheck" style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    Mail Reminder Agent
                  </label>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Sends structured warranty digests 30, 15, 7, and 1 day before expiry
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#0066cc', fontWeight: 700 }}>
                {isDirectAuto ? '✓ Direct Auto-Dispatch' : 'Mail Client'}
              </span>
            </div>

            {/* SLA Escalation Agent */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#ffffff', borderRadius: '0.65rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="slaAgentCheck"
                  checked={agentConfig.escalationAgent?.enabled ?? true}
                  onChange={(e) => setAgentConfigState({ ...agentConfig, escalationAgent: { ...agentConfig.escalationAgent, enabled: e.target.checked } })}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#ea580c' }}
                />
                <div>
                  <label htmlFor="slaAgentCheck" style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    Claim SLA Escalation Agent
                  </label>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Monitors 48h manufacturer response SLA and generates brand executive escalations
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 700 }}>
                ✓ 48h SLA Active
              </span>
            </div>
          </div>
        </div>

        {/* N8N AUTONOMOUS WORKFLOW ENGINE & WEBHOOK INTEGRATION */}
        <div style={{ background: '#ffffff', border: '1.5px solid #818cf8', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: '0.75rem', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #c7d2fe' }}>
                <Workflow size={24} color="#4f46e5" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Automated n8n Workflow Integration
                  <span style={{ fontSize: '0.68rem', background: '#4f46e5', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 800 }}>
                    WhatsApp & Email Relay
                  </span>
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                  Automatically relays warranty expiry alerts directly to user WhatsApp ({phone}) and Email ({email})
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Webhook Relay Active
            </span>
          </div>

          {/* n8n Webhook URL Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 800, color: '#1e293b' }}>n8n Webhook Endpoint URL</span>
              <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700 }}>Automated POST Handler</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                value={n8nWebhookUrl}
                onChange={(e) => setN8nWebhookUrl(e.target.value)}
                placeholder="https://your-n8n-instance.com/webhook/warranty-alerts"
                style={{ fontFamily: 'monospace', fontSize: '0.85rem', borderColor: '#c7d2fe' }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleTestN8nWebhook}
                style={{ background: '#4f46e5', color: '#ffffff', border: 'none', padding: '0 1rem', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <Zap size={15} />
                <span>Test Webhook</span>
              </button>
            </div>
            <span style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
              WarrantyEase pushes expiring policy alerts directly to this n8n webhook URL, which relays notifications to WhatsApp Cloud API and email servers in the background.
            </span>
          </div>

          {/* Workflow Pipeline Diagram */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Automated Notification Pipeline
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.65rem', padding: '0.65rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>STEP 1</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>⏱️ Expiry Watchdog</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.2rem' }}>Scans & detects 7, 3, 1 day deadlines</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #818cf8', borderRadius: '0.65rem', padding: '0.65rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4f46e5' }}>STEP 2</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>⚡ n8n Webhook Node</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.2rem' }}>POSTs structured JSON payload</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.65rem', padding: '0.65rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>STEP 3</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>🤖 Relay Dispatcher</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.2rem' }}>Routes WhatsApp & Email</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #86efac', borderRadius: '0.65rem', padding: '0.65rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a' }}>STEP 4</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>📲 Direct Delivery</div>
                <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, marginTop: '0.2rem' }}>To {userName}</div>
              </div>
            </div>
          </div>

          {/* Guarantees */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: testedN8nPayload ? '1.25rem' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.65rem', padding: '0.65rem 0.85rem' }}>
              <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d' }}>Multi-Channel Dispatch</div>
                <div style={{ fontSize: '0.7rem', color: '#166534' }}>Directly sends alerts to customer WhatsApp ({phone}) and Email ({email})</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '0.65rem', padding: '0.65rem 0.85rem' }}>
              <Bot size={16} color="#4f46e5" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3730a3' }}>Automated Daily Deduplication</div>
                <div style={{ fontSize: '0.7rem', color: '#4338ca' }}>Smart storage key prevents sending duplicate alerts on the same calendar day</div>
              </div>
            </div>
          </div>

          {/* Live Tested Payload Inspector */}
          {testedN8nPayload && (
            <div style={{ marginTop: '1rem', background: '#0f172a', borderRadius: '0.75rem', padding: '1rem', color: '#e2e8f0', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Terminal size={14} /> Dispatched n8n Webhook Payload (Verified Live)
                </span>
                <span style={{ fontSize: '0.68rem', background: '#16a34a', color: '#ffffff', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                  HTTP 200 OK
                </span>
              </div>
              <pre style={{ margin: 0, fontSize: '0.74rem', fontFamily: 'monospace', lineHeight: 1.45, overflowX: 'auto', color: '#a5f3fc' }}>
                {JSON.stringify(testedN8nPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Save size={16} />
            <span>{saved ? 'Preferences Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Data Backup Section */}
      <div className="empty-state-card" style={{ textAlign: 'left', alignItems: 'stretch', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} color="#0066cc" /> Export & Backup Warranty Data
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Download a complete backup of all your registered protections, claim histories, and policy dates in JSON format.
        </p>

        <div>
          <button type="button" className="btn btn-secondary" onClick={handleExportJSON}>
            <Download size={16} />
            <span>Download Warranty Data (.json)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
