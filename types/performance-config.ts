export type DeviceType = "mobile" | "desktop";

export interface PerformanceConfig {
  devices: DeviceType[];
}

export const DEVICE_LABELS: Record<DeviceType, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
};

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  devices: ["mobile", "desktop"],
};
