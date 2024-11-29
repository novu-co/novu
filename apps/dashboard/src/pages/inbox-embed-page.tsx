import { AuthCard } from '../components/auth/auth-card';
import { ROUTES } from '../utils/routes';
import { InboxEmbed } from '../components/welcome/inbox-embed';
import { UsecasePlaygroundHeader } from '../components/usecase-playground-header';

export function InboxEmbedPage() {
  return (
    <AuthCard className="mt-10 w-full max-w-[1230px]">
      <div className="w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          <UsecasePlaygroundHeader
            title="Integrate in less than 4 minutes"
            description="You're just a couple steps away from your having a fully functional notification center in your app."
            skipPath={ROUTES.WELCOME}
          />
        </div>

        <div>
          <InboxEmbed />
        </div>
      </div>
    </AuthCard>
  );
}
