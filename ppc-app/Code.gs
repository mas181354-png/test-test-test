/**
 * PPC COMPAIGN TREE — Web App backend.
 *
 * The spreadsheet is a pure data store (Upload SP / Upload SB / Upload SD /
 * KW TRACKED). This file only reads those tabs and ships the useful rows to
 * the browser; every calculation happens client-side in Index.html.
 *
 * Columns are resolved by their ROW-2 HEADER NAMES, so a re-pasted bulk
 * report keeps working even if Amazon reorders columns.
 */

var SHEETS = {
  sp: 'Upload SP',
  sb: 'Upload SB',
  sd: 'Upload SD',
  kw: 'KW TRACKED'
};

// Entities the app needs (negatives, product ads etc. are skipped to keep
// the payload small even with tens of thousands of pasted rows).
var KEEP_ENTITIES = {
  'Upload SP': ['Campaign', 'Bidding adjustment', 'Keyword', 'Product targeting'],
  'Upload SB': ['Campaign', 'Bidding adjustment by placement', 'Keyword',
                'Product targeting', 'Video ad'],
  'Upload SD': ['Campaign', 'Audience targeting', 'Contextual targeting',
                'Product targeting']
};

// Columns shipped to the client, per upload tab (header names).
var KEEP_COLUMNS = {
  'Upload SP': ['Entity', 'Campaign ID', 'Campaign name (Informational only)',
    'Ad group name (Informational only)', 'Portfolio name (Informational only)',
    'Targeting type', 'State', 'Campaign state (Informational only)',
    'Ad Group State (Informational only)', 'Daily budget', 'Bid',
    'Keyword text', 'Match type', 'Bidding strategy', 'Placement', 'Percentage',
    'Product targeting expression',
    'Impressions', 'Clicks', 'Spend', 'Sales', 'Orders', 'Units'],
  'Upload SB': ['Entity', 'Campaign ID', 'Campaign name (Informational only)',
    'Ad group name (Informational only)', 'Portfolio name (Informational only)',
    'State', 'Campaign state (Informational only)',
    'Ad group serving status (Informational only)', 'Budget', 'Bid optimisation',
    'Bid', 'Placement', 'Percentage', 'Keyword text', 'Match type',
    'Product targeting expression',
    'Impressions', 'Clicks', 'Spend', 'Sales', 'Orders', 'Units'],
  'Upload SD': ['Entity', 'Campaign ID', 'Campaign name (Informational only)',
    'Ad group name (Informational only)', 'Portfolio name (Informational only)',
    'State', 'Campaign state (Informational only)',
    'Ad Group State (Informational only)', 'Budget', 'Tactic',
    'Bid optimisation', 'Bid', 'Targeting expression',
    'Product targeting expression',
    'Impressions', 'Clicks', 'Spend', 'Sales', 'Orders', 'Units']
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('CAMPAIGN TREE')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/** Full payload for the client. Shape per tab: array of {r, v} rows where
 *  row 2 is the header row (shipped so the client resolves columns by name). */
function getData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = { generatedAt: new Date().toISOString(), sheets: {}, warnings: [] };

  [SHEETS.sp, SHEETS.sb, SHEETS.sd].forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) { out.sheets[name] = []; return; }
    var values = sh.getDataRange().getValues();
    if (values.length < 2) { out.sheets[name] = []; return; }
    // find the header row: the first of rows 1-3 containing 'Entity'
    var norm = function (h) {
      return String(h || '').trim().toLowerCase().replace(/\s+/g, ' ')
        .replace('optimization', 'optimisation');
    };
    var hi = -1;
    for (var hr = 0; hr < Math.min(3, values.length); hr++) {
      if (values[hr].some(function (x) { return norm(x) === 'entity'; })) { hi = hr; break; }
    }
    if (hi < 0) {
      out.sheets[name] = [];
      out.warnings.push(name + ': no header row with an "Entity" column was found in ' +
        'rows 1-3 — paste the bulk report so its header row sits in row 2.');
      return;
    }
    var hdr = values[hi].map(norm);
    var keepC = [], canon = [];
    KEEP_COLUMNS[name].forEach(function (want) {
      var i = hdr.indexOf(norm(want));
      if (i >= 0) { keepC.push(i); canon.push(want); }
    });
    var entC = hdr.indexOf('entity');
    var keepE = {};
    KEEP_ENTITIES[name].forEach(function (e) { keepE[e] = true; });

    var rows = [];
    // ship the header under CANONICAL names so the client always resolves them
    rows.push({ r: 2, v: canon.slice() });
    for (var i = hi + 1; i < values.length; i++) {
      var ent = entC >= 0 ? String(values[i][entC] || '').trim() : '';
      if (!ent || !keepE[ent]) continue;
      rows.push({ r: i + 1, v: project(values[i], keepC) });
    }
    out.sheets[name] = rows;
  });

  // KW TRACKED — rows 2..4 meta + keyword rows (A..AK)
  var kw = ss.getSheetByName(SHEETS.kw);
  var kwRows = [];
  if (kw) {
    var tz = ss.getSpreadsheetTimeZone();
    var kv = kw.getDataRange().getValues();
    for (var r = 0; r < kv.length; r++) {
      var row = kv[r].slice(0, 37);
      var any = false;
      for (var c = 0; c < row.length; c++) {
        // calendar string in the sheet's timezone -> no day shift for viewers
        if (row[c] instanceof Date) row[c] = Utilities.formatDate(row[c], tz, 'yyyy-MM-dd');
        if (row[c] !== '' && row[c] !== null && String(row[c]).trim() !== '') any = true;
      }
      if (r + 1 <= 4 || any) kwRows.push({ r: r + 1, v: row });
    }
  }
  out.sheets[SHEETS.kw] = kwRows;
  out.goals = readGoals_(ss);
  return JSON.stringify(out);
}

