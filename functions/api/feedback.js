// "Was this helpful?" feedback tally. KV namespace JR_COUNT, keys fb:yes / fb:no.
// Counts tap events only - no message text. Same hashed-IP daily cap (20/day)
// as the usage counter; rate-limit keys expire after 48h.
// Global budget: at most 10 feedback events per day across all users, so total
// KV writes (counter + feedback) stay inside the free tier with headroom.
const FB_DAY_CAP = 10;
export async function onRequest(context) {
  const { request, env } = context;
  const v = new URL(request.url).searchParams.get('v');
  if (env.JR_COUNT && (v === 'yes' || v === 'no')) {
    const day = new Date().toISOString().slice(0, 10);
    const dk = 'fbday:' + day;
    const dayUsed = parseInt((await env.JR_COUNT.get(dk)) || '0', 10);
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
    const hash = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    const rk = 'rlf:' + day + ':' + hash;
    const used = parseInt((await env.JR_COUNT.get(rk)) || '0', 10);
    if (used < 20 && dayUsed < FB_DAY_CAP) {
      await env.JR_COUNT.put(rk, String(used + 1), { expirationTtl: 172800 });
      await env.JR_COUNT.put(dk, String(dayUsed + 1), { expirationTtl: 172800 });
      const k = 'fb:' + v;
      const n = parseInt((await env.JR_COUNT.get(k)) || '0', 10) + 1;
      await env.JR_COUNT.put(k, String(n));
    }
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
}
