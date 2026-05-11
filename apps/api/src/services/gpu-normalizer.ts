export const CANONICAL_GPU_PROFILES = [
  "h100-80gb",
  "h100-nvl",
  "a100-80gb",
  "a100-40gb",
  "a6000-48gb",
  "a10g-24gb",
  "l40s-48gb",
  "l40-48gb",
  "l4-24gb",
  "v100-32gb",
  "v100-16gb",
  "t4-16gb",
  "rtx4090-24gb",
  "rtx3090-24gb",
  "gh200",
  "ascend-910",
  "compute-cpu",
  "compute-memory"
] as const;

export type CanonicalGpu = (typeof CANONICAL_GPU_PROFILES)[number];

const PROFILE_MAP: Record<string, CanonicalGpu> = {
  // H100 variants
  "gpu-h100": "h100-80gb",
  "gpu-h100-80gb": "h100-80gb",
  "gpu-h100-sxm-80gb": "h100-80gb",
  "gpu-h100-pcie-80gb": "h100-80gb",
  "gpu-p5-h100-80gb": "h100-80gb",
  "gpu-a3-h100-80gb": "h100-80gb",
  "gpu-nc96-h100": "h100-80gb",
  "gpu-bm-h100": "h100-80gb",
  "gpu-ecs-h100-80gb": "h100-80gb",
  "gpu-hcc-h100": "h100-80gb",
  "gpu-p2vs-h100": "h100-80gb",
  "gpu-h100-nvl-188gb": "h100-nvl",

  // A100 variants
  "gpu-a100": "a100-80gb",
  "gpu-a100-80gb": "a100-80gb",
  "gpu-a100-sxm-80gb": "a100-80gb",
  "gpu-p4d-a100-40gb": "a100-40gb",
  "gpu-a2-a100-40gb": "a100-40gb",
  "gpu-nc48-a100": "a100-80gb",
  "gpu-bm-a100-80gb": "a100-80gb",
  "gpu-ecs-a100-80gb": "a100-80gb",
  "gpu-a100-pcie-80gb": "a100-80gb",

  // A6000
  "gpu-a6000": "a6000-48gb",
  "gpu-a6000-48gb": "a6000-48gb",

  // A10G
  "gpu-g5-a10g-24gb": "a10g-24gb",
  "gpu-nc24ads-a10": "a10g-24gb",
  "gpu-vm-gpu3-a10": "a10g-24gb",

  // L40S
  "gpu-l40s": "l40s-48gb",
  "gpu-l40s-48gb": "l40s-48gb",
  "gpu-g6e-l40s-48gb": "l40s-48gb",

  // L40
  "gpu-l40": "l40-48gb",
  "gpu-l40-48gb": "l40-48gb",

  // L4
  "gpu-g2-l4-24gb": "l4-24gb",

  // V100
  "gpu-v100": "v100-32gb",
  "gpu-v100-32gb": "v100-32gb",
  "gpu-v100-16gb": "v100-16gb",
  "gpu-gn10x-v100": "v100-32gb",
  "gpu-ecs-v100-32gb": "v100-32gb",

  // T4
  "gpu-t4": "t4-16gb",
  "gpu-t4-16gb": "t4-16gb",
  "gpu-gn7-t4": "t4-16gb",
  "gpu-ecs-t4-16gb": "t4-16gb",

  // RTX
  "gpu-rtx4090-24gb": "rtx4090-24gb",
  "gpu-rtx3090-24gb": "rtx3090-24gb",

  // Other
  "gpu-gh200": "gh200",
  "gpu-ascend-910": "ascend-910"
};

const COMPUTE_PATTERNS = [
  /^compute-/,
  /^serverless-/,
  /^function-/,
  /^lambda-/,
  /^cloud-run/,
  /^app-platform/,
  /^ml-arena/,
  /^translate-/,
  /^speech-to-text/,
  /^tts-/,
  /^whisper/,
  /^sd-xl/,
  /^flux-/,
  /^stable-diffusion/,
  /^workers-/,
  /^r2-/,
  /^d1-/,
  /^vectorize/,
  /^browser-/,
  /^edge-/,
  /^ion-/,
  /^image-/,
  /^bot-/,
  /^waf-/
];

export function normalizeProfile(raw: string): CanonicalGpu | "compute-cpu" {
  const lower = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-");

  const direct = PROFILE_MAP[lower];
  if (direct) {
    return direct;
  }

  const keyMatch = Object.keys(PROFILE_MAP).find((key) => lower.includes(key));
  if (keyMatch && PROFILE_MAP[keyMatch]) {
    return PROFILE_MAP[keyMatch];
  }

  for (const pattern of COMPUTE_PATTERNS) {
    if (pattern.test(lower)) {
      return "compute-cpu";
    }
  }

  if (lower.includes("memory") || lower.includes("ram")) {
    return "compute-memory";
  }

  return "compute-cpu";
}

export function normalizeAll(raw: string): string[] {
  const canonical = normalizeProfile(raw);

  if (canonical === "compute-cpu") {
    return [canonical, "compute-memory"];
  }

  return [canonical];
}
