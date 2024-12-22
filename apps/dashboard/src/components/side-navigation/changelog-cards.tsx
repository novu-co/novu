'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RiCloseLine } from 'react-icons/ri';
import { useQuery } from '@tanstack/react-query';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';

interface Changelog {
  id: string;
  date: string;
  title: string;
  notes: string;
  version: number;
  imageUrl?: string;
  published: boolean;
}

const CHANGELOG_API_URL = 'https://productlane.com/api/v1/changelogs/f13f1996-c9b0-4fea-8ee7-2c3faf6a832d';
const CACHE_KEY = 'cached_changelogs';
const CACHE_EXPIRY = 4 * 60 * 60 * 1000; // 4 hours
const NUMBER_OF_CARDS = 3;
const DISMISSED_STORAGE_KEY = 'dismissed_changelogs';

export const ChangelogStack = ({
  hasChangeLogItems,
  changeLogItemsLoaded,
}: {
  hasChangeLogItems?: (hasItems: boolean) => void;
  changeLogItemsLoaded?: (isLoaded: boolean) => void;
}) => {
  const CARD_OFFSET = 10;
  const SCALE_FACTOR = 0.06;
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const track = useTelemetry();

  const getDismissedChangelogs = (): string[] => {
    const dismissed = localStorage.getItem(DISMISSED_STORAGE_KEY);
    return dismissed ? JSON.parse(dismissed) : [];
  };

  const addToDismissed = (changelogId: string) => {
    const dismissed = getDismissedChangelogs();
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...dismissed, changelogId]));
  };

  const fetchChangelogs = async (): Promise<Changelog[]> => {
    const cachedData = getCachedData();
    if (cachedData) {
      return filterChangelogs(cachedData, getDismissedChangelogs());
    }

    const response = await fetch(CHANGELOG_API_URL);
    const rawData = await response.json();

    cacheData(rawData);

    return filterChangelogs(rawData, getDismissedChangelogs());
  };

  const { data: fetchedChangelogs, isLoading } = useQuery({
    queryKey: ['changelogs'],
    queryFn: fetchChangelogs,
    staleTime: 1000 * 60 * 60 * 4, // 4 hours
  });

  useEffect(() => {
    if (!isLoading) {
      changeLogItemsLoaded?.(true);
    }
  }, [isLoading, changeLogItemsLoaded]);

  useEffect(() => {
    if (fetchedChangelogs) {
      setChangelogs(fetchedChangelogs);
    }
  }, [fetchedChangelogs]);

  useEffect(() => {
    hasChangeLogItems?.(changelogs.length > 0);
  }, [changelogs, hasChangeLogItems]);

  const handleChangelogClick = (changelog: Changelog) => {
    track(TelemetryEvent.CHANGELOG_ITEM_CLICKED, { title: changelog.title });
    window.open('https://roadmap.novu.co/changelog/' + changelog.id, '_blank');

    addToDismissed(changelog.id);
    setChangelogs((prev) => prev.filter((log) => log.id !== changelog.id));
  };

  const handleDismiss = (e: React.MouseEvent, changelog: Changelog) => {
    e.stopPropagation();
    track(TelemetryEvent.CHANGELOG_ITEM_DISMISSED, { title: changelog.title });
    addToDismissed(changelog.id);
    setChangelogs((prev) => prev.filter((log) => log.id !== changelog.id));
  };

  return (
    <div className="absolute bottom-10 w-full">
      <div className="m-full relative mb-4 h-[190px]">
        {changelogs.map((changelog, index) => {
          return (
            <motion.div
              key={changelog.id}
              className="border-stroke-soft rounded-8 group absolute flex h-[175px] w-full cursor-pointer flex-col justify-between overflow-hidden border bg-white p-3 shadow-xl shadow-black/[0.1] transition-[height] duration-200 dark:border-white/[0.1] dark:bg-black dark:shadow-white/[0.05]"
              style={{
                transformOrigin: 'top center',
              }}
              animate={{
                top: index * -CARD_OFFSET,
                scale: 1 - index * SCALE_FACTOR,
                zIndex: changelogs.length - index,
              }}
              whileHover={{
                scale: (1 - index * SCALE_FACTOR) * 1.01,
                y: -2,
                transition: { duration: 0.2, ease: 'easeOut' },
              }}
              onClick={() => handleChangelogClick(changelog)}
            >
              <div>
                <div className="relative">
                  <div className="text-text-soft text-subheading-2xs">WHAT'S NEW</div>
                  <button
                    onClick={(e) => handleDismiss(e, changelog)}
                    className="absolute right-[-8px] top-[-8px] p-1 text-neutral-500 opacity-0 transition-opacity duration-200 hover:text-neutral-900 group-hover:opacity-100 dark:hover:text-white"
                  >
                    <RiCloseLine size={16} />
                  </button>
                  <div className="mb-2 flex items-center justify-between">
                    <h5 className="text-label-sm text-text-strong mt-0 line-clamp-1 dark:text-white">
                      {changelog.title}
                    </h5>
                  </div>
                  {changelog.imageUrl && (
                    <div className="relative h-[110px] w-full">
                      <img
                        src={changelog.imageUrl}
                        alt={changelog.title}
                        className="h-full w-full rounded-[6px] object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

interface CachedChangelogs {
  data: Changelog[];
  timestamp: number;
}

function getCachedData(): Changelog[] | null {
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (!cachedData) return null;

  const { data, timestamp }: CachedChangelogs = JSON.parse(cachedData);
  const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

  return isExpired ? null : data;
}

function cacheData(data: Changelog[]): void {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );
}

function filterChangelogs(changelogs: Changelog[], dismissedIds: string[]): Changelog[] {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 12);

  return changelogs
    .filter((item) => {
      const changelogDate = new Date(item.date);

      return item.published && item.imageUrl && changelogDate >= twoMonthsAgo;
    })
    .slice(0, NUMBER_OF_CARDS)
    .filter((item) => !dismissedIds.includes(item.id));
}
