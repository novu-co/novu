import { useContext } from 'react';
import { NovuContext } from '../store/novu-provider.context';
import { useProviderCheck } from './useProviderCheck';
import { type INovuProviderContext } from '../shared/interfaces';

/**
 * custom hook for accessing NovuContext
 * @returns INovuProviderContext
 */
export function useNovuContext(): INovuProviderContext {
  const novuContext = useContext<INovuProviderContext>(NovuContext);
  const context = useProviderCheck<INovuProviderContext>(novuContext);

  return context;
}
