// Public usage counter. Cloudflare Pages Function backed by a KV namespace
// named JR_COUNT. Counts completed check events only - never message text.
// Privacy and abuse handling: the caller IP is SHA-256 hashed (never stored
// raw), limited to 50 counted checks per day per hash, rate-limit keys expire
// after 48h. The counter measures check events, not unique people.
export async function onRequest(context) {
  const { request, env } = context;
  let count = 0;
  if (env.JR_COUNT) {
    if (request.method === 'POST') {
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
      const hash = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
      const rk = 'rl:' + new Date().toISOString().slice(0, 10) + ':' + hash;
      const used = parseInt((await env.JR_COUNT.get(rk)) || '0', 10);
      if (used < 50) {
        await env.JR_COUNT.put(rk, String(used + 1), { expirationTtl: 172800 });
        count = parseInt((await env.JR_COUNT.get('checks')) || '0', 10) + 1;
        await env.JR_COUNT.put('checks', String(count));
      } else {
        count = parseInt((await env.JR_COUNT.get('checks')) || '0', 10);
      }
    } else {
      count = parseInt((await env.JR_COUNT.get('checks')) || '0', 10);
    }
  }
  return new Response(JSON.stringify({ count }), { headers: { 'content-type': 'application/json' } });
}
