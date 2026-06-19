import { usePonds } from '../context/PondContext';

/**
 * Delegator hook to return the live, centralized simulation state of the ponds.
 */
export function useRealTimeData() {
  const { ponds } = usePonds();
  return ponds;
}
