import React, { useState, useRef, useCallback } from 'react';
import {
  X, FileScan, Sparkles, Upload, ShieldCheck, Edit3,
  Loader2, Award, AlertTriangle, BellRing, CheckCircle2,
  Check, RefreshCw, FileText, Info, AlertCircle, Wifi,
  ChevronRight, Eye, WifiOff
} from 'lucide-react';
import { calculateWarrantyExpiry, validateBrandModelConsistency } from '../utils/warrantyCalculator';
import { runOCR, analyzeWarranty, checkBackendHealth } from '../utils/ocrClient';
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
  [STAGE.UPLOADING]:    { text: 'Uploading document...', sub: 'Sending to OCR engine' },
  [STAGE.OCR_READING]:  { text: 'Reading your document...', sub: 'PaddleOCR scanning text (may take ~10s first time)' },
  [STAGE.EXTRACTING]:   { text: 'Extracting warranty information...', sub: 'Parsing brand, serial, dates and prices' },
  [STAGE.AI_ANALYZING]: { text: 'AI analyzing warranty...', sub: 'Checking dates, detecting issues, explaining coverage' },
};

// ─── Confidence badge ────────────────────────────────────────
function ConfBadge({ score }) {
  if (!score || score <= 0)
    return <span style={{ color: '#ef4444', background: '#fef2f2', padding: '0.15rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.72rem', fontWeight: 800 }}>⚠ Unknown</span>;
  if (score >= 0.90)
    return <span style={{ color: '#15803d', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.72rem', fontWeight: 800 }}>✓ {Math.round(score * 100)}%</span>;
  return <span style={{ color: '#c2410c', background: '#ffedd5', padding: '0.15rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.72rem', fontWeight: 800 }}>⚠ {Math.round(score * 100)}% – Verify</span>;
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

      {/* Step dots */}
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
        {['Upload', 'OCR Read', 'Extract', 'AI Analyze'].map((label, idx) => (
          <span key={label} style={{ fontSize: '0.7rem', color: idx <= current ? '#0066cc' : '#94a3b8', fontWeight: idx === current ? 800 : 500 }}>{label}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Backend offline warning ──────────────────────────────────
function BackendOfflineBanner({ onDismiss }) {
  return (
    <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '0.85rem', padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <WifiOff size={22} color="#b45309" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
            OCR Backend Not Running
          </div>
          <p style={{ color: '#78350f', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
            The real OCR service is not reachable. To use production OCR, start the backend:
          </p>
          <pre style={{ background: '#1e293b', color: '#a5f3fc', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.78rem', fontFamily: 'monospace', margin: '0.65rem 0', lineHeight: 1.5 }}>
{`cd backend
./start.sh`}
          </pre>
          <p style={{ color: '#78350f', fontSize: '0.78rem', margin: 0 }}>
            First run downloads ~200 MB PaddleOCR model. Subsequent starts are instant.
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
        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0c4a6e' }}>AI Warranty Analysis</span>
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
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Exclusions/Conditions Found in Document:</div>
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
  const [stage, setStage] = useState(STAGE.IDLE);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [error, setError] = useState(null);
  const [backendOffline, setBackendOffline] = useState(false);

  // Review state
  const [rawText, setRawText] = useState('');
  const [fields, setFields] = useState(null);  // structured extracted_fields from backend
  const [analysis, setAnalysis] = useState(null);  // AI analysis result
  const [extendedYears, setExtendedYears] = useState(0);
  const [enableAgentReminders, setEnableAgentReminders] = useState(true);
  const [showRawText, setShowRawText] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // ─── Reset ─────────────────────────────────────────────────
  React.useEffect(() => {
    if (!isOpen) {
      setStage(STAGE.IDLE);
      setUploadedPreviewUrl(null);
      setUploadedFileName('');
      setError(null);
      setBackendOffline(false);
      setRawText('');
      setFields(null);
      setAnalysis(null);
      setExtendedYears(0);
      setAddedSuccess(false);
      setShowRawText(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen]);

  const handleReset = useCallback((e) => {
    if (e) e.stopPropagation();
    setStage(STAGE.IDLE);
    setUploadedPreviewUrl(null);
    setUploadedFileName('');
    setError(null);
    setBackendOffline(false);
    setRawText('');
    setFields(null);
    setAnalysis(null);
    setAddedSuccess(false);
    setShowRawText(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  if (!isOpen) return null;

  // ─── File processing ───────────────────────────────────────
  const processFile = async (file) => {
    if (!file) return;

    setError(null);
    setBackendOffline(false);
    setUploadedFileName(file.name);
    setFields(null);
    setAnalysis(null);
    setRawText('');
    setAddedSuccess(false);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setUploadedPreviewUrl(e.target.result);
    if (file.type !== 'application/pdf') {
      reader.readAsDataURL(file);
    } else {
      setUploadedPreviewUrl(null); // PDF no visual preview
    }

    // 1. Upload + OCR
    setStage(STAGE.UPLOADING);
    await new Promise(r => setTimeout(r, 400)); // brief pause for UX
    setStage(STAGE.OCR_READING);

    let ocrResult;
    try {
      ocrResult = await runOCR(file, (pct) => {
        if (pct >= 80) setStage(STAGE.EXTRACTING);
      });
    } catch (err) {
      const msg = err.message || String(err);
      if (msg.includes('Cannot reach') || msg.includes('Connection refused') || msg.includes('Failed to fetch')) {
        setBackendOffline(true);
        setStage(STAGE.ERROR);
        setError('OCR backend is not running. Start the backend server to scan real documents.');
      } else {
        setStage(STAGE.ERROR);
        setError(msg);
      }
      return;
    }

    if (!ocrResult.success) {
      setStage(STAGE.ERROR);
      setError(ocrResult.error || 'OCR could not extract readable text from this document.');
      return;
    }

    const extractedText = ocrResult.raw_text || '';
    const extractedFields = ocrResult.extracted_fields || {};
    setRawText(extractedText);
    setFields(extractedFields);

    // 2. AI Analysis
    setStage(STAGE.AI_ANALYZING);
    const analysisResult = await analyzeWarranty(extractedText, extractedFields);
    if (analysisResult.success && analysisResult.analysis) {
      setAnalysis(analysisResult.analysis);
    }

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

  // ─── Build protection object from reviewed fields ──────────
  const buildProtectionObj = () => {
    if (!fields) return null;
    const purchaseDateStr = fields.purchase_date || new Date().toISOString().split('T')[0];
    const baseDurationMonths = Number(fields.warranty_period_months) || 12;
    const totalDurationMonths = baseDurationMonths + (extendedYears * 12);
    const calculated = calculateWarrantyExpiry(purchaseDateStr, totalDurationMonths);
    const isInsurance = (fields.document_type || '').toLowerCase().includes('insurance')
      || (fields.category || '').toLowerCase().includes('insurance');

    const docId = `doc-${Date.now()}`;
    const docFileName = uploadedFileName || `${fields.brand || 'Verified'}_Invoice_${fields.invoice_number || Date.now()}.pdf`;

    return {
      id: `ocr-${Date.now()}`,
      brand: fields.brand || 'Verified Retailer',
      productName: fields.product_name || fields.model_number || `${fields.brand || 'Device'} Protection`,
      model: fields.model_number || fields.product_name || 'Standard Product',
      category: fields.category || (isInsurance ? 'Health Insurance' : 'Electronics'),
      protectionType: isInsurance ? 'Insurance' : 'Warranty',
      status: calculated.status,
      expiryDate: fields.warranty_expiry_date || calculated.expiryDateStr,
      expiryFormatted: calculated.expiryFormatted,
      price: Number(fields.purchase_price) || 0,
      currency: fields.currency || '₹',
      serialNumber: fields.serial_number || `VAULT-SN-${Date.now()}`,
      customerName: fields.customer_name || 'Srishailam Potti',
      customerPhone: '+91 9866130006',
      claimServicesLinked: true,
      claimServicesStatus: 'Active & Linked (1-Click Claim Ready)',
      purchaseDate: purchaseDateStr,
      warrantyDurationMonths: totalDurationMonths,
      warrantyVerified: true,
      warrantySource: `Real OCR Scanner (${fields.document_type || 'Invoice'} #${fields.invoice_number || 'VERIFIED'})`,
      seller: fields.seller || `${fields.brand || 'Retail'} Authorized Provider`,
      invoiceNumber: fields.invoice_number || `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      daysLeft: calculated.daysLeft,
      progressPercentage: calculated.progressPercentage,
      enableAgentReminders,
      documentUrl: uploadedPreviewUrl,
      ocrConfidence: fields.confidence || 0,
      ocrRawText: rawText.slice(0, 2000), // store first 2000 chars of OCR text
      documents: [{
        id: docId,
        fileName: docFileName,
        documentType: isInsurance ? 'Insurance Policy' : 'Purchase Invoice',
        productName: fields.model_number || fields.product_name,
        brand: fields.brand || 'Verified Retailer',
        serialNumber: fields.serial_number || 'VAULT-VERIFIED',
        uploadDate: purchaseDateStr,
        ocrStatus: 'Real OCR — PaddleOCR',
        ocrConfidence: Math.round((fields.confidence || 0) * 100),
        fileSize: `${uploadedFileName ? '~' : ''}${Math.round(rawText.length / 10)} KB`,
        fileDataUrl: uploadedPreviewUrl,
        rawText: rawText,
      }],
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

  // Helper to update a specific field
  const setField = (key, value) => setFields(prev => ({ ...prev, [key]: value }));

  const consistencyCheck = fields?.brand && fields?.model_number
    ? validateBrandModelConsistency(fields.brand, fields.model_number)
    : { valid: true };

  const isProcessing = [STAGE.UPLOADING, STAGE.OCR_READING, STAGE.EXTRACTING, STAGE.AI_ANALYZING].includes(stage);
  const isPdf = uploadedFileName?.toLowerCase().endsWith('.pdf');

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>

        {/* ─── Header ─── */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '0.85rem', background: 'linear-gradient(135deg, #0066cc 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
              <FileScan size={24} />
            </div>
            <div>
              <h2 className="modal-title">AI Invoice & Warranty Scanner</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Real OCR (PaddleOCR) + AI analysis — no hardcoded data
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {(stage !== STAGE.IDLE && stage !== STAGE.ERROR) && (
              <button className="btn btn-secondary" onClick={handleReset} style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} title="Scan a different document">
                <RefreshCw size={13} /><span>New Scan</span>
              </button>
            )}
            <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div className="modal-body">

          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" style={{ display: 'none' }} onChange={handleFileInputChange} />

          {/* ─── Backend offline banner ─── */}
          {backendOffline && <BackendOfflineBanner />}

          {/* ─── Upload Zone ─── */}
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
                Click to Upload or Drag & Drop Invoice / Warranty Card
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '440px', margin: '0 auto', lineHeight: 1.4 }}>
                Accepts JPG, PNG, PDF (max 10 MB). Real PaddleOCR reads serial numbers, prices, and warranty details automatically.
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['Samsung', 'Apple', 'LG', 'Sony', 'Insurance Policy', 'Any Invoice'].map(t => (
                  <span key={t} style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.55rem', borderRadius: '20px', fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* ─── File loaded (awaiting process or processing) ─── */}
          {uploadedFileName && stage !== STAGE.IDLE && !backendOffline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              {uploadedPreviewUrl && !isPdf ? (
                <img src={uploadedPreviewUrl} alt="Preview" style={{ width: 48, height: 48, borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid #cbd5e1', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '0.5rem', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={22} color="#0066cc" />
                </div>
              )}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{uploadedFileName}</div>
                <div style={{ fontSize: '0.75rem', color: stage === STAGE.REVIEW ? '#16a34a' : '#0066cc', fontWeight: 600 }}>
                  {stage === STAGE.REVIEW ? '✓ Scanned & Analyzed' : '⟳ Processing...'}
                </div>
              </div>
              {stage === STAGE.REVIEW && (
                <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem' }} onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Upload size={13} /><span>Scan Another</span>
                </button>
              )}
            </div>
          )}

          {/* ─── Error state (non-offline) ─── */}
          {stage === STAGE.ERROR && !backendOffline && error && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.85rem', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#dc2626', marginBottom: '0.25rem' }}>Scan Failed</div>
                  <pre style={{ color: '#7f1d1d', fontSize: '0.8rem', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{error}</pre>
                  <button className="btn btn-secondary" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }} onClick={handleReset}>
                    <RefreshCw size={13} /><span>Try Again</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Scan progress ─── */}
          {isProcessing && <ScanProgress stage={stage} />}

          {/* ─── Review Screen ─── */}
          {stage === STAGE.REVIEW && fields && (
            <div>
              {/* AI Analysis Panel */}
              <AIAnalysisPanel analysis={analysis} />

              {/* Brand consistency warning */}
              {!consistencyCheck.valid && (
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '0.65rem', padding: '0.65rem 0.85rem', marginBottom: '0.85rem', fontSize: '0.8rem', color: '#92400e' }}>
                  ⚠ {consistencyCheck.reason} Suggested: <strong>{consistencyCheck.suggestedBrand}</strong>
                </div>
              )}

              {/* Product header */}
              <div style={{ background: '#fff', border: '1.5px solid #bfdbfe', borderRadius: '1.15rem', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {fields.brand && <BrandLogo brand={fields.brand} size={36} />}
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {fields.brand || 'Unknown Brand'} — {fields.model_number || fields.product_name || 'Product'}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#0066cc', fontWeight: 600, marginTop: '0.1rem' }}>
                        {fields.seller || 'Authorized Retailer'}{fields.invoice_number ? ` • Invoice #${fields.invoice_number}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="status-badge active" style={{ fontSize: '0.72rem' }}>
                      <span className="status-dot dot-active" />
                      Real OCR Scan
                    </span>
                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '0.35rem', fontWeight: 700 }}>
                      {Math.round((fields.confidence || 0) * 100)}% confidence
                    </span>
                  </div>
                </div>

                {/* OCR character count badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    📄 {rawText.length.toLocaleString()} characters extracted from document
                  </span>
                  <button
                    onClick={() => setShowRawText(v => !v)}
                    style={{ fontSize: '0.72rem', color: '#0066cc', background: 'none', border: '1px solid #bfdbfe', borderRadius: '0.4rem', padding: '0.15rem 0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Eye size={12} />{showRawText ? 'Hide' : 'View'} Raw OCR Text
                  </button>
                </div>

                {showRawText && (
                  <div style={{ background: '#0f172a', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.85rem', maxHeight: '150px', overflowY: 'auto' }}>
                    <pre style={{ color: '#a5f3fc', fontSize: '0.72rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.4 }}>{rawText}</pre>
                  </div>
                )}

                {/* Editable Fields */}
                <div style={{ background: '#f8fafc', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ✏ Review & Edit All Fields — Confirm before saving
                  </div>

                  {/* Row 1: Brand + Product Name */}
                  <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Brand</label>
                        <ConfBadge score={fields.field_confidence?.brand} />
                      </div>
                      <input className="form-control" type="text" value={fields.brand || ''} onChange={e => setField('brand', e.target.value)} placeholder="e.g. Samsung" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Product Name</label>
                        <span style={{ fontSize: '0.68rem', color: '#16a34a' }}>Editable</span>
                      </div>
                      <input className="form-control" type="text" value={fields.product_name || ''} onChange={e => setField('product_name', e.target.value)} placeholder="e.g. Samsung Washing Machine" />
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
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Serial / IMEI Number</label>
                        <ConfBadge score={fields.field_confidence?.serial_number} />
                      </div>
                      <input className="form-control" type="text" value={fields.serial_number || ''} onChange={e => setField('serial_number', e.target.value)} placeholder="e.g. 05SU5PBX900128" />
                    </div>
                  </div>

                  {/* Row 3: Purchase Date + Invoice # */}
                  <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Purchase Date</label>
                        <ConfBadge score={fields.field_confidence?.purchase_date} />
                      </div>
                      <input className="form-control" type="date" value={fields.purchase_date || ''} onChange={e => setField('purchase_date', e.target.value)} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Invoice Number</label>
                        <span style={{ fontSize: '0.68rem', color: '#16a34a' }}>Editable</span>
                      </div>
                      <input className="form-control" type="text" value={fields.invoice_number || ''} onChange={e => setField('invoice_number', e.target.value)} placeholder="e.g. INV-29S1I4082713" />
                    </div>
                  </div>

                  {/* Row 4: Price + Warranty Duration */}
                  <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Purchase Price (₹)</label>
                        <ConfBadge score={fields.field_confidence?.purchase_price} />
                      </div>
                      <input className="form-control" type="number" value={fields.purchase_price || ''} onChange={e => setField('purchase_price', Number(e.target.value))} placeholder="e.g. 45892" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', margin: 0, fontWeight: 700 }}>Warranty Duration (Months)</label>
                        <ConfBadge score={fields.field_confidence?.warranty_period} />
                      </div>
                      <input className="form-control" type="number" min="1" max="600" value={fields.warranty_period_months || ''} onChange={e => setField('warranty_period_months', Number(e.target.value))} placeholder="e.g. 24" />
                    </div>
                  </div>

                  {/* Row 5: Seller + Customer Name */}
                  <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Seller / Retailer</label>
                      <input className="form-control" type="text" value={fields.seller || ''} onChange={e => setField('seller', e.target.value)} placeholder="e.g. Samsung India" />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Customer Name</label>
                      <input className="form-control" type="text" value={fields.customer_name || ''} onChange={e => setField('customer_name', e.target.value)} placeholder="e.g. Srishailam Potti" />
                    </div>
                  </div>

                  {/* Row 6: Document Type + Warranty Type */}
                  <div className="form-row">
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Document Type</label>
                      <select className="form-control" value={fields.document_type || 'Invoice / Receipt'} onChange={e => setField('document_type', e.target.value)}>
                        <option>Tax Invoice</option>
                        <option>Warranty Card</option>
                        <option>Insurance Policy</option>
                        <option>Payment Receipt</option>
                        <option>Purchase Order</option>
                        <option>Invoice / Receipt</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Warranty Type</label>
                      <select className="form-control" value={fields.warranty_type || 'Manufacturer Warranty'} onChange={e => setField('warranty_type', e.target.value)}>
                        <option>Manufacturer Warranty</option>
                        <option>Extended Warranty</option>
                        <option>Insurance Policy</option>
                        <option>AMC / Service Contract</option>
                        <option>Store Warranty</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Extended Protection Add-on */}
                <div style={{ background: '#f1f5f9', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>Extended Protection / AMC Add-on:</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[0, 1, 2, 3].map(yrs => (
                      <button key={yrs} type="button" className={`btn btn-secondary ${extendedYears === yrs ? 'btn-primary' : ''}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }} onClick={() => setExtendedYears(yrs)}>
                        {yrs === 0 ? 'None' : `+${yrs} Yr${yrs > 1 ? 's' : ''}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agent reminders */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginTop: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BellRing size={18} color="#0066cc" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1d4ed8' }}>Auto-Schedule Expiry Reminders</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Email & WhatsApp agents notify before expiry</div>
                    </div>
                  </div>
                  <input type="checkbox" checked={enableAgentReminders} onChange={e => setEnableAgentReminders(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#0066cc' }} />
                </div>
              </div>
            </div>
          )}

          {/* ─── Success state ─── */}
          {stage === STAGE.SUCCESS && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Check size={30} color="#16a34a" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Warranty Added!</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Your scanned warranty has been saved to the Protections Vault.</p>
            </div>
          )}

        </div>

        {/* ─── Footer Actions ─── */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>

          {stage === STAGE.REVIEW && fields && (
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button className="btn btn-secondary" onClick={handleManualEdit}>
                <Edit3 size={15} color="#0066cc" /><span>Edit in Wizard</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={handleDirectAdd}
                style={{ background: addedSuccess ? '#16a34a' : undefined, display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                {addedSuccess ? <Check size={16} /> : <ShieldCheck size={16} />}
                <span>{addedSuccess ? 'Added to Vault!' : 'Confirm & Save Warranty'}</span>
              </button>
            </div>
          )}

          {(stage === STAGE.IDLE || stage === STAGE.ERROR) && (
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /><span>Choose File</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
