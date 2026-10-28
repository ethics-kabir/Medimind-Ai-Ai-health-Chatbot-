function resolveApiBase() {
  const configured = (import.meta.env.VITE_API_URL || '/api').trim();
  const sanitized = configured.replace(/\/$/, '');
  if (sanitized.startsWith('/')) return sanitized;

  try {
    const parsed = new URL(sanitized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Unsupported protocol');
    }
    if (import.meta.env.PROD && parsed.protocol !== 'https:') {
      console.warn('VITE_API_URL should use https in production. Falling back to /api.');
      return '/api';
    }
    return sanitized;
  } catch {
    console.warn('Invalid VITE_API_URL value. Falling back to /api.');
    return '/api';
  }
}

const API_BASE = resolveApiBase();

function sanitizeErrorMessage(rawMessage) {
  if (typeof rawMessage !== 'string') return 'Service request failed';
  const trimmed = rawMessage.trim();
  if (!trimmed) return 'Service request failed';
  if (trimmed.length > 220) return 'Service request failed';
  if (/(traceback|stack|exception|sql|token|key|password)/i.test(trimmed)) {
    return 'Service request failed';
  }
  return trimmed;
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const err = await response.json();
      errorDetail = sanitizeErrorMessage(err.detail || err.message || errorDetail);
    } catch {
      // keep fallback message
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // System Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getHealthTips() {
    const res = await fetch(`${API_BASE}/health-tips`);
    return handleResponse(res);
  },

  // AI Chat
  async sendChatMessage(message, conversationId = null, language = 'en') {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversation_id: conversationId, language }),
    });
    return handleResponse(res);
  },

  async getConversations(search = '') {
    const url = search
      ? `${API_BASE}/conversations?search=${encodeURIComponent(search)}`
      : `${API_BASE}/conversations`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getConversationDetail(id) {
    const res = await fetch(`${API_BASE}/conversations/${id}`);
    return handleResponse(res);
  },

  async deleteConversation(id) {
    const res = await fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async clearAllConversations() {
    const res = await fetch(`${API_BASE}/conversations`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Symptom Checker
  async submitSymptomCheck(data) {
    const res = await fetch(`${API_BASE}/symptom-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getSymptomChecks() {
    const res = await fetch(`${API_BASE}/symptom-checks`);
    return handleResponse(res);
  },

  async deleteSymptomCheck(id) {
    const res = await fetch(`${API_BASE}/symptom-checks/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  async clearAllSymptomChecks() {
    const res = await fetch(`${API_BASE}/symptom-checks`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Medications
  async getMedications(query = '') {
    const url = query
      ? `${API_BASE}/medications?q=${encodeURIComponent(query)}`
      : `${API_BASE}/medications`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getMedicationDetail(name) {
    const res = await fetch(`${API_BASE}/medications/${encodeURIComponent(name)}`);
    return handleResponse(res);
  },
};
