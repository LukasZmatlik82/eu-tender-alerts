#!/usr/bin/env bash
# Find open ERP/SAP tenders in Germany and Austria published in the last 7 days.
# Needs APIFY_TOKEN (Apify Console → Settings → API & Integrations).
curl -s -X POST \
  "https://api.apify.com/v2/acts/cognitive_advisory~eu-tender-monitor/run-sync-get-dataset-items?timeout=280" \
  -H "Authorization: Bearer $APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["ERP", "SAP"],
    "cpvCodes": ["48000000", "72000000"],
    "countries": ["DE", "AT"],
    "publishedWithinDays": 7,
    "maxResults": 50
  }'
