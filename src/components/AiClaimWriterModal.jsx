import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Mail,
  AlertTriangle,
  Send,
  Award,
  MessageCircle,
  Sliders,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Smartphone,
  Edit3,
  RotateCcw
} from 'lucide-react';
import { MailReminderAgent, WhatsAppReminderAgent, getAgentConfig } from '../utils/reminderAgents';

const BRAND_SUPPORT_EMAILS = {
  'tata aig': 'healthclaims@tataaig.com',
  'star health': 'support@starhealth.in',
  'hdfc ergo': 'care@hdfcergo.com',
  'care health': 'customerfirst@careinsurance.com',
  'bajaj allianz': 'customercare@bajajallianz.co.in',
  'icici lombard': 'customersupport@icicilombard.com',
  'apple': 'support-in@apple.com',
  'samsung': 'support.india@samsung.com',
  'dell': 'support.india@dell.com',
  'hp': 'support@hp.com',
  'lenovo': 'consumerts@lenovo.com',
  'sony': 'sonyindia.care@ap.sony.com',
  'oneplus': 'onepluscare@oneplus.com',
  'xiaomi': 'service.in@xiaomi.com',
  'lg': 'serviceindia@lge.com',
  'dyson': 'ask@dyson.in',
  'lenskart': 'support@lenskart.com',
  'noise': 'help@gonoise.com',
  'boat': 'info@imaginemarketingindia.com'
};

