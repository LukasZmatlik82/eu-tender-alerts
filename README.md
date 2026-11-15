# EU tender alerts: daily public procurement alerts from TED

Get an email every morning with **new EU public tenders** that match your business: by keyword, CPV code, country and value. No paid tender portal, no subscription.

This repository has ready-to-use examples for [EU Tender Monitor](https://apify.com/cognitive_advisory/eu-tender-monitor), an Apify Actor that searches [TED](https://ted.europa.eu) (Tenders Electronic Daily, the official EU tender journal, about 800,000 notices a year) and returns clean JSON:

- tender title in your language, buyer, country, CPV codes
- submission deadline and days left
- estimated value, also converted to EUR
- links to the notice, the procurement documents and the e-submission platform
- for contract awards: winners and awarded value
- **verified keyword matches:** TED's own full-text search also matches words hidden in annexes, so a search for "ERP" returns forestry and archaeology tenders. EU Tender Monitor keeps only notices whose title or description really contains your keyword, and shows the sentence as evidence.

## Examples

| File | What it does |
| --- | --- |
| [`n8n/eu-tender-alerts-email.json`](n8n/eu-tender-alerts-email.json) | **n8n workflow:** every day at 7:00, find new tenders and send one HTML email. Days without new tenders send nothing. |
| [`examples/tenders.py`](examples/tenders.py) | Python: new tenders to the console and `tenders.csv`. |
| [`examples/tenders.mjs`](examples/tenders.mjs) | Node.js: who won public IT contracts in Czechia in the last 90 days, and for how much. |
| [`examples/curl.sh`](examples/curl.sh) | One `curl` call that returns tenders as JSON. |

## Set up the n8n email alert (5 minutes)

1. Create a free [Apify account](https://console.apify.com/sign-up) and copy your API token (**Settings → API & Integrations**).
2. In n8n, **Import from file** and choose `n8n/eu-tender-alerts-email.json`.
3. Open **Find new tenders on TED** and create a **Header Auth** credential: name `Authorization`, value `Bearer YOUR_APIFY_TOKEN`.
4. Edit the JSON body for your market (see the table below).
5. Open **Send email**, choose your SMTP credential and set the recipient. To post to Slack or Teams instead, replace this node.
6. Run it once with **Test workflow**, then activate it.

`"onlyNewNotices": true` makes every run return only tenders you have not received before, so you never get the same tender twice.

## Searches for common industries

| You are… | JSON body |
| --- | --- |
| ERP / business software partner | `{"cpvCodes": ["48451000", "48000000", "72000000"], "keywords": ["ERP", "SAP", "Odoo", "Dynamics"], "countries": ["CZ", "SK", "AT", "PL"]}` |
| IT services company | `{"cpvCodes": ["72000000"], "countries": ["DE", "AT"], "minValueEur": 200000}` |
| Construction company | `{"cpvCodes": ["45000000"], "countries": ["CZ"], "minValueEur": 1000000}` |
| Architects and engineers | `{"cpvCodes": ["71000000"], "countries": ["CZ", "SK"]}` |
| Management consultancy | `{"cpvCodes": ["79400000"], "keywords": ["strategy", "digital transformation"]}` |
| Medical supplier | `{"cpvCodes": ["33000000"], "countries": ["PL", "CZ", "SK", "HU"]}` |
| Market research: who wins what | `{"cpvCodes": ["72000000"], "countries": ["CZ"], "noticeTypes": ["awards"], "publishedWithinDays": 90}` |

Add `"onlyNewNotices": true` for alerts. All input fields are described on the [Actor page](https://apify.com/cognitive_advisory/eu-tender-monitor).

## Cost

Apify charges per tender returned (about $0.003, cheaper on paid Apify plans). Filtered-out notices and runs with nothing new are free. A daily alert in a typical niche costs well under $1 a month, and Apify's free plan includes monthly credit to try it.

## Data and disclaimer

Data comes from the official TED Search API of the Publications Office of the European Union. TED holds tenders above the EU thresholds and many voluntary notices below them; smaller national tenders are published only on national portals. Always check the official notice and documents before you bid.

## License

MIT
