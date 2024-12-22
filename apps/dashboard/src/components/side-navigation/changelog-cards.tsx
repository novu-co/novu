import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RiCloseLine } from 'react-icons/ri';
import { useQuery } from '@tanstack/react-query';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';

type Changelog = {
  id: string;
  date: string;
  title: string;
  notes?: string;
  version: number;
  imageUrl?: string;
  published: boolean;
};

type CachedChangelogs = {
  data: Changelog[];
  timestamp: number;
};

const CONSTANTS = {
  CHANGELOG_API_URL: 'https://productlane.com/api/v1/changelogs/f13f1996-c9b0-4fea-8ee7-2c3faf6a832d',
  CACHE_KEY: 'cached_changelogs',
  CACHE_EXPIRY: 4 * 60 * 60 * 1000, // 4 hours
  NUMBER_OF_CARDS: 3,
  DISMISSED_STORAGE_KEY: 'dismissed_changelogs',
  CARD_OFFSET: 10,
  SCALE_FACTOR: 0.06,
} as const;

export function ChangelogStack() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const track = useTelemetry();

  const fetchChangelogs = async (): Promise<Changelog[]> => {
    const cachedData = storage.getCachedData();
    if (cachedData) {
      return filterChangelogs(cachedData, storage.getDismissedChangelogs());
    }

    const response = await fetch(CONSTANTS.CHANGELOG_API_URL);
    const rawData = await response.json();

    storage.cacheData(rawData);

    return filterChangelogs(rawData, storage.getDismissedChangelogs());
  };

  const { data: fetchedChangelogs } = useQuery({
    queryKey: ['changelogs'],
    queryFn: fetchChangelogs,
    staleTime: CONSTANTS.CACHE_EXPIRY,
  });

  useEffect(() => {
    if (fetchedChangelogs) {
      setChangelogs(fetchedChangelogs);
    }
  }, [fetchedChangelogs]);

  const handleChangelogClick = (changelog: Changelog) => {
    track(TelemetryEvent.CHANGELOG_ITEM_CLICKED, { title: changelog.title });
    window.open('https://roadmap.novu.co/changelog/' + changelog.id, '_blank');

    storage.addToDismissed(changelog.id);
    setChangelogs((prev) => prev.filter((log) => log.id !== changelog.id));
  };

  const handleDismiss = (e: React.MouseEvent, changelog: Changelog) => {
    e.stopPropagation();
    track(TelemetryEvent.CHANGELOG_ITEM_DISMISSED, { title: changelog.title });
    storage.addToDismissed(changelog.id);
    setChangelogs((prev) => prev.filter((log) => log.id !== changelog.id));
  };

  return (
    <div className="absolute bottom-10 w-full">
      <div className="m-full relative mb-4 h-[190px]">
        {changelogs.map((changelog, index) => (
          <ChangelogCard
            key={changelog.id}
            changelog={changelog}
            index={index}
            totalCards={changelogs.length}
            onDismiss={handleDismiss}
            onClick={handleChangelogClick}
          />
        ))}
      </div>
    </div>
  );
}

const storage = {
  getDismissedChangelogs: (): string[] => {
    const dismissed = localStorage.getItem(CONSTANTS.DISMISSED_STORAGE_KEY);
    return dismissed ? JSON.parse(dismissed) : [];
  },

  addToDismissed: (changelogId: string): void => {
    const dismissed = storage.getDismissedChangelogs();

    localStorage.setItem(CONSTANTS.DISMISSED_STORAGE_KEY, JSON.stringify([...dismissed, changelogId]));
  },

  getCachedData: (): Changelog[] | null => {
    const cachedData = localStorage.getItem(CONSTANTS.CACHE_KEY);
    if (!cachedData) return null;

    const { data, timestamp }: CachedChangelogs = JSON.parse(cachedData);
    const isExpired = Date.now() - timestamp > CONSTANTS.CACHE_EXPIRY;

    return isExpired ? null : data;
  },

  cacheData: (data: Changelog[]): void => {
    // Remove unneeded fields and data from the changelog
    const cleanedData = data
      .map((changelog) => {
        delete changelog.notes;

        return changelog;
      })
      .filter((changelog) => changelog.published && changelog.imageUrl);

    localStorage.setItem(
      CONSTANTS.CACHE_KEY,
      JSON.stringify({
        data: cleanedData,
        timestamp: Date.now(),
      })
    );
  },
};

function filterChangelogs(changelogs: Changelog[], dismissedIds: string[]): Changelog[] {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  return changelogs
    .filter((item) => {
      const changelogDate = new Date(item.date);

      return item.published && item.imageUrl && changelogDate >= twoMonthsAgo;
    })
    .slice(0, CONSTANTS.NUMBER_OF_CARDS)
    .filter((item) => !dismissedIds.includes(item.id));
}

function ChangelogCard({
  changelog,
  index,
  totalCards,
  onDismiss,
  onClick,
}: {
  changelog: Changelog;
  index: number;
  totalCards: number;
  onDismiss: (e: React.MouseEvent, changelog: Changelog) => void;
  onClick: (changelog: Changelog) => void;
}) {
  return (
    <motion.div
      key={changelog.id}
      className="border-stroke-soft rounded-8 group absolute flex h-[175px] w-full cursor-pointer flex-col justify-between overflow-hidden border bg-white p-3 shadow-xl shadow-black/[0.1] transition-[height] duration-200 dark:border-white/[0.1] dark:bg-black dark:shadow-white/[0.05]"
      style={{ transformOrigin: 'top center' }}
      animate={{
        top: index * -CONSTANTS.CARD_OFFSET,
        scale: 1 - index * CONSTANTS.SCALE_FACTOR,
        zIndex: totalCards - index,
      }}
      whileHover={{
        scale: (1 - index * CONSTANTS.SCALE_FACTOR) * 1.01,
        y: -2,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      onClick={() => onClick(changelog)}
    >
      <div>
        <div className="relative">
          <div className="text-text-soft text-subheading-2xs">WHAT'S NEW</div>
          <button
            onClick={(e) => onDismiss(e, changelog)}
            className="absolute right-[-8px] top-[-8px] p-1 text-neutral-500 opacity-0 transition-opacity duration-200 hover:text-neutral-900 group-hover:opacity-100 dark:hover:text-white"
          >
            <RiCloseLine size={16} />
          </button>
          <div className="mb-2 flex items-center justify-between">
            <h5 className="text-label-sm text-text-strong mt-0 line-clamp-1 dark:text-white">{changelog.title}</h5>
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
}
