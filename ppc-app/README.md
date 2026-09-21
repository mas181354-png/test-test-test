# PPC Command Center — Google Sheets web app

A light-blue / white glassmorphism web app that runs on top of your Google
Sheet. The sheet holds only raw data (**Upload SP, Upload SB, Upload SD,
KW TRACKED**) — every analysis lives in the app:

- **Aggregates** — totals across all ad types, spend donut, campaign states,
  portfolios in scope, match/target-type mix.
- **Portfolios** — one row per portfolio with campaign counts by ad type,
  every metric and its share of the scope.
- **Campaigns** — grouped by portfolio (📁 rows are portfolio subtotals),
  spend-sorted, with metrics, ratios and IS/CS/SS/RS/OS/US shares; click ▸ on
  a campaign to expand its **placements** (fixed order, Adj %, per-placement
  metrics + within-campaign shares, CAMPAIGN TOTAL row).
- **SP Analysis / SB Analysis / SD Analysis** — the original sheet's analysis
  blocks (placements, match/target types, bidding strategies, Auto-vs-Manual,
  SKC/MKC/SAC/MAC structure, SB ad format, SD targeting, campaign states),
  every table with the full metric set (CTR, CVR, ACOS, CPC, ROAS, AOV, CPA)
  AND the IS/CS/SS/RS/OS/US share columns.
- **Targets** — spend-sorted targets with match type (Exact / Phrase / Broad /
  ASIN / ASIN Expanded / Category / Auto), the
  `Campaign | Ad group | Target` state line, shares, and the **keyword rank
  heatmap** toggle (SV / KW SALE / daily ranks from KW TRACKED, newest day on
  the left, the same colour buckets as the old sheet).
- **Header filters** — portfolio multi-select and manual campaign multi-select
  apply to every tab and are remembered between visits.
- **Condition filters** — on Campaigns and Targets add any number of rules
  like `Spend > 100`, `ACOS ≤ 0.3` (operators > < = ≥ ≤ ≠) plus text search.

## Files

| File | What it is |
|---|---|
| `SAMSUNG_SMART_REMOTE__PPC_DATA_V17.xlsx` | The new data-only spreadsheet — import it into Google Sheets |
| `Code.gs` | Apps Script backend (reads the 4 tabs, ships them to the browser) |
| `Index.html` | The whole web app UI (one file) |

## Deploy (one time, ~3 minutes)

1. Import `SAMSUNG_SMART_REMOTE__PPC_DATA_V17.xlsx` into Google Sheets
   (Drive → New → File upload → open → File → Save as Google Sheets), or
   File → Import into a blank sheet. Keep the tab names exactly as they are.
2. In that Google Sheet open **Extensions → Apps Script**.
3. Replace the contents of the default `Code.gs` with the `Code.gs` file here.
4. Click **＋ → HTML**, name it exactly **Index**, and replace its contents
   with `Index.html`.
5. **Deploy → New deployment → ⚙ Web app**:
   - *Execute as*: **Me**
   - *Who has access*: your choice (Only myself / Anyone with the link)
   - Click **Deploy**, authorize when asked, and copy the web app URL.
6. Open the URL — done.

## Daily use

- Paste new Amazon bulk data into **Upload SP / Upload SB / Upload SD**
  (data starts at row 3; row 2 is the header row the app reads). Column
  order doesn't matter — columns are matched by header name.
- Update **KW TRACKED** the same way you always did (keywords from row 5,
  dates in row 3, newest day in the rightmost used column).
- Press **⟳ Refresh** in the app to pull the latest data.
- After you edit `Code.gs`/`Index.html` later, use
  **Deploy → Manage deployments → ✏ → New version** to update the same URL.

## Notes

- Amazon Business is a B2B subset already counted inside the other three SP
  placements — that's why a campaign's placement rows can sum past its total.
- The SB bulk file reports each campaign's totals on its placement rows;
  the app shows exactly what Amazon reports, labelled Video / Collection.
- The engine was verified against the formulas of the old workbook:
  2,026 automated checks comparing every campaign, placement, target, share
  and aggregate against the verified V16 numbers — all passing.
