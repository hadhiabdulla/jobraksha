// "Was this helpful?" feedback. KV namespace JR_COUNT, keys fb:yes / fb:no.
export async function onRequest(context) {
  const { request, env } = context;
  const v = new URL(request.url).searchParams.get('v');
  if (env.JR_COUNT && (v === 'yes' || v === 'no')) {
    const k = 'fb:' + v;
    const n = parseInt((await env.JR_COUNT.get(k)) || '0', 10) + 1;
    await env.JR_COUNT.put(k, String(n));
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
}
