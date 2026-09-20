// Ironclad Tech — Client Testimonials
// After deploying the Apps Script backend (apps-script/testimonials.gs) as a
// Web App, paste its /exec URL below. Until then, this points at nothing and
// every page using it just shows its built-in fallback/empty state.
window.IRONCLAD_REVIEWS_API = 'REPLACE_WITH_YOUR_APPS_SCRIPT_EXEC_URL';

function ictApiReady() {
  return window.IRONCLAD_REVIEWS_API && window.IRONCLAD_REVIEWS_API.indexOf('REPLACE_WITH') !== 0;
}

function ictFetchReviews() {
  if (!ictApiReady()) return Promise.resolve([]);
  return fetch(window.IRONCLAD_REVIEWS_API + '?action=list')
    .then(function (r) { return r.json(); })
    .catch(function () { return []; });
}

function ictVerifyToken(token) {
  if (!ictApiReady()) return Promise.resolve({ valid: false });
  return fetch(window.IRONCLAD_REVIEWS_API + '?action=verify&token=' + encodeURIComponent(token))
    .then(function (r) { return r.json(); })
    .catch(function () { return { valid: false }; });
}

function ictSubmitReview(token, rating, body) {
  var fd = new FormData();
  fd.append('action', 'submit');
  fd.append('token', token);
  fd.append('rating', rating);
  fd.append('body', body);
  return fetch(window.IRONCLAD_REVIEWS_API, { method: 'POST', body: fd })
    .then(function (r) { return r.json(); });
}

function ictStarsHtml(rating) {
  var n = Math.round(Number(rating)) || 0;
  var html = '';
  for (var i = 1; i <= 5; i++) {
    html += '<i class="' + (i <= n ? 'fas' : 'far') + ' fa-star"></i>';
  }
  return html;
}

function ictEscape(str) {
  var div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function ictFormatDate(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
