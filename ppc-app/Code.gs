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
    .setTitle('PPC Command Center')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/** Full payload for the client. Shape per tab: array of {r, v} rows where
 *  row 2 is the header row (shipped so the client resolves columns by name). */
function getData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = { generatedAt: new Date().toISOString(), sheets: {} };

  [SHEETS.sp, SHEETS.sb, SHEETS.sd].forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) { out.sheets[name] = []; return; }
    var values = sh.getDataRange().getValues();
    if (values.length < 2) { out.sheets[name] = []; return; }
    var hdr = values[1].map(function (h) { return String(h || '').trim(); });
    var keepC = [];
    KEEP_COLUMNS[name].forEach(function (want) {
      var i = hdr.indexOf(want);
      if (i >= 0) keepC.push(i);
    });
    var entC = hdr.indexOf('Entity');
    var keepE = {};
    KEEP_ENTITIES[name].forEach(function (e) { keepE[e] = true; });

    var rows = [];
    // header row (r=2) first, with only the kept columns re-labelled in place
    rows.push({ r: 2, v: project(values[1], keepC) });
    for (var i = 2; i < values.length; i++) {
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
    var kv = kw.getDataRange().getValues();
    for (var r = 0; r < kv.length; r++) {
      var row = kv[r].slice(0, 37);
      var any = false;
      for (var c = 0; c < row.length; c++) {
        if (row[c] instanceof Date) row[c] = row[c].toISOString();
        if (row[c] !== '' && row[c] !== null && String(row[c]).trim() !== '') any = true;
      }
      if (r + 1 <= 4 || any) kwRows.push({ r: r + 1, v: row });
    }
  }
  out.sheets[SHEETS.kw] = kwRows;
  return JSON.stringify(out);
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
