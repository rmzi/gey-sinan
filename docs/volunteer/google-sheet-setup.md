# Suggest-a-fix receiver: Google Apps Script + Sheet

The dictionary's "suggest a fix" form (in `/dictionary/[id]`) POSTs a JSON
payload to `EXPO_PUBLIC_FEEDBACK_URL`. This document sets up that endpoint
as a Google Apps Script web app that appends each submission to a Google
Sheet — no backend required.

## 1. Create the sheet

1. Create a new Google Sheet (or reuse an existing one dedicated to Gey Sinan
   volunteer data).
2. Rename the first tab to `Fixes`.
3. Add a header row (the script below will also create it automatically on
   first run if missing, but it's clearer to add it yourself):

   ```
   timestamp | entryId | harariLatin | english | issueType | suggestion | comment | contributorName | contributorEmail
   ```

## 2. Add the Apps Script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete the default `myFunction` boilerplate and paste the script below.

```javascript
const SHEET_NAME = 'Fixes';
const HEADERS = [
  'timestamp',
  'entryId',
  'harariLatin',
  'english',
  'issueType',
  'suggestion',
  'comment',
  'contributorName',
  'contributorEmail',
];

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const body = JSON.parse(e.postData.contents);

    const row = [
      new Date().toISOString(),
      body.entryId || '',
      body.harariLatin || '',
      body.english || '',
      body.issueType || '',
      body.suggestion || '',
      body.comment || '',
      body.contributorName || '',
      body.contributorEmail || '',
    ];

    sheet.appendRow(row);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Save the project (name it something like `gey-sinan-fixes-receiver`).

## 3. Deploy as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure:
   - **Execute as**: Me (your Google account)
   - **Who has access**: Anyone
4. Click **Deploy**, then authorize the script when prompted (it needs
   permission to edit the spreadsheet).
5. Copy the resulting **Web app URL** — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Wire it into the app

Set the URL as `EXPO_PUBLIC_FEEDBACK_URL` in `apps/expo/.env` (see
`apps/expo/.env.example`) or in your deployment's environment configuration:

```
EXPO_PUBLIC_FEEDBACK_URL=https://script.google.com/macros/s/AKfycb.../exec
```

If this variable is unset, the app disables the suggest-a-fix form with a
friendly note rather than failing silently.

## Notes

- Apps Script web apps respond to POST with an HTTP 302 redirect before
  reaching the final response. Browsers following that redirect via `fetch`
  in `no-cors` mode return an **opaque** response the app can't read — this
  is expected. The client only cares that the request didn't throw; check
  the Sheet directly to confirm submissions are landing.
- Re-deploy (**Deploy → Manage deployments → Edit → New version**) after
  changing the script, otherwise the live URL keeps serving the old code.
- Anyone can find the deployment URL from the client bundle since it's a
  public `EXPO_PUBLIC_*` variable. That's fine — the endpoint only appends
  rows, and "Execute as: Me" means the caller never gets edit access to the
  sheet itself, only to `doPost`.
