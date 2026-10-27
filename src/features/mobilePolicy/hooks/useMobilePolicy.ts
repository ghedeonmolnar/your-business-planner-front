import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { MOBILE_POLICY_ENABLED } from '@env';
import { getMobilePolicyApi } from '@/features/mobilePolicy/api/mobilePolicyApi';
import { queryKeys } from '@/shared/api/queryKeys';
import { appBuild } from '@/shared/config/appBuild';
import {
  clearClientUpdateRequirement,
  useClientUpdateRequired,
} from '@/shared/api/clientUpdate';

const POLICY_STALE_TIME_MS = 5 * 60_000;

export const useMobilePolicy = (active: boolean) => {
  const required = useClientUpdateRequired();
  const query = useQuery({
    queryKey: queryKeys.mobilePolicy,
    queryFn: ({ signal }) => getMobilePolicyApi(signal),
    enabled: active && (MOBILE_POLICY_ENABLED === 'true' || required),
    staleTime: POLICY_STALE_TIME_MS,
    retry: 0,
  });
  const blocked =
    required ||
    (query.data?.mode === 'enforce' && appBuild < query.data.min_build);
  const refetchPolicy = query.refetch;
  const refetch = async () => {
    const result = await refetchPolicy();
    if (
      result.isSuccess &&
      result.data &&
      (result.data.mode !== 'enforce' || appBuild >= result.data.min_build)
    )
      clearClientUpdateRequirement();
    return result;
  };
  useEffect(() => {
    if (!required || !active) return;
    void refetchPolicy().then(result => {
      if (
        result.isSuccess &&
        result.data &&
        (result.data.mode !== 'enforce' || appBuild >= result.data.min_build)
      )
        clearClientUpdateRequirement();
    });
  }, [required, active, refetchPolicy]);
  return { ...query, refetch, blocked };
};
