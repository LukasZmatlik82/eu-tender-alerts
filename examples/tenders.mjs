// Contract awards in Czechia: who won public IT contracts in the last 90 days, and for how much.
// npm install apify-client
// APIFY_TOKEN=... node tenders.mjs
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

const run = await client.actor('cognitive_advisory/eu-tender-monitor').call({
    cpvCodes: ['72000000'],
    countries: ['CZ'],
    noticeTypes: ['awards'],
    publishedWithinDays: 90,
    maxResults: 500,
});
const { items } = await client.dataset(run.defaultDatasetId).listItems();

// Total awarded value per winning company.
const byWinner = new Map();
for (const notice of items) {
    for (const w of notice.winners) {
        const cur = byWinner.get(w.name) ?? { contracts: 0, eur: 0 };
        cur.contracts += 1;
        cur.eur += (notice.awardedValueEur ?? 0) / notice.winners.length;
        byWinner.set(w.name, cur);
    }
}
const top = [...byWinner].sort((a, b) => b[1].eur - a[1].eur).slice(0, 15);
console.table(top.map(([name, v]) => ({ winner: name, contracts: v.contracts, awardedEur: Math.round(v.eur) })));
