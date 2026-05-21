const QUOTE_DRAFT_KEY = "seadent_quote_draft_v1";

export function saveQuoteDraft(data) {
  try {
    localStorage.setItem(QUOTE_DRAFT_KEY, JSON.stringify(data));
  } catch {}
}

export function loadQuoteDraft() {
  try {
    const raw = localStorage.getItem(QUOTE_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearQuoteDraft() {
  try {
    localStorage.removeItem(QUOTE_DRAFT_KEY);
  } catch {}
}