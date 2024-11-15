import { CloudRegionEnum } from './enums';

export type DevCommandOptions = {
  port: string;
  origin: string;
  region: `${CloudRegionEnum}`;
  studioPort: string;
  dashboardUrl: string;
  route: string;
  tunnel: string;
  open: boolean; // commander.js negates flags prefixed with `--no`, so `--no-open` is `open: false`
};

export type LocalTunnelResponse = {
  id: string;
  url: string;
};
