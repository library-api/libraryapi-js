export type OutletType = 'central' | 'branch' | 'bookmobile' | 'books-by-mail';
export type GeocodeQuality = 'high' | 'medium' | 'low';

export interface Address {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  zip4?: string | null;
}

export interface GeoPoint {
  lat: number | null;
  lng: number | null;
  geocodeQuality?: GeocodeQuality | null;
}

export interface ParentSystem {
  fscsId: string;
  name: string;
}

export interface OutletService {
  annualHours?: number | null;
  weeksOpen?: number | null;
  squareFootage?: number | null;
}

export interface Outlet {
  outletId: string;
  fscsId: string;
  name: string;
  outletType?: OutletType;
  parentSystem?: ParentSystem;
  address: Address;
  phone?: string | null;
  geo?: GeoPoint | null;
  service?: OutletService | null;
  status?: string | null;
  dataYear: string;
  distanceMiles?: number | null;
  /** Convenience: round(annualHours / weeksOpen). null if missing. */
  weeklyHours: number | null;
}

export interface Locale {
  code?: string | null;
  name?: string | null;
}

export interface ServiceArea {
  population?: number | null;
  centralLibraries?: number | null;
  branches?: number | null;
  bookmobiles?: number | null;
}

export interface Collections {
  printVolumes?: number | null;
  ebooks?: number | null;
  audioPhysical?: number | null;
  audioDownloadable?: number | null;
  videoPhysical?: number | null;
  videoDownloadable?: number | null;
}

export interface Programs {
  total?: number | null;
  kids?: number | null;
  youngAdult?: number | null;
  attendanceTotal?: number | null;
  attendanceKids?: number | null;
  attendanceYa?: number | null;
}

export interface Technology {
  publicComputers?: number | null;
  computerSessions?: number | null;
  wifiSessions?: number | null;
  websiteVisits?: number | null;
}

export interface Usage {
  annualVisits?: number | null;
  registeredBorrowers?: number | null;
  totalCirculation?: number | null;
  kidsCirculation?: number | null;
  physicalCirculation?: number | null;
  electronicCirculation?: number | null;
  programs?: Programs | null;
  technology?: Technology | null;
}

export interface StaffFTE {
  mlsLibrarians?: number | null;
  librarians?: number | null;
  other?: number | null;
  total?: number | null;
}

export interface Finance {
  totalRevenue?: number | null;
  localRevenue?: number | null;
  stateRevenue?: number | null;
  federalRevenue?: number | null;
  otherRevenue?: number | null;
  totalExpenditures?: number | null;
  perCapitaExpenditure?: number | null;
  staffFte?: StaffFTE | null;
}

export interface LibrarySystem {
  fscsId: string;
  name: string;
  state: string;
  county?: string | null;
  address: Address;
  phone?: string | null;
  legalBasis?: string | null;
  locale?: Locale | null;
  serviceArea?: ServiceArea | null;
  collections?: Collections | null;
  usage?: Usage | null;
  finance?: Finance | null;
  outletsCount?: number | null;
  status?: string | null;
  dataYear: string;
}

export interface StateTotals {
  librarySystems: number;
  outlets: number;
  serviceAreaPopulation?: number | null;
  annualVisits?: number | null;
  totalCirculation?: number | null;
  totalExpenditures?: number | null;
}

export interface StateAverages {
  perCapitaExpenditure?: number | null;
  outletsPerSystem?: number | null;
}

export interface StateSummary {
  state: string;
  dataYear: string;
  totals: StateTotals;
  averages: StateAverages;
}

export interface OutletNearOpts {
  address?: string;
  lat?: number;
  lng?: number;
  /** Min 0.1, max 50. Default 10. */
  radiusMiles?: number;
  /** Min 1, max 100. Default 10. */
  limit?: number;
}

export interface LibrarySearchOpts {
  name?: string;
  state?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

export interface LibraryAPIOptions {
  baseUrl?: string;
  /** Request timeout in milliseconds. Default 30000. */
  timeout?: number;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  db: boolean;
  source: { imls_year: string; updated_at: string; freshness_days: number };
}

export class LibraryAPI {
  constructor(apiKey: string, options?: LibraryAPIOptions);
  outlets: {
    near(opts: OutletNearOpts): Promise<Outlet[]>;
    fetch(outletId: string): Promise<Outlet>;
  };
  libraries: {
    fetch(fscsId: string): Promise<LibrarySystem>;
    search(opts: LibrarySearchOpts): Promise<LibrarySystem[]>;
  };
  states: {
    summary(code: string): Promise<StateSummary>;
  };
  health(): Promise<HealthResponse>;
}

export const VERSION: string;

export class LibraryAPIError extends Error {
  statusCode: number | null;
  code: string | null;
}
export class AuthenticationError extends LibraryAPIError {}
export class QuotaExceededError extends LibraryAPIError {}
export class NotFoundError extends LibraryAPIError {}
export class RateLimitError extends LibraryAPIError {}
export class InvalidParamsError extends LibraryAPIError {}

export default LibraryAPI;
