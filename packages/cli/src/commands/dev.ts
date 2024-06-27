import { DevServer } from '../dev-server';
import { NtfrTunnel } from '@novu/ntfr-client';
import { showWelcomeScreen } from './init.consts';
import * as ora from 'ora';
import * as open from 'open';
import * as chalk from 'chalk';

process.on('SIGINT', function () {
  // TODO: Close the NTFR Tunnel
  process.exit();
});

export enum WebRegionEnum {
  US = 'us',
  EU = 'eu',
  STAGING = 'staging',
}

export enum WebUrlEnum {
  US = 'https://web.novu.co',
  EU = 'https://eu.web.novu.co',
  STAGING = 'https://dev.web.novu.co',
}

export const LOCALHOST = 'localhost';

const TUNNEL_URL = 'https://ntfr.dev/api/tunnels';

export type DevCommandOptions = {
  port: string;
  origin: string;
  region: `${WebRegionEnum}`;
  webPort: string;
  webUrl: string;
  route: string;
};

export async function devCommand(options: DevCommandOptions) {
  showWelcomeScreen();

  const parsedOptions = parseOptions(options);
  const devSpinner = ora('Creating a development local tunnel').start();
  const tunnelOrigin = await createTunnel(parsedOptions.origin);
  const NOVU_ENDPOINT_PATH = options.route;

  devSpinner.succeed(`Local Tunnel started:\t${tunnelOrigin}`);

  const opts = {
    ...parsedOptions,
    tunnelOrigin,
  };

  const httpServer = new DevServer(opts);

  const studioSpinner = ora('Starting local studio server').start();
  await httpServer.listen();

  studioSpinner.succeed(`Novu Studio started:\t${httpServer.getStudioAddress()}`);
  if (process.env.NODE_ENV !== 'dev') {
    await open(httpServer.getStudioAddress());
  }

  await endpointHealthChecker(parsedOptions, NOVU_ENDPOINT_PATH);
}

async function endpointHealthChecker(parsedOptions: DevCommandOptions, endpointRoute: string) {
  const fullEndpoint = `${parsedOptions.origin}${endpointRoute}`;
  let healthy = false;
  const endpointText = `Bridge Endpoint scan:\t${fullEndpoint}
  
  Ensure your application is configured and running locally.`;
  const endpointSpinner = ora(endpointText).start();

  let counter = 0;
  while (!healthy) {
    try {
      const response = await fetch(`${fullEndpoint}?action=health-check`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const healthResponse = await response.json();
      healthy = healthResponse.status === 'ok';

      if (healthy) {
        endpointSpinner.succeed(`Bridge Endpoint up:\t${fullEndpoint}`);
      } else {
        await wait(1000);
      }
    } catch (e) {
      await wait(1000);
    } finally {
      counter++;

      if (counter === 10) {
        endpointSpinner.text = `Bridge Endpoint:\t${fullEndpoint}

  Ensure your application is configured and running locally.

  Starting out? Use our starter ${chalk.bold('npx create-novu-app@latest')}
  Running on a different route or port? Use ${chalk.bold('--route')} or ${chalk.bold('--port')}
          `;
      }
    }
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseOptions(options: DevCommandOptions) {
  const { origin, port, region } = options || {};

  return {
    ...options,
    origin: origin || getDefaultOrigin(port),
    webUrl: options.webUrl || getDefaultWebUrl(region),
  };
}

function getDefaultOrigin(port: string) {
  return `http://${LOCALHOST}:${port}`;
}

function getDefaultWebUrl(region: string) {
  switch (region) {
    case WebRegionEnum.EU:
      return WebUrlEnum.EU;
    case WebRegionEnum.STAGING:
      return WebUrlEnum.STAGING;
    case WebRegionEnum.US:
    default:
      return WebUrlEnum.US;
  }
}

type LocalTunnelResponse = {
  id: string;
  url: string;
};

async function createTunnel(localOrigin: string) {
  const response = await fetch(TUNNEL_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: `Bearer 12345`,
    },
  });
  const { url } = (await response.json()) as LocalTunnelResponse;

  const parsedUrl = new URL(url);
  const parsedOrigin = new URL(localOrigin);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ws = await import('ws');
  const ntfrTunnel = new NtfrTunnel(
    parsedUrl.host,
    parsedOrigin.host,
    false,
    {
      WebSocket: ws,
      connectionTimeout: 2000,
      maxRetries: 10,
    },
    { verbose: false }
  );

  await ntfrTunnel.connect();

  return parsedUrl.origin;
}
