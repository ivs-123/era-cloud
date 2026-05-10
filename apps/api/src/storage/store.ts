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

export interface EraStore {
  createTenant(input: { name: string }): Promise<TenantRecord>;
  listTenants(): Promise<TenantRecord[]>;
  getTenant(id: string): Promise<TenantRecord | undefined>;
  createProvider(input: Omit<ProviderRecord, "id" | "createdAt" | "capabilityDetails"> & { capabilityDetails?: ProviderCapability[] }): Promise<ProviderRecord>;
  listProviders(): Promise<ProviderRecord[]>;
  createWorkload(input: Omit<WorkloadRecord, "id" | "createdAt" | "updatedAt">): Promise<WorkloadRecord>;
  listWorkloads(): Promise<WorkloadRecord[]>;
  getWorkload(id: string): Promise<WorkloadRecord | undefined>;
  updateWorkloadState(id: string, state: WorkloadState): Promise<WorkloadRecord | undefined>;
  createRoutingDecision(input: Omit<RoutingDecisionRecord, "id" | "createdAt">): Promise<RoutingDecisionRecord>;
  listRoutingDecisions(): Promise<RoutingDecisionRecord[]>;
  close?(): Promise<void>;
}

