import Title from '@/components/Title';
import { novuConfig } from '@/utils/config';
import { Inbox, Preferences } from '@novu/nextjs';

export default function Home() {
  return (
    <>
      <Title title="Preferences Component" />
      <div className="w-96 h-[600px] overflow-y-auto">
        <Inbox {...novuConfig}>
          <Preferences />
        </Inbox>
      </div>
    </>
  );
}
