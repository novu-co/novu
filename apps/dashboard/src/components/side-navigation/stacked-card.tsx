'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Changelog {
  id: string;
  createdAt: string;
  title: string;
  notes: string;
  version: number;
  imageUrl?: string;
}

export const ChangelogStack = () => {
  const CARD_OFFSET = 10;
  const SCALE_FACTOR = 0.06;
  const STORAGE_KEY = 'dismissed_changelogs';
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);

  const getDismissedChangelogs = (): string[] => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    return dismissed ? JSON.parse(dismissed) : [];
  };

  const addToDismissed = (changelogId: string) => {
    const dismissed = getDismissedChangelogs();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, changelogId]));
  };

  useEffect(() => {
    const fetchChangelogs = async () => {
      try {
        const response = await fetch('https://productlane.com/api/v1/changelogs/f13f1996-c9b0-4fea-8ee7-2c3faf6a832d');
        const data = await response.json();
        const dismissedIds = getDismissedChangelogs();
        const latestChangelogs = data
          .filter((item: any) => item.published && item.imageUrl)
          .slice(0, 3)
          .filter((item: any) => !dismissedIds.includes(item.id));
        setChangelogs(latestChangelogs);
      } catch (error) {
        console.error('Error fetching changelogs:', error);
      }
    };

    fetchChangelogs();
  }, []);

  const moveToFront = (clickedChangelog: Changelog) => {
    const newChangelogs = changelogs.filter((log) => log.id !== clickedChangelog.id);
    setChangelogs([clickedChangelog, ...newChangelogs]);
  };

  const handleDismiss = (e: React.MouseEvent, changelogId: string) => {
    e.stopPropagation();
    addToDismissed(changelogId);
    setChangelogs((prev) => prev.filter((log) => log.id !== changelogId));
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add your read more logic here
  };

  return (
    <div className="m-full relative mb-4 h-[190px]">
      {changelogs.map((changelog, index) => {
        return (
          <motion.div
            key={changelog.id}
            className="group absolute flex h-[190px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 shadow-xl shadow-black/[0.1] transition-[height] duration-200 hover:h-[220px] dark:border-white/[0.1] dark:bg-black dark:shadow-white/[0.05]"
            style={{
              transformOrigin: 'top center',
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR,
              zIndex: changelogs.length - index,
            }}
            whileHover={{
              scale: (1 - index * SCALE_FACTOR) * 1.05,
              y: -5,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            onClick={() => moveToFront(changelog)}
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="line-clamp-2 text-sm font-medium text-neutral-900 dark:text-white">{changelog.title}</h5>
              </div>
              {changelog.imageUrl && (
                <div className="relative h-[120px] w-full">
                  <img
                    src={changelog.imageUrl}
                    alt={changelog.title}
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex w-full justify-between bg-white/80 opacity-0 backdrop-blur transition-all duration-200 group-hover:opacity-100 dark:border-neutral-800 dark:bg-black/80">
              <button
                onClick={(e) => handleDismiss(e, changelog.id)}
                className="rounded-md px-2 py-1 text-xs text-neutral-400 transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white"
              >
                Dismiss
              </button>
              <button
                onClick={handleReadMore}
                className="rounded-md px-2 py-1 text-xs text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                Read more
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
