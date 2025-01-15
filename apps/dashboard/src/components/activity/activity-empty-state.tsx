import { Button } from '@/components/primitives/button';
import { useEnvironment } from '@/context/environment/hooks';
import { buildRoute, ROUTES } from '@/utils/routes';
import { cn } from '@/utils/ui';
import { AnimatePresence, motion } from 'motion/react';
import { RiCloseCircleLine, RiPlayCircleLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from '../shared/external-link';

interface ActivityEmptyStateProps {
  className?: string;
  emptySearchResults?: boolean;
  onClearFilters?: () => void;
}

export function ActivityEmptyState({ className, emptySearchResults, onClearFilters }: ActivityEmptyStateProps) {
  const navigate = useNavigate();
  const { currentEnvironment } = useEnvironment();

  const handleNavigateToWorkflows = () => {
    navigate(buildRoute(ROUTES.WORKFLOWS, { environmentSlug: currentEnvironment?.slug ?? '' }));
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="empty-state"
        className={cn('flex h-full w-full items-center justify-center border-t border-t-neutral-200', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.15,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 5 }}
          transition={{
            duration: 0.25,
            delay: 0.1,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.2,
              delay: 0.2,
            }}
            className="relative"
          >
            <ActivityIllustration />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.2,
              delay: 0.25,
            }}
            className="flex flex-col items-center gap-1 text-center"
          >
            <h2 className="text-foreground-900 text-lg font-medium">
              {emptySearchResults ? 'No activity match that filter' : 'No activity in the past 30 days'}
            </h2>
            <p className="text-foreground-600 max-w-md text-sm font-normal">
              {emptySearchResults
                ? 'Change your search criteria.'
                : 'Your activity feed is empty. Once you trigger your first workflow, you can monitor notifications and view delivery details.'}
            </p>
          </motion.div>

          {emptySearchResults && onClearFilters && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: 0.3,
              }}
              className="flex gap-6"
            >
              <Button variant="secondary" mode="outline" className="gap-2" onClick={onClearFilters}>
                <RiCloseCircleLine className="h-4 w-4" />
                Clear Filters
              </Button>
            </motion.div>
          )}

          {!emptySearchResults && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: 0.3,
              }}
              className="flex items-center gap-6"
            >
              <ExternalLink
                size="md"
                underline={false}
                variant="documentation"
                href="https://docs.novu.co"
                target="_blank"
              >
                View Docs
              </ExternalLink>
              <Button
                leadingIcon={RiPlayCircleLine}
                variant="primary"
                className="gap-2"
                onClick={handleNavigateToWorkflows}
              >
                Trigger Workflow
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ActivityIllustration() {
  return (
    <svg width="137" height="126" viewBox="0 0 137 126" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="135" height="45" rx="7.5" stroke="#CACFD8" strokeDasharray="5 3" />
      <rect x="5" y="5" width="127" height="37" rx="5.5" fill="white" />
      <rect x="5" y="5" width="127" height="37" rx="5.5" stroke="#F2F5F8" />
      <path
        d="M68.5 29.5C65.1862 29.5 62.5 26.8138 62.5 23.5C62.5 20.1862 65.1862 17.5 68.5 17.5C71.8138 17.5 74.5 20.1862 74.5 23.5C74.5 26.8138 71.8138 29.5 68.5 29.5ZM68.5 28.3C69.773 28.3 70.9939 27.7943 71.8941 26.8941C72.7943 25.9939 73.3 24.773 73.3 23.5C73.3 22.227 72.7943 21.0061 71.8941 20.1059C70.9939 19.2057 69.773 18.7 68.5 18.7C67.227 18.7 66.0061 19.2057 65.1059 20.1059C64.2057 21.0061 63.7 22.227 63.7 23.5C63.7 24.773 64.2057 25.9939 65.1059 26.8941C66.0061 27.7943 67.227 28.3 68.5 28.3ZM67.6732 21.349L70.6006 23.3002C70.6335 23.3221 70.6605 23.3518 70.6792 23.3867C70.6979 23.4215 70.7076 23.4605 70.7076 23.5C70.7076 23.5395 70.6979 23.5785 70.6792 23.6133C70.6605 23.6482 70.6335 23.6779 70.6006 23.6998L67.6726 25.651C67.6365 25.6749 67.5946 25.6886 67.5513 25.6907C67.5081 25.6927 67.465 25.683 67.4268 25.6626C67.3886 25.6422 67.3567 25.6118 67.3344 25.5747C67.312 25.5376 67.3002 25.4951 67.3 25.4518V21.5482C67.3001 21.5048 67.3119 21.4622 67.3343 21.425C67.3567 21.3878 67.3887 21.3574 67.427 21.3369C67.4653 21.3165 67.5084 21.3068 67.5518 21.3089C67.5951 21.3111 67.6371 21.3249 67.6732 21.349Z"
        fill="#CACFD8"
      />
      <rect x="1" y="80" width="135" height="45" rx="7.5" stroke="#CACFD8" />
      <rect x="5" y="84" width="127" height="37" rx="5.5" fill="white" />
      <rect x="5" y="84" width="127" height="37" rx="5.5" stroke="#F2F5F8" />
      <path
        d="M16.5 98.5C16.5 95.1863 19.1863 92.5 22.5 92.5H30.5C33.8137 92.5 36.5 95.1863 36.5 98.5V106.5C36.5 109.814 33.8137 112.5 30.5 112.5H22.5C19.1863 112.5 16.5 109.814 16.5 106.5V98.5Z"
        fill="#FBFBFB"
      />
      <path
        d="M26.4996 97.3572C26.144 97.3572 25.8568 97.6445 25.8568 98V98.3857C24.3902 98.6831 23.2853 99.9808 23.2853 101.536V101.913C23.2853 102.858 22.9378 103.77 22.311 104.477L22.1623 104.644C21.9936 104.832 21.9534 105.104 22.0559 105.335C22.1583 105.566 22.3893 105.714 22.6425 105.714H30.3568C30.6099 105.714 30.8389 105.566 30.9434 105.335C31.0478 105.104 31.0056 104.832 30.8369 104.644L30.6882 104.477C30.0614 103.77 29.7139 102.86 29.7139 101.913V101.536C29.7139 99.9808 28.609 98.6831 27.1425 98.3857V98C27.1425 97.6445 26.8552 97.3572 26.4996 97.3572ZM27.4097 107.267C27.6507 107.026 27.7853 106.699 27.7853 106.357H26.4996H25.2139C25.2139 106.699 25.3485 107.026 25.5896 107.267C25.8306 107.508 26.1581 107.643 26.4996 107.643C26.8411 107.643 27.1686 107.508 27.4097 107.267Z"
        fill="#E1E4EA"
      />
      <rect x="44.5" y="96.5" width="44" height="5" rx="2.5" fill="url(#paint0_linear_7279_27982)" />
      <rect x="44.5" y="103.5" width="77" height="5" rx="2.5" fill="url(#paint1_linear_7279_27982)" />
      <path d="M68.5 76.625V49.375" stroke="#E1E4EA" strokeWidth="0.75" strokeLinejoin="bevel" />
      <defs>
        <linearGradient
          id="paint0_linear_7279_27982"
          x1="33.8626"
          y1="98.6257"
          x2="95.511"
          y2="98.6257"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.48" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#F9F8F8" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_7279_27982"
          x1="25.8846"
          y1="105.626"
          x2="133.769"
          y2="105.626"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.48" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#F9F8F8" stopOpacity="0.75" />
        </linearGradient>
      </defs>
    </svg>
  );
}
