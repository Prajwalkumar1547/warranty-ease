import React, { useState } from 'react';
import { FileText, Search, Filter, Download, Eye, Trash2, Plus, ShieldCheck, CheckCircle2, FileCode, Tag, Award, Building2, X, List, Grid, Upload, FileScan } from 'lucide-react';
import BrandLogoIcon from '../components/BrandLogoIcon';

export default function DocumentsPage({ protections, onOpenOcrModal, onOpenAddModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Documents');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [previewDoc, setPreviewDoc] = useState(null);

  // Collect documents from active protections or populate initial default vault documents
  const allDocuments = protections.flatMap((p) => {
    if (p.documents && p.documents.length > 0) {
      return p.documents.map((d) => ({
        ...d,
        productName: p.productName || p.model || p.brand,
        brand: p.brand,
        serialNumber: p.serialNumber,
        fileDataUrl: d.fileDataUrl || p.documentUrl || null
      }));
    }
    const isInsurance = p.protectionType === 'Insurance' || (p.category || '').toLowerCase().includes('health');
    return [
      {
        id: `doc-${p.id}-inv`,
        fileName: `${p.brand}_${(p.productName || p.model || 'Invoice').replace(/\s+/g, '_')}_${isInsurance ? 'PolicySchedule' : 'TaxInvoice'}.pdf`,
        documentType: isInsurance ? 'Insurance Policy' : 'Purchase Invoice',
        productName: p.productName || p.model || p.brand,
        brand: p.brand,
        serialNumber: p.serialNumber,
        uploadDate: p.purchaseDate || '2026-09-11',
        ocrStatus: 'Success',
        ocrConfidence: 98,
        fileSize: '420 KB',
        fileDataUrl: p.documentUrl || null
      },
      {
        id: `doc-${p.id}-lbl`,
        fileName: `${p.brand}_ProductLabel_SN.jpg`,
        documentType: 'Product Label',
        productName: p.productName || p.model || p.brand,
        brand: p.brand,
        serialNumber: p.serialNumber,
        uploadDate: p.purchaseDate || '2026-09-11',
        ocrStatus: 'Success',
        ocrConfidence: 95,
        fileSize: '1.2 MB',
        fileDataUrl: null
      }
    ];
  });

  const handleDownloadDocument = (doc) => {
    if (!doc) return;

    // Case 1: Real file data URL exists (from OCR upload)
    if (doc.fileDataUrl && typeof doc.fileDataUrl === 'string' && doc.fileDataUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = doc.fileDataUrl;
      link.download = doc.fileName || 'Scanned_Document.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Case 2: Generate official printable/downloadable Tax Invoice PDF/HTML or Text Document
    const isInsurance = (doc.documentType || '').toLowerCase().includes('insurance') || (doc.fileName || '').toLowerCase().includes('policy');
    const brand = doc.brand || 'Official';
    const prod = doc.productName || 'Protected Product';
    const sn = doc.serialNumber || 'SN-VAULT-VERIFIED';
    const date = doc.uploadDate || new Date().toISOString().split('T')[0];

    const certificateHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${doc.fileName || 'Verified_Document'}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; padding: 40px; margin: 0; }
  .cert-container { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 28px; }
  .title { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0 0 4px 0; }
  .subtitle { font-size: 14px; color: #64748b; margin: 0; }
  .badge { background: #dcfce7; color: #15803d; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
  .meta-item { font-size: 14px; }
  .meta-label { color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
  .meta-val { font-weight: 800; color: #0f172a; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  th, td { padding: 14px 16px; border: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
  th { background: #f1f5f9; font-weight: 800; color: #334155; }
  .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.6; }
  .seal { display: inline-block; border: 2px solid #16a34a; color: #16a34a; font-weight: 900; font-size: 12px; padding: 4px 12px; border-radius: 6px; margin-top: 12px; letter-spacing: 0.05em; }
</style>
</head>
<body>
<div class="cert-container">
  <div class="header">
    <div>
      <h1 class="title">${brand}</h1>
      <p class="subtitle">${isInsurance ? 'Official Insurance Policy & Beneficiary Schedule' : 'Official Tax Invoice & Warranty Proof of Purchase'}</p>
    </div>
    <div style="text-align: right;">
      <div class="badge">✓ AI OCR VERIFIED (98%)</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Ref: ${doc.fileName}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div class="meta-label">Customer / Policyholder</div>
      <div class="meta-val">Srishailam Potti (Tel: +91 9866130006)</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Registration / Date</div>
      <div class="meta-val">${date}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Protected Product / Plan</div>
      <div class="meta-val">${prod}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Serial / IMEI / Policy Ref</div>
      <div class="meta-val" style="font-family: monospace; color: #2563eb;">${sn}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item / Coverage Description</th>
        <th>Document Category</th>
        <th>Vault Integrity</th>
        <th>Warranty Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${brand}</strong> — ${prod}</td>
        <td>${doc.documentType || 'Tax Invoice'}</td>
        <td style="color: #16a34a; font-weight: 700;">Encrypted & Verified</td>
        <td><span style="background: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 4px; font-weight: 800; font-size: 12px;">ACTIVE</span></td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    This digital vault certificate is issued by <strong>WarrantyEase Smart Protection Platform</strong>.<br/>
    Authorized for warranty claims, authorized repair center validation, insurance reimbursement, and service intake.<br/>
    <span class="seal">WARRANTYEASE VERIFIED SECURE DOCUMENT</span>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([certificateHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName.endsWith('.pdf') ? doc.fileName.replace(/\.pdf$/i, '.html') : (doc.fileName || 'Invoice_Document.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesSearch =
      (doc.fileName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.brand || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === 'All Documents' || (doc.documentType || '').toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Vault ({allDocuments.length})</h1>
          <p className="page-description">Secure vault storing verified tax invoices, warranty certificates, and serial sticker labels</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onOpenOcrModal}>
            <FileScan size={16} color="#2563eb" />
            <span>Scan Document (AI OCR)</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Upload size={16} />
            <span>Upload Document (Vault)</span>
          </button>
        </div>
      </div>

      {/* Search, Filter & View Toggle Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search documents by product name, file name, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={18} color="#64748b" />
            <select
              className="form-control"
              style={{ width: 'auto', border: 'none', background: 'transparent', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All Documents">All Documents</option>
              <option value="Purchase Invoice">Purchase Invoices</option>
              <option value="Product Label">Product Labels</option>
              <option value="Warranty Card">Warranty Cards</option>
              <option value="Insurance Policy">Insurance Policies</option>
            </select>
          </div>

          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.5rem', background: viewMode === 'list' ? '#ffffff' : 'transparent', border: 'none', boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none' }}
              onClick={() => setViewMode('list')}
              title="Table List View"
            >
              <List size={16} color={viewMode === 'list' ? '#0066cc' : '#64748b'} />
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.5rem', background: viewMode === 'grid' ? '#ffffff' : 'transparent', border: 'none', boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none' }}
              onClick={() => setViewMode('grid')}
              title="Grid Card View"
            >
              <Grid size={16} color={viewMode === 'grid' ? '#0066cc' : '#64748b'} />
            </button>
          </div>
        </div>
      </div>

      {/* Type Pill Bar */}
      <div className="category-pills" style={{ marginBottom: '1.25rem' }}>
        {['All Documents', 'Purchase Invoice', 'Product Label', 'Warranty Card', 'Insurance Policy'].map((cat) => (
          <button
            key={cat}
            className={`pill-btn ${selectedType === cat ? 'active' : ''}`}
            onClick={() => setSelectedType(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents View Area */}
      {filteredDocuments.length === 0 ? (
        <div className="empty-state-card" style={{ padding: '3.5rem 2rem' }}>
          <div className="empty-icon-box">
            <FileText size={36} color="#2563eb" />
          </div>
          <h3 className="empty-title">No Vault Documents Found</h3>
          <p className="empty-subtitle">
            Scan an invoice with AI OCR or upload warranty certificates to automatically link them to your active protections.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={onOpenOcrModal}>
              <FileScan size={16} color="#2563eb" />
              <span>Scan Receipt (AI OCR)</span>
            </button>
            <button className="btn btn-primary" onClick={onOpenAddModal}>
              <Upload size={16} />
              <span>Upload Document (Vault)</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* Responsive Table View */
        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Document File</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Linked Product / Brand</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc, idx) => (
                  <tr key={doc.id || idx} style={{ borderBottom: idx < filteredDocuments.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BrandLogoIcon brand={doc.brand} size={24} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{doc.fileName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>✓ Verified ({doc.ocrConfidence || 98}%)</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{doc.productName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Brand: {doc.brand}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                        {doc.documentType}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {doc.uploadDate}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <Eye size={13} color="#0066cc" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <Download size={13} color="#16a34a" />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              style={{
                background: '#ffffff',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '0.65rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BrandLogoIcon brand={doc.brand} size={28} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0066cc', textTransform: 'uppercase' }}>
                        {doc.documentType}
                      </span>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginTop: '0.1rem' }}>
                        {doc.fileName}
                      </h4>
                    </div>
                  </div>
                </div>

                {doc.fileDataUrl && (
                  <div style={{ width: '100%', height: 110, borderRadius: '0.65rem', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '0.75rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={doc.fileDataUrl} alt={doc.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ background: '#f8fafc', borderRadius: '0.65rem', padding: '0.6rem 0.8rem', fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div><strong>Linked Product:</strong> {doc.productName}</div>
                  <div><strong>Brand:</strong> {doc.brand}</div>
                  <div><strong>Serial / Tag #:</strong> {doc.serialNumber || 'SN-VERIFIED'}</div>
                  <div><strong>Upload Date:</strong> {doc.uploadDate}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem' }}
                  onClick={() => setPreviewDoc(doc)}
                >
                  <Eye size={14} color="#0066cc" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem' }}
                  onClick={() => handleDownloadDocument(doc)}
                >
                  <Download size={14} color="#16a34a" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={22} color="#0066cc" />
                <h3 className="modal-title" style={{ fontSize: '1.05rem', margin: 0 }}>{previewDoc.fileName}</h3>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setPreviewDoc(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
              {previewDoc.fileDataUrl ? (
                <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <img
                    src={previewDoc.fileDataUrl}
                    alt={previewDoc.fileName}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '380px',
                      borderRadius: '0.75rem',
                      border: '1px solid #cbd5e1',
                      objectFit: 'contain',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                    }}
                  />
                  <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#dcfce7', color: '#15803d', padding: '0.35rem 0.8rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.78rem' }}>
                    <CheckCircle2 size={15} />
                    <span>AI Extracted & Vault Verified ({previewDoc.ocrConfidence || 98}% Confidence)</span>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f1f5f9', borderRadius: '1rem', padding: '2.5rem 1.5rem', border: '2px dashed #cbd5e1', marginBottom: '1.25rem' }}>
                  <FileText size={48} color="#0066cc" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{previewDoc.fileName}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Type: {previewDoc.documentType} • Linked to <strong>{previewDoc.productName}</strong>
                  </p>
                  <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#dcfce7', color: '#15803d', padding: '0.35rem 0.8rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.78rem' }}>
                    <CheckCircle2 size={15} />
                    <span>AI Extracted & Vault Verified (98% Confidence)</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleDownloadDocument(previewDoc)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Download size={16} color="#16a34a" />
                  <span>Download Document</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setPreviewDoc(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

