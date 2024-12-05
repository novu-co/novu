import { Card } from '@/components/primitives/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { OrganizationProfile, UserProfile } from '@clerk/clerk-react';
import { DashboardLayout } from '../components/dashboard-layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/utils/routes';
import { Appearance } from '@clerk/types';
import { motion } from 'motion/react';

const FADE_ANIMATION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
} as const;

const clerkComponentAppearance: Appearance = {
  variables: {
    colorPrimary: 'rgba(82, 88, 102, 0.95)',
    colorText: 'rgba(82, 88, 102, 0.95)',
  },
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
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab =
    location.pathname === ROUTES.SETTINGS ? 'account' : location.pathname.split('/settings/')[1] || 'account';

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'account':
        navigate(ROUTES.SETTINGS_ACCOUNT);
        break;
      case 'organization':
        navigate(ROUTES.SETTINGS_ORGANIZATION);
        break;
      case 'team':
        navigate(ROUTES.SETTINGS_TEAM);
        break;
    }
  };

  return (
    <DashboardLayout headerStartItems={<h1 className="text-foreground-950">Settings</h1>}>
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList
          align="center"
          className="border-border/20 relative mt-2.5 flex w-full items-end justify-start space-x-2 rounded-none border-b bg-transparent px-1.5 pb-0"
        >
          <TabsTrigger
            value="account"
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

        <div className="mx-auto mt-1 max-w-[700px] px-1.5">
          <TabsContent value="account" className="rounded-lg">
            <motion.div {...FADE_ANIMATION}>
              <Card className="mx-auto border-none shadow-none">
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
            </motion.div>
          </TabsContent>

          <TabsContent value="organization" className="rounded-lg">
            <motion.div {...FADE_ANIMATION}>
              <Card className="border-none shadow-none">
                <OrganizationProfile appearance={clerkComponentAppearance}>
                  <OrganizationProfile.Page label="general" />
                  <OrganizationProfile.Page label="members" />
                </OrganizationProfile>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="team" className="rounded-lg">
            <motion.div {...FADE_ANIMATION}>
              <Card className="border-none shadow-none">
                <OrganizationProfile appearance={clerkComponentAppearance}>
                  <OrganizationProfile.Page label="members" />
                  <OrganizationProfile.Page label="general" />
                </OrganizationProfile>
              </Card>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </DashboardLayout>
  );
}
