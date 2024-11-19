import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select';
import { EuFlag } from '../icons/flags/eu';
import { USFlag } from '../icons/flags/us';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { Tooltip, TooltipTrigger } from '../primitives/tooltip';
import { TooltipProvider } from '../primitives/tooltip';
import { TooltipContent } from '../primitives/tooltip';

const REGION_MAP = {
  US: 'US',
  EU: 'EU',
} as const;

type RegionType = (typeof REGION_MAP)[keyof typeof REGION_MAP];

function getDefaultRegion(): RegionType {
  if (typeof window === 'undefined') return REGION_MAP.US;

  return window.location.hostname.includes('eu.') ? REGION_MAP.EU : REGION_MAP.US;
}

export function RegionPicker() {
  const [selectedRegion] = useState<RegionType>(getDefaultRegion());

  function handleRegionChange(value: RegionType) {
    switch (value) {
      case REGION_MAP.US:
        window.location.href = 'https://dashboard.novu.co';
        break;
      case REGION_MAP.EU:
        window.location.href = 'https://eu.dashboard.novu.co';
        break;
    }
  }

  return (
    <div className="inline-flex w-full items-center justify-center gap-[6px]">
      <div className="text-xs font-medium leading-none text-[#99a0ad]">
        Data Residency
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger className="ml-1">
              <BsFillInfoCircleFill className="text-foreground-300 -mt-0.5 inline size-3" />
            </TooltipTrigger>
            <TooltipContent>
              Novu offers data residency in Europe (Germany) and United States. Account residency couldn't be modified
              after sign-up.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={selectedRegion} onValueChange={handleRegionChange}>
        <SelectTrigger className="h-[22px] w-[64px] p-[4px] pl-[6px] text-[10px] leading-[14px]">
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(REGION_MAP).map((option) => (
            <SelectItem key={option} value={option} className="w-[100px] w-full">
              <div className="flex items-center gap-[6px]">
                {' '}
                {option === REGION_MAP.US ? (
                  <USFlag className="h-[10px] w-[10px]" />
                ) : (
                  <EuFlag className="h-[10px] w-[10px]" />
                )}{' '}
                {option}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
