// n8n Code node ("Run Once for All Items"): turns EU Tender Monitor results into one HTML email.
// The same code is embedded in eu-tender-alerts-email.json; keep both in sync.
const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const eur = (v) => (v == null ? '–' : `€${Math.round(v).toLocaleString('en-US')}`);
const day = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');

const tenders = $input
    .all()
    .map((i) => i.json)
    .filter((t) => t.noticeId)
    .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
if (!tenders.length) return [];

const rows = tenders
    .map(
        (t) => `<tr>
  <td style="padding:10px 8px;border-bottom:1px solid #e4e3df;vertical-align:top">
    <a href="${esc(t.noticeUrl)}" style="color:#1c5cab;font-weight:600;text-decoration:none">${esc(t.title)}</a><br>
    <span style="color:#52514e">${esc(t.buyerName)} · ${esc(t.buyerCountry)}</span><br>
    <span style="color:#52514e;font-size:13px">${esc((t.reasons ?? []).slice(0, 2).join(' '))}</span>
  </td>
  <td style="padding:10px 8px;border-bottom:1px solid #e4e3df;vertical-align:top;white-space:nowrap">${day(t.deadline)}${t.daysToDeadline != null ? `<br><span style="color:#52514e;font-size:13px">${t.daysToDeadline} days</span>` : ''}</td>
  <td style="padding:10px 8px;border-bottom:1px solid #e4e3df;vertical-align:top;white-space:nowrap;text-align:right">${eur(t.estimatedValueEur)}</td>
</tr>`,
    )
    .join('\n');

const html = `<div style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:#0b0b0b;max-width:760px">
<p>${tenders.length} new tender${tenders.length === 1 ? '' : 's'} on TED match your search.</p>
<table style="border-collapse:collapse;width:100%">
<tr><th align="left" style="padding:6px 8px;border-bottom:2px solid #0b0b0b">Tender</th><th align="left" style="padding:6px 8px;border-bottom:2px solid #0b0b0b">Deadline</th><th align="right" style="padding:6px 8px;border-bottom:2px solid #0b0b0b">Value</th></tr>
${rows}
</table>
<p style="color:#52514e;font-size:12px">Source: TED (Publications Office of the EU) via EU Tender Monitor on Apify. Always check the official notice before you bid.</p>
</div>`;

return [{ json: { subject: `${tenders.length} new EU tender${tenders.length === 1 ? '' : 's'} for you`, html, count: tenders.length } }];
