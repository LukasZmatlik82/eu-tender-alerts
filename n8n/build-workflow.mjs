// Builds eu-tender-alerts-email.json from format-email.js so the Code node and the file stay in sync.
// Usage: node n8n/build-workflow.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const jsCode = readFileSync(path.join(dir, 'format-email.js'), 'utf8');

const input = {
    keywords: ['ERP', 'SAP'],
    cpvCodes: ['48000000', '72000000'],
    countries: ['DE', 'AT', 'CZ', 'SK', 'PL'],
    noticeTypes: ['tenders'],
    publishedWithinDays: 3,
    onlyOpen: true,
    onlyVerifiedMatches: true,
    onlyNewNotices: true,
    titleLanguage: 'en',
    maxResults: 100,
};

const workflow = {
    name: 'Daily EU public tender alerts by email (TED)',
    nodes: [
        {
            parameters: {
                content:
                    '## Daily EU tender alerts\nEvery morning this workflow searches TED (the EU tender journal) with **EU Tender Monitor** on Apify and emails you only **new** tenders that match your keywords, CPV codes and countries.\n\n### Setup (5 minutes)\n1. Create a free Apify account and copy your API token (Console → Settings → API & Integrations).\n2. In **Find new tenders on TED**, create a *Header Auth* credential: name `Authorization`, value `Bearer YOUR_APIFY_TOKEN`.\n3. Edit the JSON body: keywords, CPV codes, countries. Examples: https://apify.com/cognitive_advisory/eu-tender-monitor\n4. In **Send email**, set your SMTP credential and the To address.\n5. Activate the workflow.\n\nYou pay Apify per tender found (about $0.003). Days without new tenders send no email.',
                height: 520,
                width: 420,
            },
            id: 'a3b0f4e2-1c55-4b8e-9e51-6f1d2a7c0001',
            name: 'About this workflow',
            type: 'n8n-nodes-base.stickyNote',
            typeVersion: 1,
            position: [-460, -120],
        },
        {
            parameters: { rule: { interval: [{ field: 'days', triggerAtHour: 7 }] } },
            id: 'a3b0f4e2-1c55-4b8e-9e51-6f1d2a7c0002',
            name: 'Every day at 7:00',
            type: 'n8n-nodes-base.scheduleTrigger',
            typeVersion: 1.2,
            position: [0, 0],
        },
        {
            parameters: {
                method: 'POST',
                url: 'https://api.apify.com/v2/acts/cognitive_advisory~eu-tender-monitor/run-sync-get-dataset-items?timeout=280',
                authentication: 'genericCredentialType',
                genericAuthType: 'httpHeaderAuth',
                sendBody: true,
                specifyBody: 'json',
                jsonBody: JSON.stringify(input, null, 2),
                options: { timeout: 300000 },
            },
            id: 'a3b0f4e2-1c55-4b8e-9e51-6f1d2a7c0003',
            name: 'Find new tenders on TED',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4.2,
            position: [220, 0],
        },
        {
            parameters: { mode: 'runOnceForAllItems', jsCode },
            id: 'a3b0f4e2-1c55-4b8e-9e51-6f1d2a7c0004',
            name: 'Build email',
            type: 'n8n-nodes-base.code',
            typeVersion: 2,
            position: [440, 0],
        },
        {
            parameters: {
                fromEmail: 'alerts@example.com',
                toEmail: 'you@example.com',
                subject: '={{ $json.subject }}',
                emailFormat: 'html',
                html: '={{ $json.html }}',
                options: {},
            },
            id: 'a3b0f4e2-1c55-4b8e-9e51-6f1d2a7c0005',
            name: 'Send email',
            type: 'n8n-nodes-base.emailSend',
            typeVersion: 2.1,
            position: [660, 0],
        },
    ],
    connections: {
        'Every day at 7:00': { main: [[{ node: 'Find new tenders on TED', type: 'main', index: 0 }]] },
        'Find new tenders on TED': { main: [[{ node: 'Build email', type: 'main', index: 0 }]] },
        'Build email': { main: [[{ node: 'Send email', type: 'main', index: 0 }]] },
    },
    settings: { executionOrder: 'v1' },
    pinData: {},
    meta: { templateCredsSetupCompleted: false },
};

writeFileSync(path.join(dir, 'eu-tender-alerts-email.json'), `${JSON.stringify(workflow, null, 2)}\n`);
console.log('wrote eu-tender-alerts-email.json');
