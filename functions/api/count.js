// Public usage counter. Cloudflare Pages Function backed by a KV namespace
// named JR_COUNT. Counts completed checks; stores no message content.
export async function onRequest(context) {
  const { request, env } = context;
  let count = 0;
  if (env.JR_COUNT) {
    if (request.method === 'POST') {
      count = parseInt((await env.JR_COUNT.get('checks')) || '0', 10) + 1;
      await env.JR_COUNT.put('checks', String(count));
    } else {
      count = parseInt((await env.JR_COUNT.get('checks')) || '0', 10);
    }
  }
  return new Response(JSON.stringify({ count }), { headers: { 'content-type': 'application/json' } });
}
