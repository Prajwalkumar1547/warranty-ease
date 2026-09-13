/**
 * WarrantyEase Client Data & API Service
 * 
 * Provides unified, asynchronous access to:
 * - Protections (Warranties, Extended Warranties, Insurance, AMC, etc.)
 * - Claims (WE-000001 format) & Claim Timeline Events
 * - Claim Messaging (Customer <-> WarrantyEase <-> Company)
 * - Companies Directory
 * - Admin Metrics & Audit Logs
 * - Notifications
 * - User Role Switching (Customer, Admin, Company)
 * 
 * Communicates with FastAPI backend (/api/...) and falls back transparently
 * to local persistence if offline or hosted statically on GitHub Pages.
 */

import {
  TAXONOMY_CATEGORIES,
  ISSUES_BY_CATEGORY,
  QUESTIONS_BY_ISSUE,
  EVIDENCE_BY_ISSUE,
  resolveClientProductCategory
} from '../data/claimTaxonomy';

const API_BASE = '/api';

// Helper to safely execute fetch with fallback
async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Return null on failure to trigger local store fallback
    return null;
  }
}

// ─── Local Store Helpers (Fallback) ───────────────────────────
const STORAGE_KEYS = {
  PROTECTIONS: 'warranty_ease_protections',
  CLAIMS: 'warranty_ease_claims',
  NOTIFICATIONS: 'warranty_ease_notifications',
  USER: 'warranty_ease_active_user',
  COMPANIES: 'warranty_ease_companies',
};