export default function AiClaimWriterModal({
  isOpen,
  onClose,
  protections = [],
  initialBrand,
  onAddClaim
}) {
  const [step, setStep] = useState(1); // 1: Select Product & Issue, 2: Guided Dynamic Questions, 3: Claim Readiness & Review
  const [selectedProtId, setSelectedProtId] = useState('');
  const [issueCategory, setIssueCategory] = useState('Charging problem');
  const [userRawDescription, setUserRawDescription] = useState('');
  const [claimTone, setClaimTone] = useState('formal'); // 'formal' | 'urgent' | 'legal'
  const [dispatchFeedback, setDispatchFeedback] = useState(null);
  const [submittedClaimResult, setSubmittedClaimResult] = useState(null);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Custom Editable Fields for the Email / Letter
  const [customRecipientEmail, setCustomRecipientEmail] = useState('');
  const [customClaimText, setCustomClaimText] = useState('');
  const [isEditingCustomText, setIsEditingCustomText] = useState(false);

  // Dynamic answers state
  const [answers, setAnswers] = useState({
    whenStarted: 'Yesterday',
    impactDrop: 'No drop or impact',
    screenStatus: 'No display / blank screen',
    powerStatus: 'Does not turn on',
    accessoriesUsed: 'Original manufacturer charger & cables',
    troubleshootingDone: 'Restarted device and tried another electrical outlet',
    urgencyReason: 'Essential device used for daily work & study'
  });

  const activeProtection = protections.find((p) => p.id === selectedProtId) || protections[0] || {
    id: 'prot-default',
    brand: initialBrand || 'Dell',
    productName: 'Inspiron 15 Laptop',
    model: 'Inspiron 15 5000',
    serialNumber: 'SN-DELL-99182',
    purchaseDate: '2025-10-15',
    expiryDate: '2026-10-15',
    price: 64990,
    currency: '₹',
    status: 'Active'
  };

  const isInsurance = Boolean(
    activeProtection.protectionType === 'Insurance' ||
    activeProtection.protectionType === 'Insurance Policy' ||
    ['health', 'insurance', 'life', 'medic', 'vehicle', 'policy', 'tata aig', 'star health', 'hdfc ergo', 'care', 'niva', 'bupa', 'bajaj allianz', 'icici lombard'].some(c =>
      (activeProtection.category || '').toLowerCase().includes(c) ||
      (activeProtection.brand || '').toLowerCase().includes(c) ||
      (activeProtection.productName || '').toLowerCase().includes(c) ||
      (activeProtection.model || '').toLowerCase().includes(c)
    )
  );

  const GADGET_CATEGORIES = [
    'Product not working',
    'Charging problem',
    'Battery problem',
    'Display problem',
    'Physical damage',
    'Overheating',
    'Software problem',
    'Audio problem',
    'Performance problem',
    'Other'
  ];

  const INSURANCE_CATEGORIES = [
    'Cashless Hospitalization',
    'Medical Bills & Pharmacy',
    'OPD & Doctor Consultation',
    'Surgery & Daycare Procedure',
    'Diagnostic Tests & Scans',
    'Accident & Collision Repair',
    'Theft, Burglary or Loss',
    'Emergency Injury Treatment',
    'Critical Illness Benefit',
    'Other Medical / Insurance'
  ];

  const issueCategories = isInsurance ? INSURANCE_CATEGORIES : GADGET_CATEGORIES;

  // Auto-switch category when protection item changes
  React.useEffect(() => {
    if (isInsurance && GADGET_CATEGORIES.includes(issueCategory)) {
      setIssueCategory('Cashless Hospitalization');
    } else if (!isInsurance && INSURANCE_CATEGORIES.includes(issueCategory)) {
      setIssueCategory('Product not working');
    }
  }, [selectedProtId, isInsurance]);

  if (!isOpen) return null;

  // Dynamic Category-Aware Question Definitions
  const getQuestionsForCategory = () => {
    if (isInsurance) {
      return [
        {
          key: 'hospitalFacility',
          label: 'Hospital / Treatment Facility',
          options: [
            'Apollo Hospitals (Network Hospital)',
            'Fortis Healthcare',
            'Max Healthcare / Manipal',
            'City Multi-Specialty Hospital',
            'Authorized Network Garage / Workshop',
            'Local Registered Clinic'
          ]
        },
        {
          key: 'admissionType',
          label: 'Type of Medical / Insurance Event',
          options: [
            'Emergency Inpatient Hospitalization (IPD)',
            'Planned Inpatient Surgery / Treatment',
            'Daycare Procedure (< 24 Hours)',
            'Outpatient Consultation & Pharmacy (OPD)',
            'Accidental Trauma / Road Emergency'
          ]
        },
        {
          key: 'billStatus',
          label: 'Bills & Discharge Summary Status',
          options: [
            'All original bills, receipts & discharge summary available',
            'Hospital bills paid; awaiting final pharmacy receipts',
            'Cashless pre-authorization request submitted to hospital desk'
          ]
        },
        {
          key: 'claimedAmountRange',
          label: 'Total Claimed Amount (Approx)',
          options: [
            'Under ₹25,000',
            '₹25,000 to ₹50,000',
            '₹50,000 to ₹1,00,000',
            'Above ₹1,00,000'
          ]
        }
      ];
    }

    switch (issueCategory) {
      case 'Display problem':
      case 'Physical damage':
        return [
          {
            key: 'screenStatus',
            label: 'Display condition',
            options: ['Blank screen / no signal', 'Lines across display', 'Flickering display', 'Cracked glass / shattered', 'Touch unresponsive']
          },
          {
            key: 'impactDrop',
            label: 'Was there accidental physical impact?',
            options: ['No drop or impact (occurred during normal use)', 'Minor accidental bump', 'Sudden display failure while powered on']
          },
          {
            key: 'troubleshootingDone',
            label: 'Troubleshooting attempted',
            options: ['Power cycled device', 'Connected to external monitor', 'Cleaned screen surface gently']
          }
        ];
      case 'Battery problem':
      case 'Charging problem':
        return [
          {
            key: 'powerStatus',
            label: 'Device charging behavior',
            options: ['Does not turn on / charge at all', 'Charges intermittently', 'Battery drains abnormally fast', 'Heats up during charging']
          },
          {
            key: 'accessoriesUsed',
            label: 'Charger & adapter used',
            options: ['Original manufacturer charger & cables', 'Certified OEM replacement', 'Tested on multiple power sockets']
          },
          {
            key: 'troubleshootingDone',
            label: 'Troubleshooting attempted',
            options: ['Tried multiple electrical outlets', 'Inspected charging port for debris', 'Reset power cycle']
          }
        ];
      case 'Overheating':
      case 'Performance problem':
      case 'Software problem':
        return [
          {
            key: 'powerStatus',
            label: 'System behavior',
            options: ['Freezes / restarts automatically', 'Fan runs at loud maximum speed', 'Error codes appear on screen', 'Apps crash repeatedly']
          },
          {
            key: 'troubleshootingDone',
            label: 'Troubleshooting attempted',
            options: ['Rebooted in safe mode', 'Cleared cache & updated firmware', 'Checked ventilation & cooling']
          }
        ];
      default:
        return [
          {
            key: 'powerStatus',
            label: 'Current product state',
            options: ['Completely unresponsive', 'Partially operational with defects', 'Unusual noise / behavior']
          },
          {
            key: 'accessoriesUsed',
            label: 'Accessories tested',
            options: ['Original manufacturer accessories', 'Standard verified cables']
          },
          {
            key: 'troubleshootingDone',
            label: 'Troubleshooting steps',
            options: ['Power cycled according to user manual', 'Checked connections & power source']
          }
        ];
    }
  };

  const dynamicQuestions = getQuestionsForCategory();

  // Calculate Readiness Score (0 - 100%)
  const calculateReadinessScore = () => {
    let score = 0;
    const checklist = [];

    if (activeProtection.brand && (activeProtection.productName || activeProtection.model)) {
      score += 25;
      checklist.push({ label: isInsurance ? 'Policy / Plan identified' : 'Product identity confirmed', passed: true });
    } else {
      checklist.push({ label: isInsurance ? 'Policy identified' : 'Product identity confirmed', passed: false, tip: 'Select policy from vault' });
    }

    if (activeProtection.serialNumber) {
      score += 25;
      checklist.push({ label: isInsurance ? 'Policy / S/N number verified' : 'Serial number / Tag verified', passed: true });
    } else {
      checklist.push({ label: 'Serial / Policy number verified', passed: false, tip: 'Scan document to verify' });
    }

    if (activeProtection.purchaseDate) {
      score += 20;
      checklist.push({ label: 'Valid coverage / inception date', passed: true });
    }

    if (userRawDescription.trim().length > 10) {
      score += 20;
      checklist.push({ label: isInsurance ? 'Medical / Claim reason provided' : 'Factual issue description provided', passed: true });
    } else {
      checklist.push({ label: 'Claim description provided', passed: false, tip: 'Describe what occurred' });
    }

    if (isInsurance || answers.troubleshootingDone) {
      score += 10;
      checklist.push({ label: isInsurance ? 'Facility & billing status confirmed' : 'Preliminary troubleshooting documented', passed: true });
    }

    return { score, checklist };
  };

  const { score: readinessScore, checklist } = calculateReadinessScore();

  // Generate Tone-Aware Factual Claim Letter
  const generateFactualClaimBody = () => {
    if (isInsurance) {
      const insurerUpper = (activeProtection.brand || 'INSURANCE COMPANY').toUpperCase();
      const policyName = activeProtection.productName || activeProtection.model || 'Health / Insurance Policy';
      const policyNo = activeProtection.serialNumber || 'Recorded in Vault';
      const facility = answers.hospitalFacility || 'Network Healthcare Provider';
      const eventType = answers.admissionType || issueCategory;
      const billState = answers.billStatus || 'Original bills and discharge card ready';
      const approxAmount = answers.claimedAmountRange || (activeProtection.price ? `₹${Number(activeProtection.price).toLocaleString('en-IN')}` : 'As per attached bills');

      let toneSubject = '';
      let toneDirective = '';

      if (claimTone === 'urgent') {
        toneSubject = `PRIORITY HEALTH INSURANCE CLAIM SETTLEMENT (EXPEDITED 48H ESCALATION)`;
        toneDirective = `URGENT RELIEF NOTICE:\n` +
          `Given the emergency medical expenditure incurred, immediate settlement or disbursement to the insured's bank account is requested within 48 business hours as per IRDAI policyholder protection timelines.`;
      } else if (claimTone === 'legal') {
        toneSubject = `FORMAL CLAIM LODGEMENT UNDER IRDAI PROTECTION GUIDELINES`;
        toneDirective = `REGULATORY COMPLIANCE NOTICE:\n` +
          `This claim complies fully with IRDAI (Protection of Policyholders' Interests) Regulations. All relevant hospital records and proof of payment are enclosed. Timely settlement without arbitrary deductions is legally expected.`;
      } else {
        toneSubject = `FORMAL INSURANCE CLAIM APPLICATION FOR CASHLESS / REIMBURSEMENT`;
        toneDirective = `REQUESTED RESOLUTION:\n` +
          `Please process direct reimbursement of the admissible medical / claim amount to the policyholder's bank account on file.`;
      }

      const config = getAgentConfig();
      const insuredName = activeProtection.customerName || activeProtection.policyHolder || config.customerName || 'Policyholder';
      const contactDetails = [config.customerPhone, config.customerEmail].filter(Boolean).join(' • ') || 'Contact on file with Insurer';

      return `${toneSubject}\n` +
        `TO: THE CLAIMS DESK / THIRD-PARTY ADMINISTRATOR (TPA)\n` +
        `COMPANY: ${insurerUpper} GENERAL / HEALTH INSURANCE\n\n` +
        `POLICY & INSURED PARTICULARS:\n` +
        `• Insured Name / Beneficiary: ${insuredName}\n` +
        `• Insurance Plan: ${policyName}\n` +
        `• Policy Number / Member ID: ${policyNo}\n` +
        `• Insurer / TPA: ${activeProtection.brand}\n` +
        `• Policy Validity: Active Coverage (${activeProtection.status || 'Active'})\n\n` +
        `CLAIM PARTICULARS (${issueCategory.toUpperCase()}):\n` +
        `• Facility / Hospital: ${facility}\n` +
        `• Admission / Incident Type: ${eventType}\n` +
        `• Claimed Amount: ${approxAmount}\n` +
        `• Document Readiness: ${billState}\n\n` +
        `STATEMENT OF CLAIM / DIAGNOSIS:\n` +
        `"${userRawDescription || 'Medical treatment / hospitalization was required as advised by attending doctor.'}"\n\n` +
        `ENCLOSED MANDATORY DOCUMENTS:\n` +
        `1. Original Hospital Discharge Summary & Diagnostic Reports\n` +
        `2. Itemized Hospital Bills & Final Payment Receipt\n` +
        `3. Doctor Prescription Slips & Pharmacy Invoices\n` +
        `4. Insured KYC Documents & Bank Cancelled Cheque for Direct NEFT\n\n` +
        `${toneDirective}\n\n` +
        `Respectfully Submitted,\n` +
        `${insuredName}\n` +
        `Contact: ${contactDetails}`;
    }

    const brandUpper = (activeProtection.brand || 'MANUFACTURER').toUpperCase();
    const model = activeProtection.productName || activeProtection.model || 'Product';
    const sn = activeProtection.serialNumber || 'Recorded in WarrantyEase Vault';
    const date = activeProtection.purchaseDate || 'Verified upon purchase';

    let toneHeader = '';
    let toneFooter = '';

    if (claimTone === 'urgent') {
      toneHeader = `PRIORITY WARRANTY ESCALATION — SERVICE LEVEL AGREEMENT (SLA 48H)\nATTN: ${brandUpper} SERVICE HEAD & ESCALATIONS DESK`;
      toneFooter = `URGENCY NOTICE:\n` +
        `This unit is a critical daily necessity (${answers.urgencyReason || 'Daily work / essential utility'}). ` +
        `As per your customer charter and warranty commitments, an authorized technician appointment or service intake is requested within 48 business hours.`;
    } else if (claimTone === 'legal') {
      toneHeader = `FORMAL NOTICE OF DEFECT UNDER STATUTORY WARRANTY\nPURSUANT TO THE CONSUMER PROTECTION ACT & MANUFACTURER TERMS\nTO: ${brandUpper} AUTHORIZED CUSTOMER SERVICE`;
      toneFooter = `STATUTORY CONSUMER COMPLIANCE:\n` +
        `The product was purchased on ${date} and remains within its valid manufacturer warranty period. Under standard consumer protection regulations, ` +
        `the consumer is entitled to prompt resolution via repair or replacement of manufacturing defects without undue delay or unauthorized charges.`;
    } else {
      toneHeader = `WARRANTY SERVICE REQUEST — ${brandUpper} CUSTOMER SUPPORT`;
      toneFooter = `REQUESTED RESOLUTION:\n` +
        `Authorized diagnostic evaluation and prompt warranty repair or replacement in accordance with ${activeProtection.brand} terms.`;
    }

    return `${toneHeader}\n\n` +
      `PRODUCT IDENTIFICATION:\n` +
      `• Brand / Manufacturer: ${activeProtection.brand}\n` +
      `• Product / Model: ${model}\n` +
      `• Serial / Identification No: ${sn}\n` +
      `• Date of Purchase: ${date}\n` +
      `• Current Warranty Status: Active (${activeProtection.status || 'Active'})\n\n` +
      `REPORTED FAULT (${issueCategory.toUpperCase()}):\n` +
      `User Statement: "${userRawDescription || 'Product failed to function correctly during normal usage.'}"\n` +
      `Onset: Problem began ${answers.whenStarted}.\n\n` +
      `DIAGNOSTIC OBSERVATIONS & TROUBLESHOOTING:\n` +
      `- Operating Condition: ${answers.powerStatus || answers.screenStatus || 'Unresponsive'}\n` +
      `- Accessories & Power Setup: ${answers.accessoriesUsed || 'Original accessories'}\n` +
      `- Preliminary Steps Taken: ${answers.troubleshootingDone}\n` +
      `- External Physical State: ${answers.impactDrop || 'Normal wear without physical abuse'}\n\n` +
      `${toneFooter}\n\n` +
      `Respectfully Submitted,\n` +
      `Customer & WarrantyEase Digital Records`;
  };

  const handleFinalSubmitClaim = () => {
    const claimBody = generateFactualClaimBody();
    const newClaim = {
      id: `CLM-${Math.floor(100000 + Math.random() * 900000)}`,
      protectionId: activeProtection.id,
      productName: activeProtection.productName || activeProtection.model,
      brand: activeProtection.brand,
      model: activeProtection.model,
      category: activeProtection.category || (isInsurance ? 'Health' : 'Electronics'),
      protectionType: isInsurance ? 'Insurance' : 'Warranty',
      claimType: isInsurance ? 'Insurance Claim' : 'Warranty Claim',
      serialNumber: activeProtection.serialNumber,
      issueCategory,
      userIssueDescription: userRawDescription,
      hospitalOrWorkshop: answers.hospitalFacility || null,
      claimedAmount: activeProtection.price || 25000,
      preferredResolution: isInsurance ? 'Direct Bank Cash Reimbursement' : 'Authorized Service Center Repair',
      claimSubject: isInsurance
        ? `Insurance Claim – ${activeProtection.brand} ${activeProtection.productName || activeProtection.model} – ${issueCategory}`
        : `Warranty Claim – ${activeProtection.brand} ${activeProtection.productName || activeProtection.model} – ${issueCategory}`,
      claimBody,
      claimReadinessScore: readinessScore,
      claimStatus: 'Submitted',
      repairStatus: isInsurance ? 'TPA Assessment' : 'Not Started',
      deliveryStatus: 'Not Applicable',
      status: 'Submitted',
      claimTone,
      otp: String(Math.floor(1000 + Math.random() * 9000)),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (onAddClaim) onAddClaim(newClaim);
    setSubmittedClaimResult(newClaim);
  };

  const brandKey = (activeProtection.brand || '').toLowerCase().trim();
  const defaultBrandSupportEmail = BRAND_SUPPORT_EMAILS[brandKey] || `support@${brandKey.replace(/\s+/g, '')}.com`;
  const effectiveRecipientEmail = customRecipientEmail.trim() || defaultBrandSupportEmail;

  const getEffectiveClaimBody = () => {
    if (isEditingCustomText && customClaimText) {
      return customClaimText;
    }
    return generateFactualClaimBody();
  };

  const getClaimSubject = () => {
    return isInsurance
      ? `[FORMAL HEALTH CLAIM] ${activeProtection.brand} - Policy #${activeProtection.serialNumber || 'Vault'} - ${issueCategory}`
      : `[WARRANTY CLAIM NOTICE] ${activeProtection.brand} ${activeProtection.productName || activeProtection.model} - S/N: ${activeProtection.serialNumber || 'Vault'}`;
  };

  // 1. Direct Gmail Web Compose: Opens Gmail directly with To, CC, Subject, and Full Body pre-filled!
  const handleDispatchGmail = () => {
    const config = getAgentConfig();
    const userEmail = config.customerEmail || 'srishailam.potti@gmail.com';
    const targetEmail = effectiveRecipientEmail;
    const subject = getClaimSubject();
    const body = getEffectiveClaimBody();

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&cc=${encodeURIComponent(userEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, '_blank');
    setDispatchFeedback({
      type: 'gmail',
      message: `✉️ Gmail Web Compose opened in new tab! Addressed to ${targetEmail} (CC: ${userEmail}). Hit Send in Gmail!`
    });
    setTimeout(() => setDispatchFeedback(null), 8000);
  };

  // 2. Direct Default Mail Client (mailto:): Copies full text to clipboard and triggers system mail client
  const handleDispatchEmailAgent = () => {
    const config = getAgentConfig();
    const userEmail = config.customerEmail || 'srishailam.potti@gmail.com';
    const targetEmail = effectiveRecipientEmail;
    const subject = getClaimSubject();
    const body = getEffectiveClaimBody();

    try {
      navigator.clipboard.writeText(body);
    } catch {}

    const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?cc=${encodeURIComponent(userEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, 1500))}`;

    const a = document.createElement('a');
    a.href = mailtoUrl;
    a.target = '_self';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDispatchFeedback({
      type: 'email',
      message: `📧 Native Mail draft opened for ${targetEmail}! (Full formal letter also copied to clipboard)`
    });
    setTimeout(() => setDispatchFeedback(null), 8000);
  };

  // 3. Direct WhatsApp Dispatch: Opens WhatsApp Web or mobile app with full pre-filled claim text
  const handleDispatchWhatsAppAgent = () => {
    const config = getAgentConfig();
    const userPhone = (config.customerPhone || '+919866130006').replace(/[^0-9]/g, '');
    const cleanPhone = userPhone.startsWith('91') ? userPhone : `91${userPhone}`;
    const summaryText = `🚨 *WARRANTYEASE CLAIM LODGEMENT* 🚨\n\n` +
      `*Claim For:* ${activeProtection.brand} ${activeProtection.productName || activeProtection.model}\n` +
      `*Policy / Serial No:* ${activeProtection.serialNumber || 'Recorded in Vault'}\n` +
      `*Category / Issue:* ${issueCategory}\n` +
      `*Claimant:* ${activeProtection.customerName || activeProtection.policyHolder || config.customerName || 'Policyholder'}${config.customerPhone ? ` (${config.customerPhone})` : ''}\n\n` +
      `*Statement of Claim:*\n"${userRawDescription || 'Claim lodged under active coverage.'}"\n\n` +
      `*Target Support Desk:* ${effectiveRecipientEmail}\n` +
      `*Required Resolution:* 48-Hour SLA intake & assessment.\n` +
      `👉 Track Live in WarrantyEase: http://localhost:5173`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(summaryText)}`;
    window.open(whatsappUrl, '_blank');
    setDispatchFeedback({
      type: 'whatsapp',
      message: `💬 WhatsApp opened for +${cleanPhone}! Hit Send in WhatsApp.`
    });
    setTimeout(() => setDispatchFeedback(null), 8000);
  };

  // 4. Direct SMS App Trigger
  const handleDispatchSmsAgent = () => {
    const config = getAgentConfig();
    const userPhone = (config.customerPhone || '+919866130006').replace(/[^0-9]/g, '');
    const cleanPhone = userPhone.startsWith('91') ? `+${userPhone}` : `+91${userPhone}`;
    const smsText = `[WarrantyEase Claim] ${activeProtection.brand} ${activeProtection.productName || activeProtection.model} - Issue: ${issueCategory}. Policy/SN: ${activeProtection.serialNumber || 'In Vault'}. 48h SLA resolution requested.`;

    try {
      navigator.clipboard.writeText(smsText);
    } catch {}

    const smsUrl = `sms:${encodeURIComponent(cleanPhone)}?body=${encodeURIComponent(smsText)}`;
    const a = document.createElement('a');
    a.href = smsUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDispatchFeedback({
      type: 'sms',
      message: `📱 SMS app opened for ${cleanPhone}! (Summary copied to clipboard)`
    });
    setTimeout(() => setDispatchFeedback(null), 8000);
  };

  // 5. Copy Full Claim Letter to Clipboard
  const handleCopyClaimLetter = () => {
    const body = getEffectiveClaimBody();
    navigator.clipboard.writeText(body);
    setCopiedLetter(true);
    setDispatchFeedback({
      type: 'copy',
      message: '📋 Full claim letter copied to clipboard! Ready to paste into brand support or insurer portal.'
    });
    setTimeout(() => {
      setCopiedLetter(false);
      setDispatchFeedback(null);
    }, 4000);
  };

  const handleResetLetter = () => {
    setIsEditingCustomText(false);
    setCustomClaimText('');
    setDispatchFeedback({
      type: 'reset',
      message: '🔄 Letter reset to AI auto-generated version.'
    });
    setTimeout(() => setDispatchFeedback(null), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={24} color="#0066cc" />
            <div>
              <h2 className="modal-title">AI Claim Assistant & Letter Generator</h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Dynamic issue questionnaires • Adaptive tones • Multi-agent instant dispatch
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {submittedClaimResult ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <CheckCircle2 size={34} color="#16a34a" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.35rem' }}>
                Claim Lodged Successfully!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Claim Reference ID: <strong style={{ color: '#0066cc', fontFamily: 'monospace' }}>{submittedClaimResult.id}</strong> • 48-Hour SLA Tracking Active
              </p>

              {dispatchFeedback && (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '0.65rem', padding: '0.65rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 700, fontSize: '0.82rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>{dispatchFeedback.message}</span>
                </div>
              )}

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '1.15rem', textAlign: 'left', maxWidth: '540px', margin: '0 auto 1.5rem auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Brand & Product:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{submittedClaimResult.brand} {submittedClaimResult.productName}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Target Brand Desk:</span>
                    <div style={{ fontWeight: 800, color: '#0066cc' }}>{effectiveRecipientEmail}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Manufacturer SLA:</span>
                    <div style={{ fontWeight: 800, color: '#15803d' }}>⏱️ 48 Hours Resolution Window</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Delivery / Service OTP:</span>
                    <div style={{ fontWeight: 900, color: '#0066cc', fontSize: '1.1rem', letterSpacing: '2px' }}>{submittedClaimResult.otp}</div>
                  </div>
                </div>
              </div>

              {/* Direct Instant Transmission Buttons on Success Screen */}
              <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDispatchGmail}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', background: '#0066cc', borderColor: '#0066cc' }}
                >
                  <Mail size={15} />
                  <span>Open in Gmail (Send to {effectiveRecipientEmail})</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDispatchEmailAgent}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem' }}
                >
                  <FileText size={15} />
                  <span>Default Mail App</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDispatchWhatsAppAgent}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#16a34a', borderColor: '#bbf7d0' }}
                >
                  <MessageCircle size={15} color="#16a34a" />
                  <span>Send via WhatsApp</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCopyClaimLetter}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem' }}
                >
                  {copiedLetter ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copiedLetter ? 'Copied!' : 'Copy Full Notice'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Select Product & Issue Category */}
              {step === 1 && (
                <div>
                  <div style={{ background: isInsurance ? '#f0fdf4' : '#f2f7fd', borderRadius: '0.85rem', padding: '1rem', border: `1px solid ${isInsurance ? '#bbf7d0' : '#d0e2ff'}`, marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ color: isInsurance ? '#15803d' : '#0066cc', fontWeight: 800, margin: 0 }}>
                        Select Registered Item for Claim *
                      </label>
                      {isInsurance && (
                        <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                          🏥 Health / Insurance Policy Mode
                        </span>
                      )}
                    </div>
                    <select
                      className="form-control"
                      value={selectedProtId}
                      onChange={(e) => setSelectedProtId(e.target.value)}
                    >
                      <option value="">{activeProtection.brand} - {activeProtection.productName || activeProtection.model}</option>
                      {protections.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.brand} - {p.productName || p.model} ({p.category || 'Protection'}) {p.protectionType ? `[${p.protectionType}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">
                      {isInsurance ? 'Claim Type & Event Category *' : 'Issue Category *'}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.5rem' }}>
                      {issueCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`btn ${issueCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ fontSize: '0.78rem', padding: '0.55rem', textAlign: 'center', justifyContent: 'center' }}
                          onClick={() => setIssueCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">
                      {isInsurance
                        ? 'Medical / Incident Summary (Diagnosis, Treatment, Hospitalized Dates) *'
                        : 'Describe What Happened in Plain English *'}
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder={isInsurance
                        ? 'e.g. Admitted to Apollo Hospital on 10th Sept for acute appendicitis surgery. Inpatient stay of 3 days with total hospital bills of ₹42,000.'
                        : 'e.g. Laptop stopped charging yesterday evening. Charger LED does not turn on and battery is at 0%.'
                      }
                      value={userRawDescription}
                      onChange={(e) => {
                        setUserRawDescription(e.target.value);
                        setIsEditingCustomText(false);
                      }}
                    />
                  </div>

                  {/* 1-Click Shortcut: Write & Dispatch Claim Email Immediately */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      💡 In a hurry? Skip questions to view, edit, and send the formal claim email directly.
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ background: '#0066cc', borderColor: '#0066cc', fontSize: '0.82rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => setStep(3)}
                    >
                      <Mail size={15} />
                      <span>⚡ Quick Write & Send Email (Skip to Dispatch)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Guided Dynamic Questionnaire */}
              {step === 2 && (
                <div>
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '0.85rem', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} color="#d97706" />
                    <p style={{ fontSize: '0.78rem', color: '#92400e', margin: 0, fontWeight: 600 }}>
                      AI dynamic diagnostic for <strong>{issueCategory}</strong> on your <strong>{activeProtection.brand} {activeProtection.productName || activeProtection.model}</strong>.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {dynamicQuestions.map((q) => (
                      <div key={q.key} className="form-group" style={{ marginBottom: '0.5rem' }}>
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                          {q.label}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                          {q.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`btn ${answers[q.key] === opt ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem' }}
                              onClick={() => setAnswers({ ...answers, [q.key]: opt })}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <label className="form-label" style={{ fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sliders size={14} /> Tone of Claim Notice
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className={`btn btn-secondary ${claimTone === 'formal' ? 'btn-primary' : ''}`}
                        style={{ fontSize: '0.78rem', padding: '0.5rem' }}
                        onClick={() => setClaimTone('formal')}
                      >
                        📄 Formal Business
                      </button>
                      <button
                        type="button"
                        className={`btn btn-secondary ${claimTone === 'urgent' ? 'btn-primary' : ''}`}
                        style={{ fontSize: '0.78rem', padding: '0.5rem' }}
                        onClick={() => setClaimTone('urgent')}
                      >
                        ⚡ Urgent Escalation (48h)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-secondary ${claimTone === 'legal' ? 'btn-primary' : ''}`}
                        style={{ fontSize: '0.78rem', padding: '0.5rem' }}
                        onClick={() => setClaimTone('legal')}
                      >
                        ⚖️ Consumer Rights Notice
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Review & Multi-Agent Instant Dispatch */}
              {step === 3 && (
                <div>
                  {dispatchFeedback && (
                    <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '0.65rem', padding: '0.65rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 700, fontSize: '0.82rem' }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span>{dispatchFeedback.message}</span>
                    </div>
                  )}

                  {/* Readiness Score Bar */}
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.85rem', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Award size={18} /> CLAIM READINESS SCORE
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#16a34a' }}>
                        {readinessScore}% Ready
                      </span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '8px', marginBottom: '0.75rem' }}>
                      <div className="progress-bar-fill active" style={{ width: `${readinessScore}%` }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem' }}>
                      {checklist.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: item.passed ? '#15803d' : '#c2410c' }}>
                          {item.passed ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Editable Brand Email & Subject */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.2rem' }}>
                          Target Support Desk Email (Editable)
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
                          value={effectiveRecipientEmail}
                          onChange={(e) => setCustomRecipientEmail(e.target.value)}
                          placeholder="support@brand.com"
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.2rem' }}>
                          CC Registered Customer Email
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem', background: '#f1f5f9' }}
                          value={getAgentConfig()?.customerEmail || 'customer@warrantyease.com'}
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.2rem' }}>
                        Email Subject Line
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem', fontWeight: 600 }}
                        value={getClaimSubject()}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Fully Editable Claim Letter Body */}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Edit3 size={14} color="#0066cc" />
                        AI Generated Claim Notice ({claimTone.toUpperCase()}) — Editable
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isEditingCustomText && (
                          <button
                            type="button"
                            onClick={handleResetLetter}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.4rem', padding: '0.2rem 0.5rem', cursor: 'pointer', color: '#64748b', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <RotateCcw size={12} /> Reset AI
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleCopyClaimLetter}
                          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.4rem', padding: '0.2rem 0.6rem', cursor: 'pointer', color: '#0066cc', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          {copiedLetter ? <Check size={13} color="#16a34a" /> : <Copy size={13} color="#0066cc" />}
                          <span>{copiedLetter ? 'Copied!' : 'Copy Letter'}</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      className="form-control"
                      rows={8}
                      style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: '#ffffff', lineHeight: 1.4 }}
                      value={getEffectiveClaimBody()}
                      onChange={(e) => {
                        setIsEditingCustomText(true);
                        setCustomClaimText(e.target.value);
                      }}
                      placeholder="Type or modify your formal claim notice here..."
                    />
                  </div>

                  {/* Multi-Agent Direct Transmission Action Buttons */}
                  <div style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '0.85rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1d4ed8' }}>
                          Direct Transmission Channels:
                        </span>
                        <p style={{ fontSize: '0.73rem', color: '#475569', margin: '0.1rem 0 0 0' }}>
                          Choose your preferred platform to transmit this notice directly to {effectiveRecipientEmail}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 800 }}>
                        User CC: {getAgentConfig()?.customerEmail || 'Registered Email'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
                      {/* Option 1: Gmail Web Compose */}
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#0066cc', borderColor: '#0066cc' }}
                        onClick={handleDispatchGmail}
                      >
                        <Mail size={15} />
                        <span>Send via Gmail Web</span>
                      </button>

                      {/* Option 2: Default Mail Client */}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#ffffff', borderColor: '#cbd5e1' }}
                        onClick={handleDispatchEmailAgent}
                      >
                        <FileText size={15} />
                        <span>Default Mail App</span>
                      </button>

                      {/* Option 3: WhatsApp Alert */}
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#16a34a', borderColor: '#16a34a' }}
                        onClick={handleDispatchWhatsAppAgent}
                      >
                        <MessageCircle size={15} />
                        <span>Send via WhatsApp</span>
                      </button>

                      {/* Option 4: SMS App */}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#ffffff', borderColor: '#cbd5e1' }}
                        onClick={handleDispatchSmsAgent}
                      >
                        <Smartphone size={15} />
                        <span>Send via SMS App</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {submittedClaimResult ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginLeft: 'auto' }}
              onClick={onClose}
            >
              Done & Return to Claims
            </button>
          ) : (
            <>
              {step > 1 ? (
                <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                  Back
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
              )}

              {step < 3 ? (
                <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
                  <span>Next: {step === 1 ? 'Answer Guided Questions' : 'Review & Dispatch'}</span>
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleFinalSubmitClaim}>
                  <Send size={15} />
                  <span>Submit & Save Claim</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
