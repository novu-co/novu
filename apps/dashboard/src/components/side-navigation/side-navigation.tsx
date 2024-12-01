import { ReactNode, useMemo } from 'react';
import {
  RiBarChartBoxLine,
  RiGroup2Line,
  RiKey2Line,
  RiRouteFill,
  RiSettings4Line,
  RiStore3Line,
  RiUserAddLine,
} from 'react-icons/ri';
import { useEnvironment } from '@/context/environment/hooks';
import { buildRoute, LEGACY_ROUTES, ROUTES } from '@/utils/routes';
import { TelemetryEvent } from '@/utils/telemetry';
import { useTelemetry } from '@/hooks/use-telemetry';
import { EnvironmentDropdown } from './environment-dropdown';
import { OrganizationDropdown } from './organization-dropdown';
import { FreeTrialCard } from './free-trial-card';
import { SubscribersStayTunedModal } from './subscribers-stay-tuned-modal';
import { SidebarContent } from '@/components/side-navigation/sidebar';
import { NavigationLink } from './navigation-link';
import { GettingStartedMenuItem } from './getting-started-menu-item';

const NavigationGroup = ({ children, label }: { children: ReactNode; label?: string }) => {
  return (
    <div className="flex flex-col last:mt-auto">
      {!!label && <span className="text-foreground-400 px-2 py-1 text-sm">{label}</span>}
      {children}
    </div>
  );
};

export const SideNavigation = () => {
  const { currentEnvironment, environments, switchEnvironment } = useEnvironment();
  const track = useTelemetry();
  const environmentNames = useMemo(() => environments?.map((env) => env.name), [environments]);
  const onEnvironmentChange = (value: string) => {
    const environment = environments?.find((env) => env.name === value);
    switchEnvironment(environment?.slug);
  };

  return (
    <aside className="bg-neutral-alpha-50 relative flex h-full w-[275px] flex-shrink-0 flex-col">
      <SidebarContent className="h-full">
        <OrganizationDropdown />
        <EnvironmentDropdown value={currentEnvironment?.name} data={environmentNames} onChange={onEnvironmentChange} />
        <nav className="flex h-full flex-1 flex-col">
          <div className="flex flex-col gap-4">
            <NavigationGroup>
              <NavigationLink to={buildRoute(ROUTES.WORKFLOWS, { environmentSlug: currentEnvironment?.slug ?? '' })}>
                <RiRouteFill className="size-4" />
                <span>Workflows</span>
              </NavigationLink>
              <SubscribersStayTunedModal>
                <span onClick={() => track(TelemetryEvent.SUBSCRIBERS_LINK_CLICKED)}>
                  <NavigationLink>
                    <RiGroup2Line className="size-4" />
                    <span>Subscribers</span>
                  </NavigationLink>
                </span>
              </SubscribersStayTunedModal>
            </NavigationGroup>
            <NavigationGroup label="Monitor">
              <NavigationLink to={LEGACY_ROUTES.ACTIVITY_FEED} isExternal>
                <RiBarChartBoxLine className="size-4" />
                <span>Activity Feed</span>
              </NavigationLink>
            </NavigationGroup>
            <NavigationGroup label="Developer">
              <NavigationLink to={LEGACY_ROUTES.INTEGRATIONS} isExternal>
                <RiStore3Line className="size-4" />
                <span>Integration Store</span>
              </NavigationLink>
              <NavigationLink to={LEGACY_ROUTES.API_KEYS} isExternal>
                <RiKey2Line className="size-4" />
                <span>API Keys</span>
              </NavigationLink>
            </NavigationGroup>
            <NavigationGroup label="Application">
              <NavigationLink to={LEGACY_ROUTES.SETTINGS} isExternal>
                <RiSettings4Line className="size-4" />
                <span>Settings</span>
              </NavigationLink>
            </NavigationGroup>
          </div>

          <div className="mt-auto gap-8 pt-4">
            <FreeTrialCard />

            <NavigationGroup>
              <NavigationLink to={LEGACY_ROUTES.INVITE_TEAM_MEMBERS} isExternal>
                <RiUserAddLine className="size-4" />
                <span>Invite teammates</span>
              </NavigationLink>
              <GettingStartedMenuItem />
            </NavigationGroup>
          </div>
        </nav>
      </SidebarContent>
    </aside>
  );
};
