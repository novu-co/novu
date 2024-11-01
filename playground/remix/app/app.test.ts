import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { ChildProcess, spawn } from 'node:child_process';

describe('Remix framework handler', () => {
  let serverProcess: ChildProcess;
  beforeAll(async () => {
    serverProcess = spawn('pnpm', ['dev'], { stdio: 'inherit' });

    serverProcess.on('error', (error) => {
      console.error(`Failed to start server: ${error.message}`);
    });

    serverProcess.on('close', (code, signal) => {
      if (signal !== 'SIGTERM') {
        console.error(`Server process exited with code ${code}`);
      }
    });
  });

  afterAll(() => {
    serverProcess.kill();
  });

  it('should return a successful health-check response', async () => {
    const response = await fetch('http://localhost:5173/api/novu');
    expect(response.status).toEqual(200);

    const data = await response.json();
    const { headers } = response;
    expect(data.status).toEqual('ok');
    expect(headers.get('novu-framework-server')).toEqual('remix');
  });
});