export const api = {
  // ─── Authentication & Role ──────────────────────────────────
  async getCurrentUser() {
    const remote = await apiRequest('/auth/me');
    if (remote) return remote;
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : {
      id: 'usr-cust-1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      role: 'customer',
      company_id: null,
    };
  },

  async switchRole(role, companyId = null, companyName = null) {
    const payload = { role, company_id: companyId, company_name: companyName };
    const remote = await apiRequest('/auth/switch-role', 'POST', payload);
    const updated = remote || {
      id: role === 'admin' ? 'usr-admin' : role === 'company' ? 'usr-boat-rep' : 'usr-cust-1',
      name: role === 'admin' ? 'WarrantyEase Operator' : role === 'company' ? `${companyName || 'boAt'} Service Lead` : 'Rahul Sharma',
      email: role === 'admin' ? 'admin@warrantyease.app' : role === 'company' ? `support@${(companyName || 'boat').toLowerCase().replace(/\s+/g, '')}.com` : 'rahul.sharma@example.com',
      role,
      company_id: companyId,
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    return updated;
  },

  // ─── Protections ────────────────────────────────────────────
  async getProtections() {
    const remote = await apiRequest('/protections');
    if (Array.isArray(remote) && remote.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PROTECTIONS, JSON.stringify(remote));
      return remote;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.PROTECTIONS);
    return saved ? JSON.parse(saved) : [];
  },

  async addProtection(record) {
    const remote = await apiRequest('/protections', 'POST', record);
    const item = remote || {
      ...record,
      id: record.id || `prot-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: record.status || 'Active',
      verification_status: record.verification_status || 'Verified',
    };
    const saved = localStorage.getItem(STORAGE_KEYS.PROTECTIONS);
    const list = saved ? JSON.parse(saved) : [];
    const updated = [item, ...list.filter(p => p.id !== item.id)];
    localStorage.setItem(STORAGE_KEYS.PROTECTIONS, JSON.stringify(updated));
    return item;
  },

  async deleteProtection(id) {
    await apiRequest(`/protections/${id}`, 'DELETE');
    const saved = localStorage.getItem(STORAGE_KEYS.PROTECTIONS);
    if (saved) {
      const list = JSON.parse(saved).filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PROTECTIONS, JSON.stringify(list));
    }
    return true;
  },

  // ─── Claims ─────────────────────────────────────────────────
  async getClaims(customerId = null, companyId = null) {
    let query = '';
    if (customerId) query = `?customer_id=${encodeURIComponent(customerId)}`;
    else if (companyId) query = `?company_id=${encodeURIComponent(companyId)}`;

    const remote = await apiRequest(`/claims${query}`);
    if (Array.isArray(remote) && remote.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(remote));
      return remote;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    let list = saved ? JSON.parse(saved) : [];
    if (companyId) {
      list = list.filter(c => c.company_id === companyId || (c.brand && c.brand.toLowerCase() === companyId.replace('comp-', '').toLowerCase()));
    }
    return list;
  },

  async getClaimById(id) {
    const remote = await apiRequest(`/claims/${id}`);
    if (remote) return remote;
    const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    if (saved) {
      const list = JSON.parse(saved);
      return list.find(c => c.id === id) || null;
    }
    return null;
  },

  async createClaim(claimData) {
    const remote = await apiRequest('/claims', 'POST', claimData);
    if (remote) {
      const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([remote, ...list]));
      return remote;
    }

    // Client-side fallback generation
    const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    const list = saved ? JSON.parse(saved) : [];
    const claimId = `WE-${String(list.length + 1).padStart(6, '0')}`;
    const now = new Date().toISOString();

    const localClaim = {
      ...claimData,
      id: claimId,
      status: 'SUBMITTED',
      created_at: now,
      updated_at: now,
      events: [
        {
          id: `evt-${Date.now()}`,
          claim_id: claimId,
          actor_name: claimData.customer_name || 'Rahul Sharma',
          actor_role: 'customer',
          event_type: 'STATUS_CHANGE',
          old_status: null,
          new_status: 'SUBMITTED',
          description: `Claim ${claimId} created by customer.`,
          created_at: now,
        }
      ],
      messages: [],
      documents: [],
    };

    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify([localClaim, ...list]));
    return localClaim;
  },

  async updateClaimStatus(claimId, newStatus, actorName = 'WarrantyEase Operator', actorRole = 'admin', notes = '', serviceCentreInfo = '') {
    const payload = {
      status: newStatus,
      actor_name: actorName,
      actor_role: actorRole,
      notes,
      service_centre_info: serviceCentreInfo,
    };
    const remote = await apiRequest(`/claims/${claimId}/status`, 'POST', payload);
    if (remote) {
      const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
      if (saved) {
        const list = JSON.parse(saved).map(c => c.id === claimId ? remote : c);
        localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(list));
      }
      return remote;
    }

    // Local fallback update
    const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    if (saved) {
      const list = JSON.parse(saved);
      const updatedList = list.map(c => {
        if (c.id === claimId) {
          const now = new Date().toISOString();
          const newEvent = {
            id: `evt-${Date.now()}`,
            claim_id: claimId,
            actor_name: actorName,
            actor_role: actorRole,
            event_type: 'STATUS_CHANGE',
            old_status: c.status,
            new_status: newStatus,
            description: `Status updated from ${c.status} to ${newStatus}. ${notes}`.trim(),
            created_at: now,
          };
          return {
            ...c,
            status: newStatus,
            internal_notes: notes || c.internal_notes,
            service_centre_info: serviceCentreInfo || c.service_centre_info,
            updated_at: now,
            events: [...(c.events || []), newEvent],
          };
        }
        return c;
      });
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updatedList));
      return updatedList.find(c => c.id === claimId);
    }
    return null;
  },

  async addClaimMessage(claimId, senderId, senderName, senderRole, message) {
    const payload = { sender_id: senderId, sender_name: senderName, sender_role: senderRole, message };
    const remote = await apiRequest(`/claims/${claimId}/messages`, 'POST', payload);
    const newMsg = remote || {
      id: `msg-${Date.now()}`,
      claim_id: claimId,
      sender_id: senderId,
      sender_name: senderName,
      sender_role: senderRole,
      message,
      created_at: new Date().toISOString(),
    };

    const saved = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    if (saved) {
      const list = JSON.parse(saved).map(c => {
        if (c.id === claimId) {
          return {
            ...c,
            messages: [...(c.messages || []), newMsg],
          };
        }
        return c;
      });
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(list));
    }
    return newMsg;
  },

  // ─── Admin Metrics & Logs ────────────────────────────────────
  async getAdminStats() {
    const remote = await apiRequest('/admin/stats');
    if (remote) return remote;

    // Fallback calculation from local state
    const prots = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROTECTIONS) || '[]');
    const claims = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLAIMS) || '[]');
    return {
      total_users: 4,
      total_protections: prots.length,
      active_warranties: prots.filter(p => (p.protection_type === 'Warranty' || p.protectionType === 'Warranty') && p.status === 'Active').length,
      expiring_soon: prots.filter(p => p.status === 'Expiring Soon').length,
      total_insurance: prots.filter(p => p.protection_type === 'Insurance' || p.protectionType === 'Insurance').length,
      total_claims: claims.length,
      pending_claims: claims.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED'].includes(c.status)).length,
      approved_claims: claims.filter(c => c.status === 'APPROVED').length,
      rejected_claims: claims.filter(c => c.status === 'REJECTED').length,
      resolved_claims: claims.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length,
      total_companies: 6,
      brand_distribution: [
        { brand: 'boAt', count: 2 },
        { brand: 'Samsung', count: 2 },
        { brand: 'Star Health', count: 1 },
      ]
    };
  },

  async getAdminUsers() {
    const remote = await apiRequest('/admin/users');
    if (remote) return remote;
    return [
      { id: 'usr-admin', name: 'WarrantyEase Operator', email: 'admin@warrantyease.app', role: 'admin', created_at: '2026-01-01' },
      { id: 'usr-cust-1', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', role: 'customer', created_at: '2026-02-15' },
      { id: 'usr-boat-rep', name: 'boAt Service Lead', email: 'service@boat-lifestyle.com', role: 'company', created_at: '2026-03-01' },
      { id: 'usr-samsung-rep', name: 'Samsung Support Ops', email: 'support@samsung.com', role: 'company', created_at: '2026-03-05' },
    ];
  },

  async getAuditLogs() {
    const remote = await apiRequest('/admin/audit-logs');
    if (remote) return remote;
    return [
      { id: 'aud-1', user_id: 'usr-cust-1', user_role: 'customer', action: 'CREATE_PROTECTION', object_type: 'protection_record', object_id: 'prot-1', details: '{"brand": "boAt"}', created_at: new Date().toISOString() },
      { id: 'aud-2', user_id: 'usr-cust-1', user_role: 'customer', action: 'CREATE_CLAIM', object_type: 'claim', object_id: 'WE-000001', details: '{"issue": "Left ear cup failure"}', created_at: new Date().toISOString() },
    ];
  },

  // ─── Companies ──────────────────────────────────────────────
  async getCompanies() {
    const remote = await apiRequest('/companies');
    if (remote) return remote;
    return [
      { id: 'comp-boat', name: 'boAt', category: 'Audio & Wearables', website: 'https://www.boat-lifestyle.com', support_email: 'support@boat-lifestyle.com', support_phone: '022-6918-1920', claim_method: 'Internal Queue', integration_status: 'Internal Queue' },
      { id: 'comp-samsung', name: 'Samsung', category: 'Electronics & Appliances', website: 'https://www.samsung.com/in', support_email: 'support.india@samsung.com', support_phone: '1800-407-267864', claim_method: 'Internal Queue', integration_status: 'Internal Queue' },
      { id: 'comp-apple', name: 'Apple', category: 'Computers & Mobiles', website: 'https://www.apple.com/in', support_email: 'support@apple.com', support_phone: '000800-100-9009', claim_method: 'Internal Queue', integration_status: 'Internal Queue' },
      { id: 'comp-lg', name: 'LG', category: 'Home Appliances & TVs', website: 'https://www.lg.com/in', support_email: 'serviceindia@lge.com', support_phone: '1800-315-9999', claim_method: 'Internal Queue', integration_status: 'Internal Queue' },
      { id: 'comp-starhealth', name: 'Star Health', category: 'Health Insurance', website: 'https://www.starhealth.in', support_email: 'support@starhealth.in', support_phone: '1800-425-2255', claim_method: 'Internal Queue', integration_status: 'Internal Queue' },
      { id: 'comp-icici', name: 'ICICI Lombard', category: 'Motor & General Insurance', website: 'https://www.icicilombard.com', support_email: 'customersupport@icicilombard.com', support_phone: '1800-2666', claim_method: 'Internal Queue', integration_status: 'Internal Queue' },
    ];
  },

  // ─── Notifications ──────────────────────────────────────────
  async getNotifications(userId = 'usr-cust-1') {
    const remote = await apiRequest(`/notifications?user_id=${encodeURIComponent(userId)}`);
    if (remote) return remote;
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : [
      { id: 'notif-1', user_id: 'usr-cust-1', title: 'Claim WE-000001 Update', message: 'Your boAt claim is currently under review by brand service team.', type: 'claim_update', is_read: 0, link: 'claims', created_at: new Date().toISOString() },
      { id: 'notif-2', user_id: 'usr-cust-1', title: 'Samsung TV Warranty Reminder', message: 'Your warranty expires in 14 days. Review extended coverage options.', type: 'expiry_reminder', is_read: 0, link: 'protections', created_at: new Date().toISOString() },
    ];
  },

  // ─── Claim Issue Taxonomy & Dynamic Questionnaire ──────────
  async getTaxonomyCategories() {
    const remote = await apiRequest('/taxonomy/categories');
    if (remote) return remote;
    return TAXONOMY_CATEGORIES;
  },

  async getTaxonomyIssues(category, productName, model, brand, protectionType) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (productName) params.append('product_name', productName);
    if (model) params.append('model', model);
    if (brand) params.append('brand', brand);
    if (protectionType) params.append('protection_type', protectionType);

    const remote = await apiRequest(`/taxonomy/issues?${params.toString()}`);
    if (remote) return remote;

    const resolvedId = resolveClientProductCategory(category, productName, model, brand, protectionType);
    const issues = ISSUES_BY_CATEGORY[resolvedId] || (resolvedId.startsWith('cat_ins_') ? ISSUES_BY_CATEGORY['cat_ins_general'] : ISSUES_BY_CATEGORY['cat_generic']);
    return {
      resolved_category_id: resolvedId,
      issues
    };
  },

  async getIssueQuestions(issueId) {
    const remote = await apiRequest(`/taxonomy/issues/${encodeURIComponent(issueId)}/questions`);
    if (remote) return remote;

    const questions = QUESTIONS_BY_ISSUE[issueId] || [
      { id: `q_std_1_${issueId}`, question: 'When did this problem first start?', type: 'choice', options: ['Today', 'Past few days', 'Over a week ago', 'Gradually getting worse'], required: true },
      { id: `q_std_2_${issueId}`, question: 'Does it happen every time you use the device?', type: 'choice', options: ['Yes, every single time', 'Intermittent / random', 'Only under heavy load'], required: true }
    ];

    const evidence = EVIDENCE_BY_ISSUE[issueId] || [
      { id: `ev_std_1_${issueId}`, title: 'Photo of product showing issue', type: 'photo', is_required: true, description: 'Clear photo showing the defect or state' },
      { id: `ev_std_2_${issueId}`, title: 'Photo of serial number label', type: 'serial_photo', is_required: true, description: 'Sticker with serial and model' },
      { id: `ev_std_3_${issueId}`, title: 'Original purchase invoice', type: 'invoice', is_required: true, description: 'Proof of purchase' }
    ];

    return {
      issue_id: issueId,
      questions,
      evidence_requirements: evidence
    };
  },

  async classifyIssue(categoryId, description) {
    const remote = await apiRequest('/claims/classify-issue', 'POST', {
      category_id: categoryId,
      description
    });
    if (remote) return remote;

    const issues = ISSUES_BY_CATEGORY[categoryId] || ISSUES_BY_CATEGORY['cat_generic'];
    const lower = (description || '').toLowerCase();
    const matched = issues.find(i => !i.id.endsWith('_not_sure') && lower.includes(i.name.toLowerCase())) || issues[0];

    return {
      matched_issue_id: matched.id,
      issue_name: matched.name,
      confidence: 0.8,
      suggested_issues: issues.slice(0, 3),
      explanation: 'Matched based on keywords in description'
    };
  },

  async getAdminTaxonomy() {
    const remote = await apiRequest('/admin/taxonomy');
    if (remote) return remote;

    return {
      categories: TAXONOMY_CATEGORIES,
      issues_by_category: ISSUES_BY_CATEGORY,
      total_categories: TAXONOMY_CATEGORIES.length,
      total_issues: Object.values(ISSUES_BY_CATEGORY).flat().length,
      total_questions: Object.values(QUESTIONS_BY_ISSUE).flat().length,
      total_evidence_rules: Object.values(EVIDENCE_BY_ISSUE).flat().length
    };
  }
};
