import { useFlags } from 'launchdarkly-react-client-sdk';
import { FeatureFlagsKeysEnum, prepareBooleanStringFeatureFlag } from '@novu/shared';
import { LAUNCH_DARKLY_CLIENT_SIDE_ID } from '../config';

function isLaunchDarklyEnabled() {
  return !!LAUNCH_DARKLY_CLIENT_SIDE_ID;
}

export const useFeatureFlag = (key: FeatureFlagsKeysEnum, defaultValue = false): boolean => {
  const flags = useFlags();

  if (!isLaunchDarklyEnabled()) {
    const envValue =
      // Check window._env_ first
      window?._env_?.[key] ??
      // Then check process.env if process exists
      (typeof process !== 'undefined' ? process?.env?.[key] : undefined);

    return prepareBooleanStringFeatureFlag(envValue, defaultValue);
  }

  return flags[key] ?? defaultValue;
};
