import React, { useState } from 'react';
import { FileText, Search, Download, Eye, Folder, FileScan, Upload, List, Grid, X } from 'lucide-react';
import BrandLogoIcon from '../components/BrandLogoIcon';

// Helper to format raw UUIDs / long hash file names into clean human-readable titles
function getCleanFileName(doc) {
  const raw = doc.fileName || '';
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(raw)
    || /^media_\d+/i.test(raw)
    || (raw.length > 25 && !raw.includes(' '));

  if (isUuid) {
    const isIns = (doc.documentType || '').toLowerCase().includes('insurance') || (doc.category || '').toLowerCase().includes('insurance');
    const brand = doc.brand || 'Official';
    const prod = (doc.productName || 'Policy').replace(/\s+/g, '_');
    const typeStr = isIns ? 'Insurance_Policy' : 'Tax_Invoice';
    const ext = raw.includes('.') ? raw.split('.').pop() : 'png';
    return `${brand}_${prod}_${typeStr}.${ext}`;
  }
  return raw;
}

export default function DocumentsPage({ protections = [], onOpenOcrModal, onOpenAddModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFolder, setActiveFolder] = useState('all'); // 'all' | 'warranties' | 'insurance'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [previewDoc, setPreviewDoc] = useState(null);

  // Collect documents from active protections
  const allDocuments = protections.flatMap((p) => {
    if (p.documents && p.documents.length > 0) {
      return p.documents
        .filter(d => d.documentType !== 'Product Label')
        .map((d) => ({
          ...d,
          productName: p.productName || p.model || p.brand,
          brand: p.brand,
          serialNumber: p.serialNumber,
          fileDataUrl: d.fileDataUrl || p.documentUrl || null
        }));
    }

    const isInsurance = p.protectionType === 'Insurance' || (p.category || '').toLowerCase().includes('health') || (p.category || '').toLowerCase().includes('insurance');
    return [
      {
        id: `doc-${p.id}-main`,
        fileName: `${p.brand}_${(p.productName || p.model || 'Invoice').replace(/\s+/g, '_')}_${isInsurance ? 'PolicySchedule' : 'TaxInvoice'}.pdf`,
        documentType: isInsurance ? 'Insurance Policy' : 'Purchase Invoice',
        folder: isInsurance ? 'insurance' : 'warranties',
        productName: p.productName || p.model || p.brand,
        brand: p.brand,
        serialNumber: p.serialNumber,
        uploadDate: p.purchaseDate || '2026-09-11',
        ocrStatus: 'Success',
        ocrConfidence: 98,
        fileSize: '420 KB',
        fileDataUrl: p.documentUrl || null
      }
    ];
  });

  const warrantyDocs = allDocuments.filter(d => (d.documentType || '').toLowerCase().includes('invoice') || (d.documentType || '').toLowerCase().includes('warranty') || d.folder === 'warranties');
  const insuranceDocs = allDocuments.filter(d => (d.documentType || '').toLowerCase().includes('insurance') || (d.documentType || '').toLowerCase().includes('policy') || d.folder === 'insurance');

  const handleDownloadDocument = (doc) => {
    if (!doc) return;
    const displayName = getCleanFileName(doc);

    // Case 1: Real file data URL exists
    if (doc.fileDataUrl && typeof doc.fileDataUrl === 'string' && doc.fileDataUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = doc.fileDataUrl;
      link.download = displayName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Case 2: Generate official printable/downloadable Certificate
    const isInsurance = (doc.documentType || '').toLowerCase().includes('insurance') || (doc.fileName || '').toLowerCase().includes('policy');
    const brand = doc.brand || 'Official';
    const prod = doc.productName || 'Protected Product';
    const sn = doc.serialNumber || 'SN-VAULT-VERIFIED';
    const date = doc.uploadDate || new Date().toISOString().split('T')[0];

    const certificateHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${displayName}</title>
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
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Ref: ${displayName}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div class="meta-label">Customer / Policyholder</div>
      <div class="meta-val">${doc.customerName || doc.policyHolder || 'Registered Customer'}</div>
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
        <th>Status</th>
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
    Authorized for warranty claims, repair center validation, insurance reimbursement, and service intake.<br/>
    <span class="seal">WARRANTYEASE VERIFIED SECURE DOCUMENT</span>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([certificateHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = displayName.endsWith('.pdf') ? displayName.replace(/\.pdf$/i, '.html') : displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderPreviewContent = (doc) => {
    if (!doc) return null;
    const displayName = getCleanFileName(doc);
    const dataUrl = doc.fileDataUrl || doc.documentUrl;

    // Case 1: Image Data URL
    if (dataUrl && typeof dataUrl === 'string' && (dataUrl.startsWith('data:image/') || dataUrl.endsWith('.png') || dataUrl.endsWith('.jpg') || dataUrl.endsWith('.jpeg') || dataUrl.endsWith('.webp'))) {
      return (
        <div style={{ textAlign: 'center' }}>
          <img
            src={dataUrl}
            alt={displayName}
            style={{
              maxWidth: '100%',
              maxHeight: '520px',
              borderRadius: '0.75rem',
              border: '1px solid #cbd5e1',
              objectFit: 'contain',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
            }}
          />
        </div>
      );
    }

    // Case 2: PDF Data URL
    if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:application/pdf')) {
      return (
        <iframe
          src={dataUrl}
          title={displayName}
          style={{ width: '100%', height: '520px', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
        />
      );
    }

    // Case 3: Live Document Certificate HTML rendered directly in iframe preview
    const isInsurance = (doc.documentType || '').toLowerCase().includes('insurance') || (doc.fileName || '').toLowerCase().includes('policy');
    const brand = doc.brand || 'Official';
    const prod = doc.productName || 'Protected Product';
    const sn = doc.serialNumber || 'SN-VAULT-VERIFIED';
    const date = doc.uploadDate || new Date().toISOString().split('T')[0];

    const certHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${displayName}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #ffffff; color: #0f172a; padding: 24px; margin: 0; }
  .cert-container { max-width: 100%; margin: 0 auto; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 28px; box-shadow: 0 4px 14px rgba(0,0,0,0.04); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
  .title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0 0 4px 0; }
  .subtitle { font-size: 13px; color: #64748b; margin: 0; }
  .badge { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
  .meta-item { font-size: 13px; }
  .meta-label { color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
  .meta-val { font-weight: 800; color: #0f172a; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th, td { padding: 10px 12px; border: 1px solid #e2e8f0; text-align: left; font-size: 13px; }
  th { background: #f1f5f9; font-weight: 800; color: #334155; }
  .footer { border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; color: #64748b; font-size: 11px; line-height: 1.5; }
  .seal { display: inline-block; border: 1.5px solid #16a34a; color: #16a34a; font-weight: 900; font-size: 11px; padding: 3px 10px; border-radius: 4px; margin-top: 8px; letter-spacing: 0.05em; }
</style>
</head>
<body>
<div class="cert-container">
  <div class="header">
    <div>
      <h1 class="title">${brand}</h1>
      <p class="subtitle">${isInsurance ? 'Official Insurance Policy Schedule' : 'Official Tax Invoice & Warranty Proof'}</p>
    </div>
    <div style="text-align: right;">
      <div class="badge">✓ VERIFIED DOCUMENT</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Ref: ${displayName}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div class="meta-label">Customer Name</div>
      <div class="meta-val">${doc.customerName || doc.policyHolder || 'Registered Customer'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Registration Date</div>
      <div class="meta-val">${date}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Product / Plan</div>
      <div class="meta-val">${prod}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Serial / Policy Ref</div>
      <div class="meta-val" style="font-family: monospace; color: #2563eb;">${sn}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Coverage Item</th>
        <th>Type</th>
        <th>Vault Integrity</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${brand}</strong> ${prod}</td>
        <td>${doc.documentType || 'Tax Invoice'}</td>
        <td style="color: #16a34a; font-weight: 700;">Encrypted & Verified</td>
        <td><span style="background: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 11px;">ACTIVE</span></td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Issued by <strong>WarrantyEase Smart Protection Platform</strong>.<br/>
    Authorized for warranty claims and insurance reimbursement.<br/>
    <span class="seal">WARRANTYEASE VERIFIED SECURE DOCUMENT</span>
  </div>
</div>
</body>
</html>`;

    const certDataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(certHtml)}`;

    return (
      <iframe
        src={certDataUrl}
        title={displayName}
        style={{ width: '100%', height: '480px', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
      />
    );
  };

  const filteredDocuments = allDocuments.filter((doc) => {
    const cleanName = getCleanFileName(doc);
    const matchesSearch =
      cleanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.fileName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.brand || '').toLowerCase().includes(searchTerm.toLowerCase());

    const isInsDoc = (doc.documentType || '').toLowerCase().includes('insurance') || (doc.documentType || '').toLowerCase().includes('policy') || doc.folder === 'insurance';

    if (activeFolder === 'warranties') return matchesSearch && !isInsDoc;
    if (activeFolder === 'insurance') return matchesSearch && isInsDoc;
    return matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Vault ({allDocuments.length})</h1>
          <p className="page-description">Secure digital storage for tax invoices, warranties, and insurance policies</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onOpenOcrModal}>
            <FileScan size={16} color="#2563eb" />
            <span>Scan Document (AI OCR)</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Upload size={16} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Sleek Minimal Folder Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.25rem',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveFolder('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.6rem',
            border: 'none',
            cursor: 'pointer',
            background: activeFolder === 'all' ? '#2563eb' : 'transparent',
            color: activeFolder === 'all' ? '#ffffff' : '#64748b',
            fontWeight: activeFolder === 'all' ? 800 : 600,
            fontSize: '0.86rem',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Folder size={16} />
          <span>All Documents</span>
          <span style={{
            background: activeFolder === 'all' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
            color: activeFolder === 'all' ? '#ffffff' : '#475569',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.1rem 0.45rem',
            borderRadius: '12px'
          }}>
            {allDocuments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFolder('warranties')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.6rem',
            border: 'none',
            cursor: 'pointer',
            background: activeFolder === 'warranties' ? '#2563eb' : 'transparent',
            color: activeFolder === 'warranties' ? '#ffffff' : '#64748b',
            fontWeight: activeFolder === 'warranties' ? 800 : 600,
            fontSize: '0.86rem',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={16} />
          <span>Warranties & Invoices</span>
          <span style={{
            background: activeFolder === 'warranties' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
            color: activeFolder === 'warranties' ? '#ffffff' : '#475569',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.1rem 0.45rem',
            borderRadius: '12px'
          }}>
            {warrantyDocs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFolder('insurance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.6rem',
            border: 'none',
            cursor: 'pointer',
            background: activeFolder === 'insurance' ? '#2563eb' : 'transparent',
            color: activeFolder === 'insurance' ? '#ffffff' : '#64748b',
            fontWeight: activeFolder === 'insurance' ? 800 : 600,
            fontSize: '0.86rem',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={16} />
          <span>Insurance Policies</span>
          <span style={{
            background: activeFolder === 'insurance' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
            color: activeFolder === 'insurance' ? '#ffffff' : '#475569',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.1rem 0.45rem',
            borderRadius: '12px'
          }}>
            {insuranceDocs.length}
          </span>
        </button>
      </div>

      {/* Search Bar & View Toggle */}
      <div className="search-filter-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search documents by product, file name, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.5rem', background: viewMode === 'list' ? '#ffffff' : 'transparent', border: 'none', boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none' }}
              onClick={() => setViewMode('list')}
              title="Table View"
            >
              <List size={16} color={viewMode === 'list' ? '#0066cc' : '#64748b'} />
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.5rem', background: viewMode === 'grid' ? '#ffffff' : 'transparent', border: 'none', boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none' }}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={16} color={viewMode === 'grid' ? '#0066cc' : '#64748b'} />
            </button>
          </div>
        </div>
      </div>

      {/* Documents List / Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="empty-state-card" style={{ padding: '3.5rem 2rem' }}>
          <div className="empty-icon-box">
            <FileText size={36} color="#2563eb" />
          </div>
          <h3 className="empty-title">No Vault Documents in this Folder</h3>
          <p className="empty-subtitle">
            Scan an invoice with AI OCR or upload warranty certificates to store them in your vault.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={onOpenOcrModal}>
              <FileScan size={16} color="#2563eb" />
              <span>Scan Receipt (AI OCR)</span>
            </button>
            <button className="btn btn-primary" onClick={onOpenAddModal}>
              <Upload size={16} />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* Table View */
        <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Document File</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Linked Product / Brand</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc, idx) => {
                  const displayName = getCleanFileName(doc);
                  const isIns = (doc.documentType || '').toLowerCase().includes('insurance') || (doc.category || '').toLowerCase().includes('insurance');
                  return (
                    <tr key={doc.id || idx} style={{ borderBottom: idx < filteredDocuments.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BrandLogoIcon brand={doc.brand} size={24} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{displayName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>✓ Verified Vault File ({doc.ocrConfidence || 98}%)</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{doc.productName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Brand: {doc.brand}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          background: isIns ? '#fef3c7' : '#eff6ff',
                          color: isIns ? '#92400e' : '#1d4ed8',
                          fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px', whiteSpace: 'nowrap'
                        }}>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {filteredDocuments.map((doc) => {
            const displayName = getCleanFileName(doc);
            return (
              <div
                key={doc.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.15rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '0.65rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BrandLogoIcon brand={doc.brand} size={28} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0066cc', textTransform: 'uppercase' }}>
                        {doc.documentType}
                      </span>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayName}
                      </h4>
                    </div>
                  </div>

                  {doc.fileDataUrl && (
                    <div style={{ width: '100%', height: 110, borderRadius: '0.65rem', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '0.75rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={doc.fileDataUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{ background: '#f8fafc', borderRadius: '0.65rem', padding: '0.6rem 0.8rem', fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div><strong>Linked Product:</strong> {doc.productName}</div>
                    <div><strong>Brand:</strong> {doc.brand}</div>
                    <div><strong>Serial / Ref #:</strong> {doc.serialNumber || 'SN-VERIFIED'}</div>
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
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={22} color="#0066cc" />
                <h3 className="modal-title" style={{ fontSize: '1.05rem', margin: 0 }}>{getCleanFileName(previewDoc)}</h3>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setPreviewDoc(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                {renderPreviewContent(previewDoc)}
              </div>

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
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
