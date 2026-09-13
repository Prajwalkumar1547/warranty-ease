/**
 * WarrantyEase OCR API Client
 * Connects the React frontend to the Python FastAPI OCR backend.
 * 
 * Backend must be running: cd backend && ./start.sh
 * Default URL: http://localhost:8000
 */

const BACKEND_URL = import.meta.env.VITE_OCR_BACKEND_URL || 'http://localhost:8000';

/**
 * Robust fetch that tries BACKEND_URL (e.g. localhost), then 127.0.0.1, then relative proxy.
 */
async function fetchBackend(endpoint, options = {}) {
  const candidates = [BACKEND_URL];
  if (BACKEND_URL.includes('localhost')) {
    candidates.push(BACKEND_URL.replace('localhost', '127.0.0.1'));
  }
  if (!candidates.includes('')) {
    candidates.push(''); // relative URL via Vite dev proxy
  }

  let lastError = null;
  for (const base of candidates) {
    try {
      const url = `${base}${endpoint}`;
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      lastError = err;
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw err;
      }
      // Continue to next candidate
    }
  }
  throw lastError || new Error(`Could not connect to OCR backend at ${BACKEND_URL}`);
}

/**
 * Check if the OCR backend is reachable.
 * @returns {Promise<{ok: boolean, info?: object, error?: string}>}
 */
export async function checkBackendHealth() {
  try {
    const res = await fetchBackend('/health', {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, error: `Backend returned ${res.status}` };
    const data = await res.json();
    return { ok: true, info: data };
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return { ok: false, error: 'Backend health check timed out (5s)' };
    }
    return { ok: false, error: err.message || 'Connection refused' };
  }
}

/**
 * Upload a document file to the OCR backend.
 * Returns extracted text + structured warranty fields.
 * 
 * @param {File} file - The file to scan (JPG, PNG, PDF)
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{success: boolean, raw_text: string, extracted_fields: object, error?: string}>}
 */
export async function runOCR(file, onProgress) {
  if (!file) throw new Error('No file provided to OCR scanner.');

  // Validate client-side before uploading
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: 10 MB.`);
  }
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  const ext = file.name?.split('.').pop()?.toLowerCase() || '';
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
  if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
    throw new Error(`Unsupported file type "${file.type || ext}". Please upload JPG, PNG, or PDF.`);
  }

  if (onProgress) onProgress(10);

  const formData = new FormData();
  formData.append('file', file);

  let res;
  try {
    res = await fetchBackend('/api/ocr', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(120000), // 2 min timeout for slow first OCR
    });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('OCR request timed out. The backend may still be downloading the OCR model (~200 MB). Try again in a minute.');
    }
    // Connection refused = backend not running
    throw new Error(
      'Cannot reach OCR backend. Make sure the backend is running:\n' +
      '  cd backend && ./start.sh\n\n' +
      `Tried: ${BACKEND_URL}/api/ocr\nError: ${err.message}`
    );
  }

  if (onProgress) onProgress(80);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || data.error || `OCR failed with status ${res.status}`);
  }

  if (onProgress) onProgress(100);

  return data;
}

/**
 * Send extracted fields to the AI analysis endpoint.
 * 
 * @param {string} ocrText - Raw OCR text from the document
 * @param {object} extractedFields - Structured fields from OCR
 * @returns {Promise<{success: boolean, analysis: object, error?: string}>}
 */
export async function analyzeWarranty(ocrText, extractedFields) {
  let res;
  try {
    res = await fetchBackend('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ocr_text: ocrText || '',
        extracted_fields: extractedFields || {},
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    // AI analysis is optional — return null without crashing
    console.warn('AI analysis failed (non-fatal):', err.message);
    return { success: false, analysis: null, error: err.message };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.warn('AI analysis returned error:', data);
    return { success: false, analysis: null, error: data.detail || `Status ${res.status}` };
  }

  return await res.json();
}
