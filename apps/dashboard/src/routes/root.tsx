import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { withProfiler, ErrorBoundary } from '@sentry/react';
import { SegmentProvider } from '@/context/segment';
import { AuthProvider } from '@/context/auth/auth-provider';
import { ClerkProvider } from '@/context/clerk-provider';
import { TooltipProvider } from '@/components/primitives/tooltip';
import { IdentityProvider } from '@/context/identity-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const RootRouteInternal = () => {
  return (
    <ErrorBoundary
      fallback={({ error, eventId }) => (
        <>
          Sorry, but something went wrong. <br />
          Please contact our support team and provide the event id for the reference.
          <br />
          <code>
            <small style={{ color: 'lightGrey' }}>
              Event Id: {eventId}.
              <br />
              {(error as object).toString()}
            </small>
          </code>
        </>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkProvider>
          <SegmentProvider>
            <AuthProvider>
              <IdentityProvider>
                <HelmetProvider>
                  <TooltipProvider delayDuration={100}>
                    <Outlet />
                  </TooltipProvider>
                </HelmetProvider>
              </IdentityProvider>
            </AuthProvider>
          </SegmentProvider>
        </ClerkProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export const RootRoute = withProfiler(RootRouteInternal);