var GOALS_SHEET = 'GOALS';
var GOAL_KEYS = [['start', 'Start Date'], ['end', 'End Date'],
  ['spend', 'Goal Spend'], ['orders', 'Goal Orders'], ['units', 'Goal Units'],
  ['acos', 'Target ACOS'], ['totUnits', 'Total Units Sold'],
  ['totSales', 'Total Sales']];

function readGoals_(ss) {
  var sh = ss.getSheetByName(GOALS_SHEET);
  if (!sh) return null;
  var tz = ss.getSpreadsheetTimeZone();
  var v = sh.getRange(2, 1, GOAL_KEYS.length, 2).getValues();
  var out = {};
  GOAL_KEYS.forEach(function (k, i) {
    var x = v[i] ? v[i][1] : '';
    // format in the SPREADSHEET timezone so save -> load never shifts a day
    if (x instanceof Date) x = Utilities.formatDate(x, tz, 'yyyy-MM-dd');
    out[k[0]] = (x === '' ? null : x);
  });
  return out;
}

/** Called by the app's Save button — stores the goal inputs in a GOALS tab
 *  (created automatically the first time). */
function saveGoals(obj) {
  var lock = LockService.getDocumentLock();
  lock.tryLock(5000);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(GOALS_SHEET) || ss.insertSheet(GOALS_SHEET);
  sh.getRange(1, 1, 1, 2).setValues([['Setting', 'Value']]);
  var rows = GOAL_KEYS.map(function (k) {
    var v = obj && obj[k[0]] != null ? obj[k[0]] : '';
    return [k[1], v];
  });
  sh.getRange(2, 1, rows.length, 2).setValues(rows);
  lock.releaseLock();
  return 'ok';
}

function project(rowValues, cols) {
  var v = [];
  for (var i = 0; i < cols.length; i++) {
    var x = rowValues[cols[i]];
    if (x instanceof Date) x = x.toISOString();
    v.push(x === '' ? null : x);
  }
  return v;
}
