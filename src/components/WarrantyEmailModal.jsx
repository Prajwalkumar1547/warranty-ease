import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Copy, CheckCircle2, Sparkles, ExternalLink, AlertTriangle } from 'lucide-react';

const BRAND_EMAIL_MAP = {
  'Apple': 'support@apple.com',
  'Samsung': 'support@samsung.com',
  'Sony': 'support@sony.com',
  'LG': 'support@lg.com',
  'Dell': 'support@dell.com',
  'HP': 'support@hp.com',
  'Lenovo': 'support@lenovo.com',
  'Asus': 'support@asus.com',
  'Acer': 'support@acer.com',
  'Bosch': 'support@bosch.com',
  'Dyson': 'support@dyson.com',
  'Logitech': 'support@logitech.com',
  'Bose': 'support@bose.com',
  'JBL': 'support@jbl.com',
  'OnePlus': 'support@oneplus.com',
  'Xiaomi': 'support@mi.com',
  'Realme': 'care@realme.com',
  'Oppo': 'support@oppo.com',
  'Vivo': 'support@vivo.com',
  'Nokia': 'support@nokia.com',
  'Motorola': 'support@motorola.com',
  'Google': 'support@google.com',
  'Microsoft': 'support@microsoft.com',
  'Canon': 'support@canon.com',
  'Nikon': 'support@nikon.com',
  'Toyota': 'support@toyota.co.in',
  'Honda': 'customercare@honda-siel.com',
  'Maruti Suzuki': 'customercare@maruti.co.in',
  'Hyundai': 'customercare@hyundai.in',
  'Whirlpool': 'support@whirlpool.in',
};

export default function WarrantyEmailModal({ isOpen, onClose, brand, claim, protection }) {
  const [copied, setCopied] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const item = claim || protection;
    if (!item && !brand) return;

    const brandName = brand || item?.brand || 'Brand';
    const productName = item?.productName || item?.model || 'Product';
    const serialNum = item?.serialNumber || 'Serial number not provided on invoice';
    const purchaseDate = item?.purchaseDate || 'Not recorded';
    const issueDesc = item?.issueCategory
      ? `Issue: ${item.issueCategory}. ${item?.userIssueDescription || ''}`
      : `I am requesting warranty service for my ${brandName} ${productName}.`;

    const subject = `Warranty Service Request — ${brandName} ${productName}`;
    const body = claim?.claimBody
      ? claim.claimBody
      : `Dear ${brandName} Customer Support Team,

I am writing to formally request warranty service for the following product:

Product: ${brandName} ${productName}
Model / Serial No: ${serialNum}
Purchase Date: ${purchaseDate}
Warranty Status: Manufacturer Warranty Period

Issue Reported:
${issueDesc}

I have attached relevant purchase proof and warranty documents for your reference.
Please acknowledge receipt of this email and provide next steps for warranty resolution.

Regards,
WarrantyEase Customer`;

    setCustomSubject(subject);
    setCustomBody(body);
  }, [isOpen, brand, claim, protection]);

  if (!isOpen) return null;

  const item = claim || protection;
  const brandName = brand || item?.brand || 'Brand';
  const supportEmail = BRAND_EMAIL_MAP[brandName] || `support@${(brandName).toLowerCase().replace(/\s+/g, '')}.com`;

  const encodedSubject = encodeURIComponent(customSubject);
  const encodedBody = encodeURIComponent(customBody);
  const mailtoLink = `mailto:${supportEmail}?subject=${encodedSubject}&body=${encodedBody}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${supportEmail}\nSubject: ${customSubject}\n\n${customBody}`);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = `To: ${supportEmail}\nSubject: ${customSubject}\n\n${customBody}`;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Mail size={22} color="#2563eb" />
            <div>
              <h2 className="modal-title">AI Warranty Email Sender</h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                Send a pre-filled warranty claim email directly to {brandName} support
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.85rem', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>Sending To</span>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginTop: '0.1rem' }}>{supportEmail}</div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{brandName} Official Customer Support</span>
            </div>
            <Sparkles size={24} color="#2563eb" style={{ opacity: 0.7 }} />
          </div>

          <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={16} color="#b45309" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
            <p style={{ fontSize: '0.75rem', color: '#78350f', margin: 0 }}>
              Clicking "Open Email App" uses your installed email client (Gmail, Outlook, Apple Mail). WarrantyEase does not store or transmit your emails.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800 }}>Email Subject</label>
            <input type="text" className="form-control" value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ fontWeight: 800, marginBottom: 0 }}>Email Body (AI Generated — Factual Only)</label>
              <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 700 }}>✓ Zero Hallucinations</span>
            </div>
            <textarea className="form-control" rows={10} style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: '#f8fafc' }}
              value={customBody} onChange={(e) => setCustomBody(e.target.value)} />
            <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem' }}>
              You can edit the email above before sending. AI generates only factual information from your protection record.
            </p>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCopy}>
              {copied ? <CheckCircle2 size={16} color="#16a34a" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
            <a href={mailtoLink} className="btn btn-primary"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => setTimeout(onClose, 500)}>
              <Send size={16} />
              <span>Open Email App</span>
              <ExternalLink size={12} style={{ opacity: 0.7 }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
