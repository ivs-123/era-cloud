import type {
  ProviderCapability,
  ProviderStatus,
  ProviderType,
  RoutingCandidate,
  RoutingPolicy,
  WorkloadKind,
  WorkloadState
} from "@era/common";

export interface TenantRecord {
  id: string;
  name: string;
  status: "active" | "suspended";
  createdAt: string;
}

export interface ProviderRecord {
  id: string;
  name: string;
  type: ProviderType;
  status: ProviderStatus;
  regions: string[];
  capabilities: string[];
  capabilityDetails: ProviderCapability[];
  createdAt: string;
}

export interface WorkloadRecord {
  id: string;
  tenantId: string;
  kind: WorkloadKind;
  profile: string;
  region: string;
  routingPolicy: RoutingPolicy;
  state: WorkloadState;
  selectedProviderId: string;
  constraints: {
    maxHourlyCostUsd?: number;
    latencyTargetMs?: number;
  };
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface RoutingDecisionRecord {
  id: string;
  workloadId?: string;
  tenantId: string;
  winnerProviderId: string;
  candidateScores: RoutingCandidate[];
  reasonCode: string;
  createdAt: string;
}

export interface UsageEventRecord {
  id: string;
  tenantId: string;
  workloadId: string;
  providerId: string;
  eventTime: string;
  metric: string;
  quantity: number;
  unitCostUsd: number;
}

export interface InvoiceRecord {
  id: string;
  tenantId: string;
  billingPeriodId: string;
  subtotalUsd: number;
  markupUsd: number;
  totalUsd: number;
  currency: string;
  status: "draft" | "issued" | "paid" | "void";
  issuedAt?: string;
  lines: InvoiceLineRecord[];
}

export interface InvoiceLineRecord {
  id: string;
  invoiceId: string;
  workloadId?: string;
  providerId?: string;
  description: string;
  quantity: number;
  unitPriceUsd: number;
  amountUsd: number;
}

export interface TenantKeyRecord {
  id: string;
  tenantId: string;
  providerName: string;
  keyLabel: string;
  keyPrefix: string;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  tenantId: string;
  role: string;
  createdAt: string;
}

export interface ApiKeyRecord {
  id: string;
  tenantId: string;
  userId: string;
  prefix: string;
  hash: string;
  createdAt: string;
}

export interface EraStore {
  createTenant(input: { name: string }): Promise<TenantRecord>;
  listTenants(): Promise<TenantRecord[]>;
  getTenant(id: string): Promise<TenantRecord | undefined>;
  createProvider(input: Omit<ProviderRecord, "id" | "createdAt" | "capabilityDetails"> & { capabilityDetails?: ProviderCapability[] }): Promise<ProviderRecord>;
  listProviders(): Promise<ProviderRecord[]>;
  updateProviderCapabilities(id: string, capabilityDetails: ProviderCapability[], status: string): Promise<ProviderRecord>;
  createWorkload(input: Omit<WorkloadRecord, "id" | "createdAt" | "updatedAt">): Promise<WorkloadRecord>;
  listWorkloads(): Promise<WorkloadRecord[]>;
  getWorkload(id: string): Promise<WorkloadRecord | undefined>;
  updateWorkloadState(id: string, state: WorkloadState): Promise<WorkloadRecord | undefined>;
  createRoutingDecision(input: Omit<RoutingDecisionRecord, "id" | "createdAt">): Promise<RoutingDecisionRecord>;
  listRoutingDecisions(): Promise<RoutingDecisionRecord[]>;

  createUser(input: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord>;
  getUserByEmail(email: string): Promise<UserRecord | undefined>;
  addApiKey(input: Omit<ApiKeyRecord, "id" | "createdAt">): Promise<ApiKeyRecord>;
  listApiKeys(tenantId: string): Promise<ApiKeyRecord[]>;

  addTenantKey(input: Omit<TenantKeyRecord, "id" | "createdAt">): Promise<TenantKeyRecord>;
  listTenantKeys(tenantId: string): Promise<TenantKeyRecord[]>;
  removeTenantKey(id: string, tenantId?: string): Promise<void>;

  recordUsageEvent(input: Omit<UsageEventRecord, "id">): Promise<UsageEventRecord>;
  listUsageEvents(params: { tenantId: string; from?: string; to?: string }): Promise<UsageEventRecord[]>;
  createInvoice(input: Omit<InvoiceRecord, "id">): Promise<InvoiceRecord>;
  listInvoices(params: { tenantId?: string }): Promise<InvoiceRecord[]>;

  close?(): Promise<void>;
}
