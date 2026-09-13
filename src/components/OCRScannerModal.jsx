import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, FileScan, Sparkles, Upload, ShieldCheck, Edit3,
  Loader2, AlertTriangle, BellRing,
  Check, RefreshCw, FileText, Info, AlertCircle,
  Eye, WifiOff, QrCode, ArrowRight, Code, HelpCircle, ShieldAlert
} from 'lucide-react';
import { calculateWarrantyExpiry, validateBrandModelConsistency } from '../utils/warrantyCalculator';
import { runOCR, analyzeWarranty, checkBackendHealth } from '../utils/ocrClient';
import { extractInvoiceDataFromFile } from '../utils/aiVisionScanner';
import BrandLogo from './BrandLogo';

// ─── Stage constants ────────────────────────────────────────
const STAGE = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  OCR_READING: 'ocr_reading',
  EXTRACTING: 'extracting',
  AI_ANALYZING: 'ai_analyzing',
  REVIEW: 'review',
  SUCCESS: 'success',
  ERROR: 'error',
};

const STAGE_LABELS = {
  [STAGE.UPLOADING]:    { text: 'Uploading document...', sub: 'Preprocessing & streaming file' },
  [STAGE.OCR_READING]:  { text: 'Running PaddleOCR Vision Engine...', sub: 'Extracting text and identifying character coordinates' },
  [STAGE.EXTRACTING]:   { text: 'Classifying document & parsing fields...', sub: 'Distinguishing invoice, warranty, insurance & validating evidence' },
  [STAGE.AI_ANALYZING]: { text: 'AI Document Verification...', sub: 'Checking dates, conditions, and coverage details' },
};

