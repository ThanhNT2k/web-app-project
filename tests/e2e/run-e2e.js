const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const viteCli = path.join(root, 'frontend/node_modules/vite/bin/vite.js');
const playwrightCli = path.join(root, 'node_modules/@playwright/test/cli.js');

function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode < 500) return resolve();
        setTimeout(check, 200);
      });
      req.on('error', () => {
        if (Date.now() - started >= timeoutMs) {
          reject(new Error(`E2E web server did not start within ${timeoutMs}ms`));
          return;
        }
        setTimeout(check, 200);
      });
      req.setTimeout(1000, () => req.destroy());
    };
    check();
  });
}

function stopProcessTree(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 2000);
    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
    child.kill('SIGTERM');
  });
}

async function run() {
  const server = spawn(process.execPath, [
    viteCli, 'preview', 'frontend', '--host', '127.0.0.1', '--port', '4173',
  ], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);

  try {
    await waitForServer('http://127.0.0.1:4173');
    const tests = spawn(process.execPath, [playwrightCli, 'test'], {
      cwd: root,
      stdio: 'inherit',
      windowsHide: true,
      env: { ...process.env, E2E_EXTERNAL_SERVER: '1' },
    });
    const exitCode = await new Promise((resolve, reject) => {
      tests.on('exit', (code) => resolve(code ?? 1));
      tests.on('error', reject);
    });
    process.exitCode = exitCode;
  } finally {
    await stopProcessTree(server);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
