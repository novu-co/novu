import { RiArrowLeftSLine } from 'react-icons/ri';
import { AuthCard } from '../components/auth/auth-card';
import { Button } from '../components/primitives/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/routes';
import { InboxEmbed } from '../components/welcome/inbox-embed';

export function InboxEmbedPage() {
  const navigate = useNavigate();

  return (
    <AuthCard>
      <div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b p-4">
            <div className="flex items-start gap-1">
              <Button variant="ghost" size="icon" className="mt-[5px] h-5 w-5" onClick={() => navigate(-1)}>
                <RiArrowLeftSLine className="h-5 w-5" />
              </Button>

              <div className="flex-1">
                <h2 className="text-lg font-medium">Integrate in less than 4 minutes</h2>
                <p className="text-foreground-400 text-sm">
                  You're just a couple steps away from your having a fully functional notification center in your app.
                </p>
              </div>
            </div>

            <Button variant="link" className="text-foreground-600 text-xs" onClick={() => navigate(ROUTES.ROOT)}>
              Skip, I'll explore myself
            </Button>
          </div>
        </div>

        <div>
          <InboxEmbed />
        </div>
      </div>
    </AuthCard>
  );
}
