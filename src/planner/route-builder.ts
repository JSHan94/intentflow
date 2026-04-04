import type { OperationType } from '@/types/plan';
import { MOCK_FEES, lookupFees } from '@/data/mock-fees';

export interface RouteHop {
  from: string;
  to: string;
  method: OperationType;
  fee_usd: number;
  time_seconds: number;
}

export interface Route {
  hops: RouteHop[];
  total_fee_usd: number;
  total_time_seconds: number;
}

export function buildRoutes(source: string, destination: string): Route[] {
  const routes: Route[] = [];

  if (source === destination) return routes;

  // Direct route
  const directFees = lookupFees(source, destination);
  for (const fee of directFees) {
    routes.push({
      hops: [{
        from: source,
        to: destination,
        method: fee.method,
        fee_usd: fee.base_fee_usd,
        time_seconds: fee.time_seconds,
      }],
      total_fee_usd: fee.base_fee_usd,
      total_time_seconds: fee.time_seconds,
    });
  }

  // Via L1 (hub-and-spoke): source -> initia_l1 -> destination
  if (source !== 'initia_l1' && destination !== 'initia_l1') {
    const leg1Options = lookupFees(source, 'initia_l1');
    const leg2Options = lookupFees('initia_l1', destination);

    for (const leg1 of leg1Options) {
      for (const leg2 of leg2Options) {
        routes.push({
          hops: [
            {
              from: source,
              to: 'initia_l1',
              method: leg1.method,
              fee_usd: leg1.base_fee_usd,
              time_seconds: leg1.time_seconds,
            },
            {
              from: 'initia_l1',
              to: destination,
              method: leg2.method,
              fee_usd: leg2.base_fee_usd,
              time_seconds: leg2.time_seconds,
            },
          ],
          total_fee_usd: leg1.base_fee_usd + leg2.base_fee_usd,
          total_time_seconds: leg1.time_seconds + leg2.time_seconds,
        });
      }
    }
  }

  return routes;
}

export function cheapestRoute(routes: Route[]): Route | null {
  if (routes.length === 0) return null;
  return routes.reduce((min, r) => r.total_fee_usd < min.total_fee_usd ? r : min);
}

export function fastestRoute(routes: Route[]): Route | null {
  if (routes.length === 0) return null;
  return routes.reduce((min, r) => r.total_time_seconds < min.total_time_seconds ? r : min);
}

export function fewestHopsRoute(routes: Route[]): Route | null {
  if (routes.length === 0) return null;
  return routes.reduce((min, r) => r.hops.length < min.hops.length ? r : min);
}
