export type FeatureFlagKey = 'attendanceV2' | 'leavePolicyV2' | 'biometricOpsV2';

function parseBoolean(v: string | undefined): boolean {
  if (!v) return false;
  const n = v.trim().toLowerCase();
  return n === '1' || n === 'true' || n === 'yes' || n === 'on';
}

const envMap: Record<FeatureFlagKey, string> = {
  attendanceV2: 'FEATURE_ATTENDANCE_V2',
  leavePolicyV2: 'FEATURE_LEAVE_POLICY_V2',
  biometricOpsV2: 'FEATURE_BIOMETRIC_OPS_V2',
};

export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  return parseBoolean(process.env[envMap[key]]);
}

export function listFeatureFlags() {
  return {
    attendanceV2: isFeatureEnabled('attendanceV2'),
    leavePolicyV2: isFeatureEnabled('leavePolicyV2'),
    biometricOpsV2: isFeatureEnabled('biometricOpsV2'),
  };
}

