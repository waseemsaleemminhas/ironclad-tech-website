/**
 * Ironclad Tech — Client Testimonials backend.
 *
 * Bind this script to a Google Sheet with two tabs:
 *
 *   Clients  | Token | Contact Name | Title | Company | Email | Service | Status | Invited Date | Review Link
 *   Reviews  | Token | Rating | Review Text | Status | Submitted At | Approved At
 *
 * Workflow:
 *   1. Add a row to Clients with Contact Name / Title / Company / Email / Service filled in,
 *      leave Token/Status/Invited Date/Review Link blank. onEdit() fills those in automatically.
 *   2. Copy the generated Review Link and send it to the client yourself (email, LinkedIn, etc).
 *   3. When they submit, a row appears in Reviews with Status "Pending".
 *   4. To publish it, change that row's Status cell to "Approved" — it appears on the site
 *      within a minute or two (no redeploy needed, it reads the sheet live). Set it to
 *      "Rejected" to keep it off the site instead.
 *
 * Deploy: Extensions > Apps Script > paste this in > Deploy > New deployment >
 *         type "Web app" > Execute as "Me" > Who has access "Anyone" > Deploy.
 *         Copy the resulting /exec URL into js/testimonials.js (IRONCLAD_REVIEWS_API).
 */

var SHEET_CLIENTS = 'Clients';
var SHEET_REVIEWS = 'Reviews';
var SITE_ORIGIN = 'https://www.getironcladtech.com';

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'list') return respond(listApprovedReviews());
  if (action === 'verify') return respond(verifyToken(e.parameter.token));
  return respond({ error: 'Unknown action' });
}

function doPost(e) {
  var action = e.parameter.action;
  if (action === 'submit') {
    return respond(submitReview(e.parameter.token, e.parameter.rating, e.parameter.body));
  }
  return respond({ error: 'Unknown action' });
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function rowsAsObjects(sheet) {
  var values = sheet.getDataRange().getValues();
  var headers = values.shift();
  return values
    .filter(function (row) { return row.join('') !== ''; })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = row[i]; });
      return obj;
    });
}

function findClientByToken(token) {
  var sheet = getSheet(SHEET_CLIENTS);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var tokenCol = headers.indexOf('Token');
  for (var i = 1; i < values.length; i++) {
    if (values[i][tokenCol] === token) {
      var obj = {};
      headers.forEach(function (h, c) { obj[h] = values[i][c]; });
      obj._row = i + 1;
      return obj;
    }
  }
  return null;
}

function verifyToken(token) {
  if (!token) return { valid: false };
  var client = findClientByToken(token);
  if (!client) return { valid: false };
  if (client.Status === 'Submitted') return { valid: false, reason: 'already-submitted' };
  return { valid: true, name: client['Contact Name'], company: client['Company'] };
}

function submitReview(token, rating, body) {
  var client = findClientByToken(token);
  if (!client) return { ok: false, error: 'invalid-token' };
  if (client.Status === 'Submitted') return { ok: false, error: 'already-submitted' };

  rating = parseInt(rating, 10);
  if (!rating || rating < 1 || rating > 5) return { ok: false, error: 'invalid-rating' };
  if (!body || !body.toString().trim()) return { ok: false, error: 'empty-review' };

  var reviewsSheet = getSheet(SHEET_REVIEWS);
  reviewsSheet.appendRow([token, rating, body.toString().trim(), 'Pending', new Date(), '']);

  var clientsSheet = getSheet(SHEET_CLIENTS);
  var headers = clientsSheet.getRange(1, 1, 1, clientsSheet.getLastColumn()).getValues()[0];
  var statusCol = headers.indexOf('Status') + 1;
  clientsSheet.getRange(client._row, statusCol).setValue('Submitted');

  return { ok: true };
}

function listApprovedReviews() {
  var reviews = rowsAsObjects(getSheet(SHEET_REVIEWS)).filter(function (r) { return r.Status === 'Approved'; });
  var clients = rowsAsObjects(getSheet(SHEET_CLIENTS));
  var byToken = {};
  clients.forEach(function (c) { byToken[c.Token] = c; });

  var out = reviews.map(function (r) {
    var c = byToken[r.Token] || {};
    return {
      name: c['Contact Name'] || '',
      title: c['Title'] || '',
      company: c['Company'] || '',
      service: c['Service'] || '',
      rating: r.Rating,
      body: r['Review Text'],
      date: r['Submitted At'] ? new Date(r['Submitted At']).toISOString() : ''
    };
  });

  out.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  return out.slice(0, 30);
}

/**
 * Simple trigger — fires automatically on any edit to the bound sheet.
 * When a new Clients row gets a Company name but has no Token yet,
 * generates one, stamps the invite date, and builds the review link.
 */
function onEdit(e) {
  var sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_CLIENTS) return;
  var row = e.range.getRow();
  if (row === 1) return;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var tokenCol = headers.indexOf('Token') + 1;
  var companyCol = headers.indexOf('Company') + 1;
  var invitedCol = headers.indexOf('Invited Date') + 1;
  var linkCol = headers.indexOf('Review Link') + 1;
  if (!tokenCol || !companyCol) return;

  var company = sheet.getRange(row, companyCol).getValue();
  var existingToken = sheet.getRange(row, tokenCol).getValue();
  if (!company || existingToken) return;

  var token = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
  sheet.getRange(row, tokenCol).setValue(token);
  if (invitedCol) sheet.getRange(row, invitedCol).setValue(new Date());
  if (linkCol) sheet.getRange(row, linkCol).setValue(SITE_ORIGIN + '/review?token=' + token);
}
