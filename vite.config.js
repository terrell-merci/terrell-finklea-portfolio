import { execFile } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const cache = new Map();

function policyAllowsUs(block) {
  const xfo = /^x-frame-options:\s*(.+)$/im.exec(block)?.[1] || '';
  if (/deny|sameorigin|allow-from/i.test(xfo)) return false;

  const ancestors = [...block.matchAll(/^content-security-policy:\s*(.+)$/gim)].flatMap((match) =>
    [...match[1].matchAll(/frame-ancestors\s+([^;]+)/gi)].map((item) => item[1]),
  );

  if (ancestors.length === 0) return true;

  return ancestors.every((value) => {
    const tokens = value.trim().split(/\s+/);
    return tokens.includes('*') && !tokens.includes("'none'");
  });
}

function framingAllowed(raw) {
  const blocks = raw.split(/\r?\n(?=HTTP\/)/).filter((block) => block.trim());
  if (blocks.length === 0) return true;
  return blocks.every(policyAllowsUs);
}

function probe(url) {
  return new Promise((resolve, reject) => {
    execFile(
      'curl',
      ['-sI', '-L', '--max-redirs', '5', '--max-time', '8', '-A', 'Mozilla/5.0', url],
      { maxBuffer: 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(framingAllowed(stdout));
      },
    );
  });
}

function lookup(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      probe(url).catch(() => true),
    );
  }
  return cache.get(url);
}

function embedCheck() {
  const handler = (req, res, next) => {
    const requestUrl = req.url || '';
    if (!requestUrl.startsWith('/embed-check')) {
      next();
      return;
    }

    const target = new URL(requestUrl, 'http://127.0.0.1').searchParams.get('url');
    let parsed;
    try {
      parsed = target ? new URL(target) : null;
    } catch {
      parsed = null;
    }

    if (!parsed || parsed.protocol !== 'https:') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ embeddable: false }));
      return;
    }

    lookup(parsed.toString()).then((embeddable) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ embeddable }));
    });
  };

  return {
    name: 'embed-check',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), embedCheck()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
