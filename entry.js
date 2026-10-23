export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Block sensitive directories and files from public web access
    if (
      url.pathname.startsWith('/.') ||
      url.pathname.startsWith('/scripts') ||
      url.pathname.startsWith('/cloudflare-worker') ||
      url.pathname === '/HANDOVER' ||
      url.pathname === '/entry.js' ||
      url.pathname.endsWith('.md') ||
      url.pathname.endsWith('.jsonc') ||
      url.pathname.endsWith('.toml')
    ) {
      return new Response('Not Found', { status: 404 });
    }
    return env.ASSETS.fetch(request);
  }
};
