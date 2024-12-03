import { Card } from '@/components/primitives/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { OrganizationProfile, UserProfile } from '@clerk/clerk-react';
import { useOrganization } from '@clerk/clerk-react';
import { DashboardLayout } from '../components/dashboard-layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/utils/routes';

export const clerkComponentAppearance = {
  elements: {
    navbar: { display: 'none' },
    navbarMobileMenuRow: { display: 'none !important' },
    rootBox: {
      width: '100%',
      height: '100%',
    },
    cardBox: {
      display: 'block',
      width: '100%',
      height: '100%',
      boxShadow: 'none',
    },

    pageScrollBox: {
      padding: '0 !important',
    },
    header: {
      display: 'none',
    },
    profileSection: {
      borderTop: 'none',
      borderBottom: '1px solid #e0e0e0',
    },
    page: {
      padding: '0 5px',
    },
  },
};

export function SettingsPage() {
  const { organization } = useOrganization();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab =
    location.pathname === ROUTES.SETTINGS ? 'profile' : location.pathname.split('/settings/')[1] || 'profile';

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'profile':
        navigate(ROUTES.SETTINGS_PROFILE);
        break;
      case 'organization':
        navigate(ROUTES.SETTINGS_ORGANIZATION);
        break;
      case 'team':
        navigate(ROUTES.SETTINGS_TEAM);
        break;
      case 'security':
        navigate(ROUTES.SETTINGS_SECURITY);
        break;
    }
  };

  return (
    <DashboardLayout headerStartItems={<h1 className="text-foreground-950">Settings</h1>}>
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList
          align="center"
          className="border-border/20 relative mt-4 flex w-full items-end justify-start space-x-2 rounded-none border-b bg-transparent px-1.5 pb-0"
        >
          <TabsTrigger
            value="profile"
            className="text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground flex items-center rounded-none border-b-2 border-transparent px-4 py-2.5 font-medium transition-all"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="organization"
            className="text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground flex items-center rounded-none border-b-2 border-transparent px-4 py-2.5 font-medium transition-all"
          >
            Organization
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground flex items-center rounded-none border-b-2 border-transparent px-4 py-2.5 font-medium transition-all"
          >
            Team
          </TabsTrigger>
        </TabsList>

        <div className="mx-auto mt-1 max-w-[600px] px-1.5">
          <TabsContent value="profile" className="rounded-lg">
            <Card className="mx-auto mt-10 border-none shadow-none">
              <UserProfile appearance={clerkComponentAppearance}>
                <UserProfile.Page label="account" />
                <UserProfile.Page label="security" />
              </UserProfile>

              <h1 className="text-foreground mb-6 mt-10 text-xl font-semibold">Security</h1>
              <UserProfile appearance={clerkComponentAppearance}>
                <UserProfile.Page label="security" />
                <UserProfile.Page label="account" />
              </UserProfile>
            </Card>
          </TabsContent>

          <TabsContent value="organization" className="rounded-lg">
            <Card className="border-none shadow-none">
              <OrganizationProfile appearance={clerkComponentAppearance}>
                <OrganizationProfile.Page label="general" />
                <OrganizationProfile.Page label="members" />
              </OrganizationProfile>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="rounded-lg">
            <Card className="border-none shadow-none">
              <OrganizationProfile appearance={clerkComponentAppearance}>
                <OrganizationProfile.Page label="members" />
                <OrganizationProfile.Page label="general" />
              </OrganizationProfile>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </DashboardLayout>
  );
}
