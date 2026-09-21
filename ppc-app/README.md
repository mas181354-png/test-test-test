# CAMPAIGN TREE — Google Sheets web app

A light-blue / white glassmorphism web app that runs on top of your Google
Sheet. The sheet holds only raw data (**Upload SP, Upload SB, Upload SD,
KW TRACKED**) — every analysis lives in the app:

- **Aggregates** — totals across all ad types, spend donut, campaign states,
  portfolios in scope, match/target-type mix.
- **Portfolios** — one row per portfolio with campaign counts by ad type,
  every metric and its share of the scope, PLUS the **Product Goals & Budget
  Space** card (start/end dates, goal spend, est. orders/units, target ACOS →
  Space or over-consume and Profit, exactly like the original sheet, with
  budget pacing bars) and the **Organic vs Sponsored** card (enter total sales
  and units → organic split, TACOS vs ACOS, organic:sponsored ratio). Inputs
  are saved into a GOALS tab that the app creates automatically.
- **Campaigns** — By Portfolio / All Campaigns toggle. Grouped mode: 📁 rows
  are portfolio subtotals and each portfolio's campaigns' shares sum to 100%
  within it. Click ▸ on a campaign to expand its **placements** (fixed order,
  Adj %, per-placement metrics + within-campaign shares, CAMPAIGN TOTAL row).
  Click any column header for a Google-Sheets-style menu (sort high→low /
  low→high, or filter that column with > < = ≥ ≤ ≠). Name columns stay frozen
  while you scroll horizontally; share cells are colour-shaded.
- **SP Analysis / SB Analysis / SD Analysis** — the original sheet's analysis
  blocks (placements, match/target types, bidding strategies, Auto-vs-Manual,
  SKC/MKC/SAC/MAC structure, SB ad format, SD targeting, campaign states),
  every table with the full metric set (CTR, CVR, ACOS, CPC, ROAS, AOV, CPA)
  AND the IS/CS/SS/RS/OS/US share columns.
- **Placements** — its own tab, like the original sheet: every SP and SB
  campaign listed spend-sorted with its placements open underneath (fixed
  order, Adj %, metrics, within-campaign shares, CAMPAIGN TOTAL row).
  All / SP / SB filter, Expand-all / Collapse-all, header sort & filter menus.
- **Targets** — All / Keywords / ASIN·PT quick filter, spend-sorted targets
  with match type (Exact / Phrase / Broad / ASIN / ASIN Expanded / Category /
  Auto), the
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
   **Important — paste the WHOLE file:** open the downloaded `Index.html` in a
   text editor (Notepad), press **Ctrl+A** then **Ctrl+C**, and paste. The last
   line in the Apps Script editor must be `</html>`. A partial paste is the #1
   cause of a blank page — if that happens, the app now shows a red warning
   telling you to re-paste instead of staying blank.
5. **Deploy → New deployment → ⚙ Web app**:
   - *Execute as*: **Me**
   - *Who has access*: your choice (Only myself / Anyone with the link)
   - Click **Deploy** and authorize. If Google shows **"Google hasn't verified
     this app"**, click *Advanced → Go to (project) (unsafe) → Allow* — it is
     your own script, this is normal and safe.
6. Open the URL — done.

### If the page is blank or asks for access
- Make sure the browser is signed into the **same Google account** that owns
  the sheet — with several Google accounts signed in, the /exec link often
  opens under the wrong one and shows a blank page or an access prompt. Try
  an incognito window signed into just that account.
- If you see a red **"Index.html is incomplete"** message, the paste was cut
  off — re-paste the whole file (last line must be `</html>`).
- When creating the HTML file, type only **Index** as the name (the editor
  adds .html itself — naming it "Index.html" creates "Index.html.html").

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
