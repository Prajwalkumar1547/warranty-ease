import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  HeartPulse,
  Wrench,
  IndianRupee,
  Building2,
  Calendar,
  AlertCircle,
  Upload,
  Camera,
  ArrowRight,
  ArrowLeft,
  Info,
  Sparkles,
  Paperclip,
  Check,
  HelpCircle,
  Clock,
  ExternalLink,
  Loader2,
  Trash2
} from 'lucide-react';
import CustomSelect from './CustomSelect';
import BrandLogoIcon from './BrandLogoIcon';
import { api } from '../services/api';
import { formatINR } from '../utils/warrantyCalculator';

export default function FileClaimModal({
  isOpen,
  onClose,
  protections = [],
  prefilledItem = null,
  onAddClaim,
  onTrackClaim
}) {
  // Wizard steps: 'select_item' -> 'select_issue' -> 'questions' -> 'evidence' -> 'summary' -> 'success'
  const [currentStep, setCurrentStep] = useState('select_item');
  const [selectedProtection, setSelectedProtection] = useState(null);

  // Category & Issue state
  const [resolvedCategoryId, setResolvedCategoryId] = useState('cat_generic');
  const [availableIssues, setAvailableIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);

  // NLP / "I'm not sure" assistance state
  const [userNaturalText, setUserNaturalText] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showNaturalInput, setShowNaturalInput] = useState(false);

  // Diagnostic questions & answers
  const [diagnosticQuestions, setDiagnosticQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [additionalRemarks, setAdditionalRemarks] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Evidence requirements & files
  const [evidenceRequirements, setEvidenceRequirements] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 'f-1', name: 'Original_Purchase_Invoice.pdf', type: 'invoice', size: '245 KB', reqId: 'invoice' },
    { id: 'f-2', name: 'Product_Serial_Label.jpg', type: 'serial_photo', size: '1.4 MB', reqId: 'serial' }
  ]);

  // Resolution preference
  const [preferredResolution, setPreferredResolution] = useState('Authorized Service Center Repair');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdClaimId, setCreatedClaimId] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(true);

  // ─── Initialize when Modal Opens or Prefilled Item Changes ───
  useEffect(() => {
    if (!isOpen) return;

    if (prefilledItem) {
      setSelectedProtection(prefilledItem);
      setCurrentStep('select_issue');
      loadIssuesForProduct(prefilledItem);
    } else if (protections.length > 0) {
      setSelectedProtection(protections[0]);
      setCurrentStep('select_item');
      loadIssuesForProduct(protections[0]);
    } else {
      setSelectedProtection(null);
      setCurrentStep('select_item');
    }
  }, [isOpen, prefilledItem, protections]);

  // Determine if selected protection is insurance
  const isInsurance =
    selectedProtection?.protectionType === 'Insurance' ||
    selectedProtection?.protection_type === 'Insurance' ||
    selectedProtection?.type === 'INSURANCE' ||
    resolvedCategoryId?.startsWith('cat_ins_') ||
    selectedProtection?.category?.toLowerCase().includes('insurance');

  const getResolutionOptions = () => {
    if (resolvedCategoryId === 'cat_ins_health') {
      return [
        'Cashless Hospital Settlement (TPA Direct)',
        'Direct NEFT Bank Reimbursement',
        'Emergency Medical Pre-Authorization'
      ];
    }
    if (resolvedCategoryId === 'cat_ins_motor') {
      return [
        'Cashless Network Workshop Repair',
        'Spot Surveyor Inspection & Reimbursement',
        'RSA Roadside Assistance Dispatch'
      ];
    }
    if (resolvedCategoryId?.startsWith('cat_ins_') || isInsurance) {
      return [
        'Direct Policy Settlement / Reimbursement',
        'Surveyor Claim Assessment'
      ];
    }
    return [
      'Authorized Service Center Repair',
      'Doorstep Technician Visit',
      'Brand Replacement / Store Credit'
    ];
  };

  // Load category-specific issues for a product
  const loadIssuesForProduct = async (product) => {
    if (!product) return;
    setIsLoadingIssues(true);
    setAiSuggestion(null);
    setUserNaturalText('');
    setShowNaturalInput(false);

    try {
      const res = await api.getTaxonomyIssues(
        product.category || product.protection_type,
        product.productName || product.product_name || product.model,
        product.modelNumber || product.model_number,
        product.brand || product.company,
        product.protection_type || product.type || product.category
      );

      setResolvedCategoryId(res.resolved_category_id);
      setAvailableIssues(res.issues || []);
      if (res.issues && res.issues.length > 0) {
        setSelectedIssue(res.issues[0]);
      }

      // Default resolution based on resolved category
      const cat = res.resolved_category_id || '';
      if (cat === 'cat_ins_health') {
        setPreferredResolution('Cashless Hospital Settlement (TPA Direct)');
      } else if (cat === 'cat_ins_motor') {
        setPreferredResolution('Cashless Network Workshop Repair');
      } else if (cat.startsWith('cat_ins_')) {
        setPreferredResolution('Direct Policy Settlement / Reimbursement');
      } else {
        setPreferredResolution('Authorized Service Center Repair');
      }
    } catch (err) {
      console.warn('Failed to load issues from backend, using fallback:', err);
    } finally {
      setIsLoadingIssues(false);
    }
  };

  // When user picks an issue, load its dynamic questions and evidence rules
  const handleSelectIssue = async (issue) => {
    setSelectedIssue(issue);
    if (issue.id.endsWith('_not_sure')) {
      setShowNaturalInput(true);
    } else {
      setShowNaturalInput(false);
    }

    try {
      const res = await api.getIssueQuestions(issue.id);
      setDiagnosticQuestions(res.questions || []);
      setEvidenceRequirements(res.evidence_requirements || []);

      // Reset answers map for new questions
      const initialAnswers = {};
      (res.questions || []).forEach((q) => {
        if (q.options && q.options.length > 0) {
          initialAnswers[q.id] = q.options[0];
        } else {
          initialAnswers[q.id] = '';
        }
      });
      setQuestionAnswers(initialAnswers);
    } catch (err) {
      console.warn('Failed to load questions:', err);
    }
  };

  // AI Classification for natural language / "I'm not sure"
  const handleRunAiClassification = async () => {
    if (!userNaturalText.trim()) return;
    setIsClassifying(true);
    try {
      const res = await api.classifyIssue(resolvedCategoryId, userNaturalText);
      setAiSuggestion(res);
      if (res.matched_issue_id) {
        const found = availableIssues.find((i) => i.id === res.matched_issue_id);
        if (found) {
          handleSelectIssue(found);
        }
      }
    } catch (err) {
      console.warn('AI classification failed:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  // Answer change handler
  const handleAnswerChange = (qId, value) => {
    setQuestionAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  // File upload simulation
  const handleSimulatedUpload = (reqTitle) => {
    const newFile = {
      id: `f-${Date.now()}`,
      name: `${reqTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Upload.jpg`,
      type: 'photo',
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      reqId: reqTitle
    };
    setUploadedFiles((prev) => [...prev, newFile]);
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Submit Claim
  const handleSubmitClaim = async () => {
    setIsSubmitting(true);

    const claimNumber = `WE-${Math.floor(100000 + Math.random() * 900000)}`;

    const newClaim = {
      id: claimNumber,
      claim_id: claimNumber,
      customer_id: 'usr-cust-1',
      protection_id: selectedProtection?.id,
      brand: selectedProtection?.brand || 'Verified Brand',
      product_name: selectedProtection?.productName || selectedProtection?.product_name || 'Protected Item',
      model: selectedProtection?.model || selectedProtection?.modelNumber || 'Standard Model',
      category: selectedProtection?.category || 'General',
      protection_type: isInsurance ? 'Insurance' : 'Warranty',
      claim_type: isInsurance ? 'Insurance Claim' : 'Warranty Service Claim',
      issue_category: selectedIssue?.name || 'General Issue',
      issue_id: selectedIssue?.id,
      incident_date: incidentDate,
      problem_description: additionalRemarks || userNaturalText || `${selectedIssue?.name} reported by customer.`,
      diagnostic_answers: questionAnswers,
      preferred_resolution: preferredResolution,
      claimed_amount: selectedProtection?.price || selectedProtection?.sum_insured || 0,
      status: 'UNDER_REVIEW',
      review_notes: 'Initial diagnostics received. Validated against product taxonomy.',
      assigned_company_id: selectedProtection?.company_id || selectedProtection?.companyId,
      assigned_company_name: selectedProtection?.brand,
      documents: uploadedFiles.map((f) => f.name),
      created_at: new Date().toISOString(),
      timeline: [
        {
          id: `ev-${Date.now()}`,
          stage: 'Claim Created',
          status: 'SUBMITTED',
          date: new Date().toISOString().split('T')[0],
          note: `Claim ${claimNumber} created for ${selectedProtection?.brand} ${selectedProtection?.productName}. Diagnostic questions verified.`
        }
      ]
    };

    try {
      if (onAddClaim) {
        await onAddClaim(newClaim);
      } else {
        await api.createClaim(newClaim);
      }
      setCreatedClaimId(claimNumber);
      setCurrentStep('success');
    } catch (err) {
      console.error('Claim submission error:', err);
      alert('Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Modal Header ─── */}
        <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '0.65rem',
              background: '#eff6ff',
              color: '#0066cc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem', margin: 0, color: '#0f172a' }}>
                File a Protection Claim
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.1rem 0 0' }}>
                Category-aware diagnostics & automated manufacturer dispatch
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ─── Step Breadcrumb Indicator ─── */}
        {currentStep !== 'success' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '0.76rem',
            fontWeight: 700
          }}>
            {[
              { id: 'select_item', label: '1. Select Product' },
              { id: 'select_issue', label: "2. What's Wrong?" },
              { id: 'questions', label: '3. Diagnostics' },
              { id: 'evidence', label: '4. Evidence' },
              { id: 'summary', label: '5. Review' }
            ].map((s, idx) => {
              const isCurrent = currentStep === s.id;
              const isPassed =
                (currentStep === 'select_issue' && idx === 0) ||
                (currentStep === 'questions' && idx <= 1) ||
                (currentStep === 'evidence' && idx <= 2) ||
                (currentStep === 'summary' && idx <= 3);

              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: isCurrent ? '#0066cc' : isPassed ? '#15803d' : '#94a3b8'
                  }}
                >
                  {isPassed ? <CheckCircle2 size={14} color="#15803d" /> : null}
                  <span>{s.label}</span>
                  {idx < 4 && <span style={{ color: '#cbd5e1', marginLeft: '0.4rem' }}>•</span>}
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {/* ─── STEP 1: Select Protection ─── */}
          {currentStep === 'select_item' && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Which product or policy are you claiming for?
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
                WarrantyEase will tailor the diagnostic questionnaire specifically to this product.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {protections.map((p) => {
                  const isSelected = selectedProtection?.id === p.id;
                  const isIns = p.protectionType === 'Insurance' || p.category?.toLowerCase().includes('insurance');

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProtection(p);
                        loadIssuesForProduct(p);
                      }}
                      style={{
                        padding: '1rem',
                        borderRadius: '0.85rem',
                        border: isSelected ? '2px solid #0066cc' : '1px solid #e2e8f0',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '0.65rem',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <BrandLogoIcon brand={p.brand} domain={p.logoDomain} size={28} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{p.brand}</strong>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.45rem',
                              borderRadius: '10px',
                              background: isIns ? '#ecfdf5' : '#e0f2fe',
                              color: isIns ? '#059669' : '#0284c7'
                            }}>
                              {p.category || 'Product'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                            {p.productName || p.product_name || p.model}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                            SN / Policy #: <span style={{ fontFamily: 'monospace' }}>{p.serialNumber || p.policyNumber || 'Verified'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '20px',
                          background: '#f0fdf4',
                          color: '#15803d'
                        }}>
                          {p.status || 'Active'}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Expires: {p.expiryDate || p.expiry_date || '2027'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedProtection && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.85rem',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} color="#0066cc" />
                    <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                      Identified Category: <strong>{selectedProtection.category}</strong> ({selectedProtection.brand})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>
                    ✓ Dynamic Template Ready
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2: What's Wrong? (Category-Aware Issues) ─── */}
          {currentStep === 'select_issue' && (
            <div>
              {/* Product Spotlight Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <BrandLogoIcon brand={selectedProtection?.brand} size={24} />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Selected Product:
                    </span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedProtection?.brand} {selectedProtection?.productName || selectedProtection?.product_name || selectedProtection?.model}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep('select_item')}
                  style={{ fontSize: '0.75rem', color: '#0066cc', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Change Product
                </button>
              </div>

              {isInsurance ? (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                    What type of claim are you filing?
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem' }}>
                    Select the claim reason for your {selectedProtection?.brand || 'insurance'} policy. Questions and required documents will adapt automatically.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                    What issue are you experiencing?
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem' }}>
                    Select the issue affecting your {selectedProtection?.brand} {selectedProtection?.productName && selectedProtection.productName.length > 2 && selectedProtection.productName !== 'fgdg' ? selectedProtection.productName : selectedProtection?.category || 'product'}.
                  </p>
                </div>
              )}

              {/* Natural language "I'm not sure" assistant */}
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.85rem',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={15} color="#2563eb" /> Not sure what to select? Describe it in your own words:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNaturalInput(!showNaturalInput)}
                    style={{ fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    {showNaturalInput ? 'Hide Assistant' : 'Use AI Symptom Assistant'}
                  </button>
                </div>

                {showNaturalInput && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder={isInsurance ? "e.g. Hospitalization for surgery at Apollo Hospital..." : "e.g. Machine shakes violently and vibrates loudly when spinning..."}
                      value={userNaturalText}
                      onChange={(e) => setUserNaturalText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRunAiClassification()}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.55rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem'
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleRunAiClassification}
                      disabled={isClassifying || !userNaturalText.trim()}
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem', flexShrink: 0 }}
                    >
                      {isClassifying ? <Loader2 size={14} className="spin-animation" /> : 'Find Issue'}
                    </button>
                  </div>
                )}

                {aiSuggestion && (
                  <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.75rem', background: '#ffffff', borderRadius: '0.6rem', border: '1px solid #93c5fd' }}>
                    <span style={{ fontSize: '0.78rem', color: '#1e3a8a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Sparkles size={13} color="#2563eb" /> AI Match:
                    </span>{' '}
                    <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 800 }}>
                      {aiSuggestion.issue_name}
                    </span>{' '}
                    <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                      ({Math.round(aiSuggestion.confidence * 100)}% match)
                    </span>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                      {aiSuggestion.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Issue Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {availableIssues.map((issue) => {
                  const isSelected = selectedIssue?.id === issue.id;

                  return (
                    <div
                      key={issue.id}
                      onClick={() => handleSelectIssue(issue)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '0.75rem',
                        border: isSelected ? '2px solid #0066cc' : '1px solid #e2e8f0',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.45rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.88rem', color: isSelected ? '#0066cc' : '#0f172a', lineHeight: 1.3 }}>
                          {issue.name}
                        </strong>
                        {isSelected && <CheckCircle2 size={16} color="#0066cc" style={{ flexShrink: 0 }} />}
                      </div>
                      <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                        {issue.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── STEP 3: Dynamic Follow-Up Diagnostic Questions ─── */}
          {currentStep === 'questions' && (
            <div>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: '0.5rem',
                  background: isInsurance ? '#ecfdf5' : '#eff6ff',
                  color: isInsurance ? '#059669' : '#0066cc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isInsurance ? <ShieldCheck size={18} /> : <Wrench size={18} />}
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    {isInsurance ? 'Selected Claim Category:' : 'Diagnosing Issue:'}
                  </span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedIssue?.name}
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                {isInsurance ? 'Claim Details & Assessment Questions' : 'Diagnostic Questions'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem' }}>
                {isInsurance
                  ? 'These questions help verify coverage criteria and speed up approval without delay.'
                  : 'These questions help the technician diagnose your machine before arriving with replacement parts.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {diagnosticQuestions.map((q, idx) => {
                  return (
                    <div key={q.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '0.65rem' }}>
                        {idx + 1}. {q.question}
                      </label>

                      {q.type === 'choice' && q.options && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {q.options.map((opt) => (
                            <label
                              key={opt}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.82rem',
                                color: '#334155',
                                cursor: 'pointer',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '0.45rem',
                                background: questionAnswers[q.id] === opt ? '#eff6ff' : 'transparent'
                              }}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={opt}
                                checked={questionAnswers[q.id] === opt}
                                onChange={() => handleAnswerChange(q.id, opt)}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {q.type === 'text' && (
                        <input
                          type="text"
                          placeholder="Type your answer..."
                          value={questionAnswers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.55rem',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.82rem'
                          }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Additional remarks */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>
                    Additional description or remarks (Optional):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any other details about when this happened or what you noticed..."
                    value={additionalRemarks}
                    onChange={(e) => setAdditionalRemarks(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.55rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4: Tailored Evidence Checklist ─── */}
          {currentStep === 'evidence' && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                Required Evidence & Documents
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem' }}>
                Upload the evidence requested for <strong>{selectedIssue?.name}</strong>. Clear photos speed up approval without phone calls.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {evidenceRequirements.map((req) => {
                  const hasMatchingFile = uploadedFiles.some((f) => f.reqId === req.title || f.reqId === req.id || f.type === req.type);

                  return (
                    <div
                      key={req.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flex: 1 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '0.5rem',
                          background: hasMatchingFile ? '#ecfdf5' : '#f8fafc',
                          color: hasMatchingFile ? '#16a34a' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {hasMatchingFile ? <CheckCircle2 size={18} /> : <Camera size={18} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{req.title}</strong>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.45rem',
                              borderRadius: '4px',
                              background: req.is_required ? '#fef2f2' : '#f1f5f9',
                              color: req.is_required ? '#dc2626' : '#64748b'
                            }}>
                              {req.is_required ? 'Required' : 'Optional'}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                            {req.description || 'Upload clear image or document'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleSimulatedUpload(req.title)}
                        style={{ fontSize: '0.76rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Upload size={13} />
                        <span>Upload File</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Uploaded Files Preview */}
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
                  Attached Files ({uploadedFiles.length})
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.55rem',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.76rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: '#334155'
                      }}
                    >
                      <Paperclip size={13} color="#0066cc" />
                      <span style={{ fontWeight: 600 }}>{file.name}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>({file.size})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0 2px' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 5: Claim Summary Confirmation ─── */}
          {currentStep === 'summary' && (
            <div>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.85rem',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <CheckCircle2 size={24} color="#0066cc" />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                    Ready to Dispatch Claim
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#1e40af', margin: '0.15rem 0 0' }}>
                    Review your diagnostic details below before routing to {selectedProtection?.brand} official service desk.
                  </p>
                </div>
              </div>

              {/* Product & Issue Summary Box */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.85rem',
                padding: '1.15rem',
                marginBottom: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Claimed Device</span>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedProtection?.brand} {selectedProtection?.productName || selectedProtection?.product_name || selectedProtection?.model}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Serial / IMEI: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{selectedProtection?.serialNumber || 'Verified'}</span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '20px',
                    background: '#f0fdf4',
                    color: '#15803d'
                  }}>
                    Warranty Active
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block', fontWeight: 600 }}>
                      {isInsurance ? 'Claim Category' : 'Identified Issue'}
                    </span>
                    <strong style={{ color: '#0f172a' }}>{selectedIssue?.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>
                      Preferred Resolution
                    </span>
                    <select
                      value={preferredResolution}
                      onChange={(e) => setPreferredResolution(e.target.value)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        borderRadius: '0.45rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#0066cc',
                        background: '#ffffff',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                    >
                      {getResolutionOptions().map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Diagnostic Answers Preview */}
                <div style={{ background: '#f8fafc', borderRadius: '0.65rem', padding: '0.75rem', fontSize: '0.78rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    Diagnostic Responses:
                  </span>
                  {Object.entries(questionAnswers).map(([qid, ans], i) => (
                    <div key={qid} style={{ marginBottom: '0.25rem', color: '#334155' }}>
                      • <strong>Question {i + 1}:</strong> {ans || 'Not specified'}
                    </div>
                  ))}
                  {additionalRemarks && (
                    <div style={{ marginTop: '0.35rem', color: '#475569', fontStyle: 'italic' }}>
                      Remarks: "{additionalRemarks}"
                    </div>
                  )}
                </div>

                {/* Evidence Attached */}
                <div style={{ fontSize: '0.78rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                    Evidence Files Attached:
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {uploadedFiles.map((f) => (
                      <span key={f.id} style={{ background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                        ✓ {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legal Declaration */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                />
                <span>I certify that the information provided and attached evidence are accurate.</span>
              </label>
            </div>
          )}

          {/* ─── STEP 6: Success Confirmation ─── */}
          {currentStep === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0066cc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Claim Successfully Submitted
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0 0.5rem' }}>
                Ticket ID: {createdClaimId}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '460px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                Your claim for <strong>{selectedProtection?.brand} {selectedProtection?.productName || selectedProtection?.product_name}</strong> has been logged.
                The brand service team has received your diagnostic report and will update your ticket within 24 hours.
              </p>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.85rem',
                padding: '1rem',
                maxWidth: '440px',
                margin: '0 auto 1.5rem',
                textAlign: 'left',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Status:</span>
                  <span style={{ fontWeight: 800, color: '#0066cc' }}>UNDER REVIEW</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Issue:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedIssue?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Estimated Response:</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>Within 24 Business Hours</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
                >
                  Close
                </button>
                {onTrackClaim && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      onClose();
                      onTrackClaim({ id: createdClaimId });
                    }}
                    style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
                  >
                    Track Claim Status
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Modal Footer Navigation ─── */}
        {currentStep !== 'success' && (
          <div className="modal-footer" style={{ justifyContent: 'space-between', borderTop: '1px solid #f1f5f9' }}>
            {currentStep !== 'select_item' ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (currentStep === 'select_issue') setCurrentStep('select_item');
                  else if (currentStep === 'questions') setCurrentStep('select_issue');
                  else if (currentStep === 'evidence') setCurrentStep('questions');
                  else if (currentStep === 'summary') setCurrentStep('evidence');
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            )}

            <div>
              {currentStep === 'select_item' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep('select_issue')}
                  disabled={!selectedProtection}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <span>Select Issues</span>
                  <ArrowRight size={14} />
                </button>
              )}

              {currentStep === 'select_issue' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    if (selectedIssue) {
                      await handleSelectIssue(selectedIssue);
                      setCurrentStep('questions');
                    }
                  }}
                  disabled={!selectedIssue}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <span>Answer Diagnostics</span>
                  <ArrowRight size={14} />
                </button>
              )}

              {currentStep === 'questions' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep('evidence')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <span>Attach Evidence</span>
                  <ArrowRight size={14} />
                </button>
              )}

              {currentStep === 'evidence' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep('summary')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <span>Review Claim Summary</span>
                  <ArrowRight size={14} />
                </button>
              )}

              {currentStep === 'summary' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitClaim}
                  disabled={isSubmitting || !declarationAccepted}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="spin-animation" />
                      <span>Submitting Claim...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Submit Claim Ticket</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
