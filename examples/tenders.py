"""Daily EU tender alert in Python: prints new tenders and writes them to tenders.csv.

pip install apify-client
APIFY_TOKEN=... python tenders.py
"""
import csv
import os

from apify_client import ApifyClient

client = ApifyClient(os.environ["APIFY_TOKEN"])

run_input = {
    "keywords": ["ERP", "SAP"],
    "cpvCodes": ["48000000", "72000000"],
    "countries": ["CZ", "SK", "PL", "AT", "DE"],
    "noticeTypes": ["tenders"],
    "publishedWithinDays": 7,
    "onlyNewNotices": True,  # each run returns only tenders you have not seen yet
    "maxResults": 100,
}

run = client.actor("cognitive_advisory/eu-tender-monitor").call(run_input=run_input)
tenders = list(client.dataset(run["defaultDatasetId"]).iterate_items())

fields = ["publishedAt", "deadline", "buyerCountry", "buyerName", "title", "estimatedValueEur", "relevanceScore", "noticeUrl"]
with open("tenders.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(tenders)

for t in sorted(tenders, key=lambda t: t.get("relevanceScore", 0), reverse=True):
    value = f"€{t['estimatedValueEur']:,}" if t.get("estimatedValueEur") else "value n/a"
    print(f"{t.get('deadline', '')[:10]}  {t['buyerCountry']}  {value:>14}  {t['title']}")
    print(f"    {t['noticeUrl']}")
print(f"{len(tenders)} new tenders, saved to tenders.csv")
