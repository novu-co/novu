import { RiMailLine } from 'react-icons/ri';

export function EmptyInvitations() {
  return (
    <div className="border-muted-foreground/25 bg-muted/5 flex min-h-[400px] flex-col items-center justify-center space-y-5 rounded-lg border border-dashed px-4 py-12 text-center">
      <div className="from-muted/30 to-muted/10 flex size-16 items-center justify-center rounded-full bg-gradient-to-br shadow-inner">
        <RiMailLine className="text-muted-foreground size-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">No Pending Invitations</h3>
        <p className="text-muted-foreground text-sm">
          Your team's pending invitations will appear here.
          <br />
          Ready to collaborate? Invite your teammates to join.
        </p>
      </div>
    </div>
  );
}