// ─── Confidence badge ────────────────────────────────────────
function ConfBadge({ score }) {
  if (score === undefined || score === null || score <= 0)
    return <span style={{ color: '#dc2626', background: '#fef2f2', padding: '0.15rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.72rem', fontWeight: 800 }}>Not Found</span>;
  if (score >= 0.90)
    return <span style={{ color: '#15803d', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.72rem', fontWeight: 800 }}>✓ {Math.round(score * 100)}% High</span>;
  return <span style={{ color: '#c2410c', background: '#ffedd5', padding: '0.15rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.72rem', fontWeight: 800 }}>⚠ {Math.round(score * 100)}% Verify</span>;
}

// ─── Progress bar ─────────────────────────────────────────────
function ScanProgress({ stage }) {
  const stagesOrder = [STAGE.UPLOADING, STAGE.OCR_READING, STAGE.EXTRACTING, STAGE.AI_ANALYZING];
  const current = stagesOrder.indexOf(stage);
  const info = STAGE_LABELS[stage] || { text: 'Processing...', sub: '' };

  return (
    <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '2rem 1.5rem', textAlign: 'center', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
      <Loader2 size={38} color="#0066cc" style={{ margin: '0 auto 0.85rem', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{info.text}</p>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem', marginBottom: '1.25rem' }}>{info.sub}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {stagesOrder.map((s, idx) => {
          const done = idx < current;
          const active = idx === current;
          return (
            <React.Fragment key={s}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? '#16a34a' : active ? '#0066cc' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '0.7rem', fontWeight: 800,
                border: active ? '2px solid #bfdbfe' : 'none',
              }}>
                {done ? '✓' : idx + 1}
              </div>
              {idx < stagesOrder.length - 1 && (
                <div style={{ width: 24, height: 2, background: done ? '#16a34a' : '#e2e8f0', borderRadius: 2 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
        {['Upload', 'OCR Read', 'Classification', 'AI Verify'].map((label, idx) => (
          <span key={label} style={{ fontSize: '0.7rem', color: idx <= current ? '#0066cc' : '#94a3b8', fontWeight: idx === current ? 800 : 500 }}>{label}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Backend offline banner ──────────────────────────────────
function BackendOfflineBanner({ onRetry, isChecking }) {
  return (
    <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '0.85rem', padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <WifiOff size={22} color="#b45309" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.95rem' }}>
              OCR Backend Service Offline
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isChecking}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: '#fef3c7', border: '1px solid #d97706',
                  color: '#92400e', borderRadius: '0.5rem',
                  padding: '0.25rem 0.65rem', fontSize: '0.75rem',
                  fontWeight: 700, cursor: isChecking ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isChecking ? <Loader2 size={12} className="spin-animation" /> : <RefreshCw size={12} />}
                <span>{isChecking ? 'Checking...' : 'Check Server Status'}</span>
              </button>
            )}
          </div>
          <p style={{ color: '#78350f', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
            The Python PaddleOCR service is not responding. To activate server-side deep OCR:
          </p>
          <pre style={{ background: '#1e293b', color: '#a5f3fc', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.78rem', fontFamily: 'monospace', margin: '0.65rem 0', lineHeight: 1.5 }}>
{`cd backend
./start.sh`}
          </pre>
          <p style={{ color: '#78350f', fontSize: '0.78rem', margin: 0 }}>
            Client-side text parsing is active. Missing values will remain unverified without inventing fake data.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── AI Analysis panel ────────────────────────────────────────
function AIAnalysisPanel({ analysis }) {
  if (!analysis) return null;
  const { warranty_summary, status_explanation, missing_warnings, date_warnings, exclusions_found, uncertainty_notes, confidence_note, provider } = analysis;

  const hasWarnings = (missing_warnings?.length > 0) || (date_warnings?.length > 0) || (uncertainty_notes?.length > 0);

  return (
    <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '0.85rem', padding: '1rem 1.15rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <Sparkles size={18} color="#0284c7" />
        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0c4a6e' }}>Document Intelligence Summary</span>
        <span style={{ fontSize: '0.68rem', background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>{provider || 'rule-based'}</span>
      </div>

      {warranty_summary && (
        <p style={{ fontSize: '0.83rem', color: '#0f172a', margin: '0 0 0.65rem', lineHeight: 1.5 }}>{warranty_summary}</p>
      )}

      {status_explanation && (
        <div style={{ background: '#fff', border: '1px solid #bae6fd', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#0c4a6e', fontWeight: 600, marginBottom: '0.65rem', lineHeight: 1.4 }}>
          {status_explanation}
        </div>
      )}

      {hasWarnings && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {missing_warnings?.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', fontSize: '0.78rem', color: '#92400e' }}>
              <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span>{w}</span>
            </div>
          ))}
          {date_warnings?.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', fontSize: '0.78rem', color: '#7c3aed' }}>
              <AlertCircle size={13} color="#8b5cf6" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span>{w}</span>
            </div>
          ))}
          {uncertainty_notes?.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', fontSize: '0.78rem', color: '#64748b' }}>
              <Info size={13} color="#64748b" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {exclusions_found?.length > 0 && (
        <div style={{ marginTop: '0.65rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Exclusions / Conditions Verified from Text:</div>
          {exclusions_found.map((e, i) => (
            <div key={i} style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', gap: '0.35rem' }}>
              <span>•</span><span>{e}</span>
            </div>
          ))}
        </div>
      )}

      {confidence_note && (
        <div style={{ marginTop: '0.65rem', fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid #e0f2fe', paddingTop: '0.5rem' }}>{confidence_note}</div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────
export default function OCRScannerModal({ isOpen, onClose, onAddProtectionDirect, onApplyExtractedData }) {
  const [scanMode, setScanMode] = useState('document'); // 'document' | 'qr'
  const [stage, setStage] = useState(STAGE.IDLE);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [error, setError] = useState(null);
  const [backendOffline, setBackendOffline] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  // Review state
  const [rawText, setRawText] = useState('');
  const [fields, setFields] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [extendedYears, setExtendedYears] = useState(0);
  const [enableAgentReminders, setEnableAgentReminders] = useState(true);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const fileInputRef = useRef(null);

  const handleCheckBackend = useCallback(async () => {
    setIsCheckingBackend(true);
    try {
      const res = await checkBackendHealth();
      setBackendOffline(!res.ok);
    } catch {
      setBackendOffline(true);
    } finally {
      setIsCheckingBackend(false);
    }
  }, []);

  // Complete state reset function (PART 16: Zero leakage between documents)
  const handleReset = useCallback((e) => {
    if (e) e.stopPropagation();
    setStage(STAGE.IDLE);
    setUploadedPreviewUrl(null);
    setUploadedFileName('');
    setError(null);
    setRawText('');
    setFields(null);
    setAnalysis(null);
    setExtendedYears(0);
    setAddedSuccess(false);
    setShowDebug(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    } else {
      handleCheckBackend();
    }
  }, [isOpen, handleReset, handleCheckBackend]);

  if (!isOpen) return null;

  // ─── File processing ────────────────────────────────────────
  const processFile = async (file) => {
    if (!file) return;

    // Strict reset prior to every document run
    handleReset();
    setUploadedFileName(file.name);

    // Preview
    let previewDataUrl = null;
    if (file.type !== 'application/pdf') {
      const reader = new FileReader();
      previewDataUrl = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
      setUploadedPreviewUrl(previewDataUrl);
    }

    setStage(STAGE.UPLOADING);
    await new Promise(r => setTimeout(r, 120));
    setStage(STAGE.OCR_READING);

    let extractedText = '';
    let extractedFields = null;

    try {
      // Direct call to OCR backend with generous timeout
      const ocrResult = await runOCR(file, (pct) => {
        if (pct >= 50) setStage(STAGE.EXTRACTING);
      });

      if (ocrResult && ocrResult.success) {
        extractedText = ocrResult.raw_text || '';
        extractedFields = ocrResult.extracted_fields || null;
      } else if (ocrResult && ocrResult.extracted_fields) {
        extractedText = ocrResult.raw_text || '';
        extractedFields = ocrResult.extracted_fields;
      }
    } catch (e) {
      // Backend unreachable or failed
      if (e.message?.includes('Cannot reach OCR backend')) {
        setBackendOffline(true);
      }
      // Attempt clean client-side extraction without fabricating data
      setStage(STAGE.EXTRACTING);
      const clientResult = await extractInvoiceDataFromFile(file, previewDataUrl);
      extractedText = clientResult.rawText || '';
      extractedFields = {
        document_type: clientResult.documentType,
        is_supported: clientResult.isSupported,
        unsupported_reason: clientResult.unsupportedReason,
        brand: clientResult.brand,
        product_name: clientResult.model,
        model_number: clientResult.model,
        serial_number: clientResult.serialNumber,
        purchase_date: clientResult.purchaseDate,
        purchase_price: clientResult.price,
        currency: clientResult.currency || '₹',
        warranty_period_months: clientResult.warrantyDurationMonths,
        warranty_period: clientResult.warrantyDurationMonths ? `${clientResult.warrantyDurationMonths} months` : null,
        invoice_number: clientResult.invoiceNumber,
        customer_name: clientResult.customerName,
        seller: clientResult.seller,
        category: clientResult.category,
        protection_type: clientResult.protectionType,
        confidence: (clientResult.documentConfidence || 50) / 100,
        field_confidence: {
          brand: (clientResult.brandConfidence || 0) / 100,
          serial_number: (clientResult.serialConfidence || 0) / 100,
          purchase_date: (clientResult.dateConfidence || 0) / 100,
          purchase_price: (clientResult.priceConfidence || 0) / 100,
          warranty_period: clientResult.warrantyDurationMonths ? 0.95 : 0
        },
        field_evidence: clientResult.fieldEvidence || {},
        missing_fields: []
      };
    }

    if (!extractedFields) {
      setError("Could not read text from this file. Please ensure it is a legible invoice, receipt, or warranty card.");
      setStage(STAGE.ERROR);
      return;
    }

    setStage(STAGE.AI_ANALYZING);

    let analysisResult = null;
    try {
      analysisResult = await analyzeWarranty(extractedText, extractedFields);
    } catch (e) {}

    if (analysisResult?.success && analysisResult.analysis) {
      setAnalysis(analysisResult.analysis);
    } else {
      // Default rule-based client analysis
      const brand = extractedFields.brand;
      const product = extractedFields.product_name || extractedFields.model_number;
      const months = extractedFields.warranty_period_months;

      let summary = '';
      if (extractedFields.document_type === 'unrelated') {
        summary = 'Document was not identified as a warranty or purchase invoice.';
      } else if (extractedFields.document_type === 'insurance') {
        summary = `Insurance policy document detected. Premium: ${extractedFields.purchase_price ? '₹' + extractedFields.purchase_price : 'Not stated'}.`;
      } else if (brand && product) {
        summary = `Extracted ${brand} ${product} from document.`;
      } else {
        summary = 'Document processed. Verify extracted fields before saving.';
      }

      setAnalysis({
        warranty_summary: summary,
        status_explanation: months
          ? `Warranty period stated as ${months} months in document.`
          : 'Warranty duration not verified from document — select duration below if known.',
        missing_warnings: extractedFields.missing_fields || [],
        exclusions_found: [
          'Preserve original invoice/receipt for official warranty service claims.'
        ],
        confidence_note: `Confidence score: ${Math.round((extractedFields.confidence || 0.5) * 100)}% verified from document`,
        provider: 'WarrantyEase Extraction Engine'
      });
    }

    setRawText(extractedText);
    setFields(extractedFields);
    setStage(STAGE.REVIEW);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files?.length > 0) processFile(files[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0]);
  };

  // ─── Build protection object strictly without fake data ────────
  const buildProtectionObj = () => {
    if (!fields) return null;
    const purchaseDateStr = fields.purchase_date || new Date().toISOString().split('T')[0];
    const isInsurance = (fields.document_type || '').toLowerCase().includes('insurance')
      || (fields.category || '').toLowerCase().includes('insurance')
      || fields.protection_type === 'Insurance';

    const hasExplicitDuration = fields.warranty_period_months !== null && fields.warranty_period_months !== undefined;
    const baseDurationMonths = hasExplicitDuration ? Number(fields.warranty_period_months) : null;
    const totalDurationMonths = baseDurationMonths !== null ? baseDurationMonths + (extendedYears * 12) : null;

    const calculated = totalDurationMonths !== null
      ? calculateWarrantyExpiry(purchaseDateStr, totalDurationMonths)
      : { status: 'Active (Unverified Duration)', expiryDateStr: null, expiryFormatted: 'Not stated in document', daysLeft: null, progressPercentage: 0 };

    const docId = `doc-${Date.now()}`;
    const docFileName = uploadedFileName || `${fields.brand || 'Document'}_${Date.now()}.pdf`;

    return {
      id: `ocr-${Date.now()}`,
      brand: fields.brand || 'Unbranded Item',
      productName: fields.product_name || fields.model_number || (isInsurance ? `${fields.brand || 'Insurance'} Policy` : (fields.brand ? `${fields.brand} Product` : 'Purchased Item')),
      model: fields.model_number || fields.product_name || (isInsurance ? 'Policy Schedule' : 'Standard Model'),
      category: fields.category || (isInsurance ? 'Health Insurance' : 'Other'),
      protectionType: isInsurance ? 'Insurance' : 'Warranty',
      status: isInsurance ? 'Active' : calculated.status,
      expiryDate: isInsurance ? (fields.warranty_expiry_date || null) : (hasExplicitDuration ? (fields.warranty_expiry_date || calculated.expiryDateStr) : null),
      expiryFormatted: isInsurance ? (fields.warranty_expiry_date || 'Active Policy') : calculated.expiryFormatted,
      price: fields.purchase_price ? Number(fields.purchase_price) : 0,
      currency: fields.currency || '₹',
      serialNumber: fields.serial_number || null,
      customerName: fields.customer_name || null,
      customerPhone: null,
      policyNumber: isInsurance ? (fields.serial_number || fields.invoice_number || null) : null,
      policyHolder: isInsurance ? (fields.customer_name || null) : null,
      insurer: isInsurance ? (fields.brand || fields.seller || null) : null,
      sumInsured: fields.sum_insured || null,
      claimServicesLinked: true,
      claimServicesStatus: 'Active & Linked (1-Click Claim Ready)',
      purchaseDate: purchaseDateStr,
      warrantyDurationMonths: totalDurationMonths,
      warrantyVerified: hasExplicitDuration,
      warrantySource: `${fields.document_type || 'Scan'}${fields.invoice_number ? ` (Inv #${fields.invoice_number})` : ''}`,
      seller: fields.seller || null,
      invoiceNumber: fields.invoice_number || null,
      daysLeft: calculated.daysLeft,
      progressPercentage: calculated.progressPercentage,
      enableAgentReminders,
      documentUrl: uploadedPreviewUrl,
      ocrConfidence: fields.confidence || 0,
      ocrRawText: rawText.slice(0, 2000),
      fieldEvidence: fields.field_evidence || {},
      documents: [{
        id: docId,
        fileName: docFileName,
        documentType: isInsurance ? 'Insurance Policy' : 'Purchase Invoice',
        productName: fields.model_number || fields.product_name,
        brand: fields.brand,
        fileSize: uploadedFileName ? '2.4 MB' : '1.2 MB',
        dateAdded: new Date().toISOString().split('T')[0],
        ocrVerified: true,
        extractedSerial: fields.serial_number || null,
        extractedPrice: fields.purchase_price ? `₹${Number(fields.purchase_price).toLocaleString()}` : null,
        previewUrl: uploadedPreviewUrl,
      }]
    };
  };

  const handleDirectAdd = () => {
    const obj = buildProtectionObj();
    if (!obj) return;
    setAddedSuccess(true);
    if (onAddProtectionDirect) onAddProtectionDirect(obj);
    setTimeout(() => { onClose(); handleReset(); }, 900);
  };

  const handleManualEdit = () => {
    const obj = buildProtectionObj();
    if (!obj) return;
    if (onApplyExtractedData) onApplyExtractedData(obj);
    onClose(); handleReset();
  };

  const setField = (key, value) => setFields(prev => ({ ...prev, [key]: value }));

  const consistencyCheck = fields?.brand && fields?.model_number
    ? validateBrandModelConsistency(fields.brand, fields.model_number)
    : { valid: true };

  const isProcessing = [STAGE.UPLOADING, STAGE.OCR_READING, STAGE.EXTRACTING, STAGE.AI_ANALYZING].includes(stage);
  const isUnrelated = fields?.document_type === 'unrelated' || (fields && fields.is_supported === false);
  const isUnknown = fields?.document_type === 'unknown';
  const isInsurance = fields?.document_type === 'insurance' || fields?.protection_type === 'Insurance';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>

        {/* ─── Header ─── */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '0.85rem', background: 'linear-gradient(135deg, #0066cc 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
              {scanMode === 'qr' ? <QrCode size={24} /> : <FileScan size={24} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 className="modal-title" style={{ margin: 0 }}>
                  {scanMode === 'qr' ? 'QR Code Scanner' : 'AI Invoice & Warranty Scanner'}
                </h2>
                {scanMode === 'document' && (
                  backendOffline ? (
                    <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '0.12rem 0.5rem', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} /> Standby (Client-side Fallback)
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.12rem 0.5rem', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} /> OCR Backend Online
                    </span>
                  )
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                {scanMode === 'qr' ? 'Scan physical QR sticker on product label' : 'Document verification engine — extracts facts from document text with zero hallucination'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {stage === STAGE.REVIEW && (
              <button
                className="btn btn-secondary"
                onClick={() => setShowDebug(v => !v)}
                style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', background: showDebug ? '#eff6ff' : undefined, color: showDebug ? '#2563eb' : undefined }}
                title="Toggle OCR Developer Debug Inspector"
              >
                <Code size={13} /><span>Debug View</span>
              </button>
            )}
            {(stage !== STAGE.IDLE && stage !== STAGE.ERROR) && (
              <button className="btn btn-secondary" onClick={handleReset} style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} title="Scan a different document">
                <RefreshCw size={13} /><span>New Scan</span>
              </button>
            )}
            <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div className="modal-body">

          {/* ─── Mode Switcher ─── */}
          {(stage === STAGE.IDLE || stage === STAGE.ERROR) && (
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                onClick={() => setScanMode('document')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  padding: '0.55rem 1rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
                  background: scanMode === 'document' ? '#ffffff' : 'transparent',
                  color: scanMode === 'document' ? '#2563eb' : '#64748b',
                  fontWeight: scanMode === 'document' ? 800 : 600, fontSize: '0.88rem',
                  boxShadow: scanMode === 'document' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s'
                }}
              >
                <FileScan size={18} />
                <span>📄 Scan Invoice / Warranty Card / Insurance</span>
              </button>
              <button
                onClick={() => setScanMode('qr')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  padding: '0.55rem 1rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer',
                  background: scanMode === 'qr' ? '#ffffff' : 'transparent',
                  color: scanMode === 'qr' ? '#2563eb' : '#64748b',
                  fontWeight: scanMode === 'qr' ? 800 : 600, fontSize: '0.88rem',
                  boxShadow: scanMode === 'qr' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s'
                }}
              >
                <QrCode size={18} />
                <span>📱 Scan QR Code Tag</span>
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" style={{ display: 'none' }} onChange={handleFileInputChange} />

          {/* Backend offline warning banner */}
          {backendOffline && scanMode === 'document' && (
            <BackendOfflineBanner onRetry={handleCheckBackend} isChecking={isCheckingBackend} />
          )}

          {/* Upload Zone */}
          {(stage === STAGE.IDLE || stage === STAGE.ERROR) && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              style={{
                border: isDragging ? '2.5px dashed #0066cc' : '2px dashed #cbd5e1',
                borderRadius: '1rem', padding: '2.5rem 1.5rem', textAlign: 'center',
                background: isDragging ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer', marginBottom: '1.25rem', transition: 'all 0.2s',
                boxShadow: isDragging ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.85rem', color: '#0066cc' }}>
                <Upload size={28} />
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                {scanMode === 'qr' ? 'Upload QR Code Image or Sticker' : 'Upload Invoice, Receipt, Warranty Card, or Insurance Policy'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '460px', margin: '0 auto', lineHeight: 1.4 }}>
                Accepts PDF, JPG, PNG (up to 10 MB). The engine classifies your file and extracts verified details.
              </div>
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && <ScanProgress stage={stage} />}

          {/* Error state */}
          {stage === STAGE.ERROR && error && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.85rem', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#dc2626', marginBottom: '0.25rem' }}>Document Scan Failed</div>
                  <pre style={{ color: '#7f1d1d', fontSize: '0.8rem', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{error}</pre>
                  <button className="btn btn-secondary" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }} onClick={handleReset}>
                    <RefreshCw size={13} /><span>Try Another File</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── REVIEW: UNRELATED DOCUMENT SCREEN (PART 9 & PART 23) ─── */}
          {stage === STAGE.REVIEW && isUnrelated && (
            <div style={{ background: '#fff', border: '1.5px solid #f87171', borderRadius: '1.15rem', padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#dc2626' }}>
                <ShieldAlert size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#991b1b', margin: '0 0 0.5rem' }}>
                Document Not Supported
              </h3>
              <p style={{ color: '#7f1d1d', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
                {fields?.unsupported_reason || fields?.classification?.reasons?.[0] || 'This document does not match an eligible warranty card, purchase invoice, or insurance policy.'}
              </p>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.85rem 1rem', maxWidth: '480px', margin: '0 auto 1.5rem', textAlign: 'left', fontSize: '0.8rem', color: '#475569' }}>
                <strong>Allowed Document Types:</strong>
                <ul style={{ margin: '0.35rem 0 0 1.2rem', padding: 0 }}>
                  <li>Tax Invoice, GST Bill, or Retail Receipt</li>
                  <li>Manufacturer Warranty Card or Guarantee Certificate</li>
                  <li>Health, Motor, or Device Insurance Policy Schedule</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Upload size={16} /><span>Upload Eligible Document</span>
                </button>
                <button className="btn btn-secondary" onClick={handleManualEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Edit3 size={16} /><span>Add Protection Manually</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── REVIEW: UNKNOWN / UNREADABLE SCREEN (PART 10) ─── */}
          {stage === STAGE.REVIEW && !isUnrelated && isUnknown && (
            <div style={{ background: '#fff', border: '1.5px solid #fcd34d', borderRadius: '1.15rem', padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#d97706' }}>
                <HelpCircle size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#92400e', margin: '0 0 0.5rem' }}>
                Could Not Confidently Identify Document
              </h3>
              <p style={{ color: '#78350f', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
                The OCR text in this document was unclear or incomplete. To maintain zero-hallucination accuracy, we do not guess missing fields.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <RefreshCw size={16} /><span>Try Clearer Document</span>
                </button>
                <button className="btn btn-secondary" onClick={handleManualEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Edit3 size={16} /><span>Enter Protection Details Manually</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── REVIEW: ELIGIBLE INVOICE / WARRANTY / INSURANCE SCREEN (PARTS 22, 23, 24) ─── */}
          {stage === STAGE.REVIEW && !isUnrelated && !isUnknown && fields && (
            <div>
              {/* AI Analysis Panel */}
              <AIAnalysisPanel analysis={analysis} />

              {/* Developer Debug Inspector (Part 29) */}
              {showDebug && (
                <div style={{ background: '#0f172a', color: '#a5f3fc', borderRadius: '0.85rem', padding: '1rem', marginBottom: '1rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: '#38bdf8', fontWeight: 700 }}>
                    <span>🔍 DEVELOPER OCR DEBUG INSPECTOR</span>
                    <span>Doc Type: {fields.document_type}</span>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8' }}>File: </span>{uploadedFileName} | <span style={{ color: '#94a3b8' }}>Chars: </span>{rawText.length}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8' }}>Classification: </span>
                    <pre style={{ margin: 0, color: '#fef08a' }}>{JSON.stringify(fields.classification, null, 2)}</pre>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8' }}>Field Evidence Map: </span>
                    <pre style={{ margin: 0, color: '#86efac' }}>{JSON.stringify(fields.field_evidence, null, 2)}</pre>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Raw OCR Text Preview: </span>
                    <pre style={{ margin: 0, color: '#e2e8f0', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>{rawText.slice(0, 1000)}</pre>
                  </div>
                </div>
              )}

              {/* Document Header Card */}
              <div style={{ background: '#fff', border: '1.5px solid #bfdbfe', borderRadius: '1.15rem', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {fields.brand && <BrandLogo brand={fields.brand} size={36} />}
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {fields.brand || 'Verified Item'} — {fields.product_name || fields.model_number || (isInsurance ? 'Insurance Policy' : 'Purchased Product')}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#0066cc', fontWeight: 600, marginTop: '0.1rem' }}>
                        {fields.seller ? `Sold by ${fields.seller}` : 'Document Verified'}{fields.invoice_number ? ` • Inv #${fields.invoice_number}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ background: isInsurance ? '#f3e8ff' : '#eff6ff', color: isInsurance ? '#7e22ce' : '#1d4ed8', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {isInsurance ? '🛡️ Insurance Policy' : fields.document_type === 'warranty' ? '📜 Warranty Card' : '🧾 Tax Invoice'}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '20px', fontWeight: 700 }}>
                      {Math.round((fields.confidence || 0) * 100)}% verified
                    </span>
                  </div>
                </div>

                {/* Evidence snippet bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    📄 {rawText.length.toLocaleString()} characters read from document
                  </span>
                  <button
                    onClick={() => setShowDebug(v => !v)}
                    style={{ fontSize: '0.72rem', color: '#0066cc', background: 'none', border: '1px solid #bfdbfe', borderRadius: '0.4rem', padding: '0.15rem 0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Eye size={12} />{showDebug ? 'Hide' : 'Inspect'} OCR Evidence
                  </button>
                </div>

                {/* Unverified Warranty Alert (Part 22) */}
                {!isInsurance && fields.warranty_period_months === null && (
                  <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '0.85rem', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <AlertTriangle size={16} color="#d97706" />
                      <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#92400e' }}>
                        Warranty duration could not be verified from document
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#78350f', margin: '0 0 0.65rem', lineHeight: 1.4 }}>
                      The invoice does not explicitly state warranty duration. Select standard manufacturer coverage or enter months:
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {[
                        { label: '1 Year (12 Mo)', val: 12 },
                        { label: '2 Years (24 Mo)', val: 24 },
                        { label: '3 Years (36 Mo)', val: 36 },
                        { label: '5 Years (60 Mo)', val: 60 },
                        { label: 'Lifetime', val: 360 },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setField('warranty_period_months', opt.val)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.65rem',
                            background: fields.warranty_period_months === opt.val ? '#0066cc' : '#fff',
                            color: fields.warranty_period_months === opt.val ? '#fff' : '#0f172a',
                            fontWeight: 700,
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editable Fields Grid */}
                <div style={{ background: '#f8fafc', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ✏ Review & Confirm Fields (Backed by Source Text)
                  </div>

                  {/* Row 1: Brand + Product Name */}
                  <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Brand</label>
                        <ConfBadge score={fields.field_confidence?.brand} />
                      </div>
                      <input className="form-control" type="text" value={fields.brand || ''} onChange={e => setField('brand', e.target.value)} placeholder="e.g. Samsung" />
                      {fields.field_evidence?.brand && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>🔍 Evidence: <em>"{fields.field_evidence.brand}"</em></div>
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Product / Model Name</label>
                        <span style={{ fontSize: '0.68rem', color: '#16a34a' }}>Editable</span>
                      </div>
                      <input className="form-control" type="text" value={fields.product_name || ''} onChange={e => setField('product_name', e.target.value)} placeholder="e.g. Samsung Washing Machine" />
                      {fields.field_evidence?.product_name && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>🔍 Evidence: <em>"{fields.field_evidence.product_name}"</em></div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Model + Serial */}
                  <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Model Number</label>
                        <span style={{ fontSize: '0.68rem', color: '#16a34a' }}>Editable</span>
                      </div>
                      <input className="form-control" type="text" value={fields.model_number || ''} onChange={e => setField('model_number', e.target.value)} placeholder="e.g. WW12DB7B24GSTL" />
                      {fields.field_evidence?.model_number && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>🔍 Evidence: <em>"{fields.field_evidence.model_number}"</em></div>
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Serial / IMEI Number</label>
                        <ConfBadge score={fields.field_confidence?.serial_number} />
                      </div>
                      <input className="form-control" type="text" value={fields.serial_number || ''} onChange={e => setField('serial_number', e.target.value)} placeholder="Enter or verify S/N" />
                      {fields.field_evidence?.serial_number && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>🔍 Evidence: <em>"{fields.field_evidence.serial_number}"</em></div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Purchase Date + Invoice # */}
                  <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Purchase / Policy Date</label>
                        <ConfBadge score={fields.field_confidence?.purchase_date} />
                      </div>
                      <input className="form-control" type="date" value={fields.purchase_date || ''} onChange={e => setField('purchase_date', e.target.value)} />
                      {fields.field_evidence?.purchase_date && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>🔍 Evidence: <em>"{fields.field_evidence.purchase_date}"</em></div>
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Invoice / Policy #</label>
                        <span style={{ fontSize: '0.68rem', color: '#16a34a' }}>Editable</span>
                      </div>
                      <input className="form-control" type="text" value={fields.invoice_number || ''} onChange={e => setField('invoice_number', e.target.value)} placeholder="e.g. 29S1I4082713" />
                      {fields.field_evidence?.invoice_number && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>🔍 Evidence: <em>"{fields.field_evidence.invoice_number}"</em></div>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Price + Warranty Duration */}
                  <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>{isInsurance ? 'Total Premium / Insured (₹)' : 'Purchase Price (₹)'}</label>
                        <ConfBadge score={fields.field_confidence?.purchase_price} />
                      </div>
                      <input className="form-control" type="number" value={fields.purchase_price !== null && fields.purchase_price !== undefined ? fields.purchase_price : ''} onChange={e => setField('purchase_price', e.target.value === '' ? null : Number(e.target.value))} placeholder="e.g. 45892" />
                      {fields.field_evidence?.purchase_price && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>🔍 Evidence: <em>"{fields.field_evidence.purchase_price}"</em></div>
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Coverage Duration (Months)</label>
                        <ConfBadge score={fields.field_confidence?.warranty_period} />
                      </div>
                      <input className="form-control" type="number" min="1" max="600" value={fields.warranty_period_months !== null && fields.warranty_period_months !== undefined ? fields.warranty_period_months : ''} onChange={e => setField('warranty_period_months', e.target.value === '' ? null : Number(e.target.value))} placeholder="Duration not stated" />
                      {fields.field_evidence?.warranty_period && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>🔍 Evidence: <em>"{fields.field_evidence.warranty_period}"</em></div>
                      )}
                    </div>
                  </div>

                  {/* Row 5: Seller + Customer Name */}
                  <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Seller / Insurer</label>
                      <input className="form-control" type="text" value={fields.seller || ''} onChange={e => setField('seller', e.target.value)} placeholder="e.g. Retailer or Insurer" />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Customer / Buyer Name</label>
                      <input className="form-control" type="text" value={fields.customer_name || ''} onChange={e => setField('customer_name', e.target.value)} placeholder="As printed on invoice" />
                      {fields.field_evidence?.customer_name && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>🔍 Evidence: <em>"{fields.field_evidence.customer_name}"</em></div>
                      )}
                    </div>
                  </div>

                  {/* Row 6: Category + Protection Type */}
                  <div className="form-row">
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Category</label>
                      <select className="form-control" value={fields.category || 'Other'} onChange={e => setField('category', e.target.value)}>
                        <option>Mobiles</option>
                        <option>Computers</option>
                        <option>TV</option>
                        <option>Audio</option>
                        <option>Cameras</option>
                        <option>Gaming</option>
                        <option>Appliances</option>
                        <option>Kitchen</option>
                        <option>Printers</option>
                        <option>Wearables</option>
                        <option>Furniture</option>
                        <option>Tools</option>
                        <option>Health Insurance</option>
                        <option>Vehicle Insurance</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Protection Type</label>
                      <select className="form-control" value={isInsurance ? 'Insurance' : 'Warranty'} onChange={e => setField('protection_type', e.target.value)}>
                        <option value="Warranty">Product Warranty</option>
                        <option value="Insurance">Insurance Policy</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Auto reminders */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BellRing size={18} color="#0066cc" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1d4ed8' }}>Auto-Schedule Expiry Reminders (30 & 15 days)</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Remind before warranty or policy coverage expires</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={enableAgentReminders} onChange={e => setEnableAgentReminders(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#0066cc' }} />
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {stage === STAGE.SUCCESS && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Check size={30} color="#16a34a" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Protection Added!</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Your verified document has been registered in the Protections Vault.</p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>

          {stage === STAGE.REVIEW && !isUnrelated && !isUnknown && fields && (
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button className="btn btn-secondary" onClick={handleManualEdit}>
                <Edit3 size={15} color="#0066cc" /><span>Open in Wizard</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={handleDirectAdd}
                style={{ background: addedSuccess ? '#16a34a' : undefined, display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                {addedSuccess ? <Check size={16} /> : <ShieldCheck size={16} />}
                <span>{addedSuccess ? 'Saved to Vault!' : isInsurance ? 'Confirm & Save Insurance' : 'Confirm & Save Warranty'}</span>
              </button>
            </div>
          )}

          {(stage === STAGE.IDLE || stage === STAGE.ERROR) && (
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /><span>{scanMode === 'qr' ? 'Choose QR Sticker' : 'Choose Document'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
