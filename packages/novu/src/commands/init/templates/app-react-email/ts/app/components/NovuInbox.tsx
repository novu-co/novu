import { Inbox } from "@novu/nextjs";

const novuConfig = {
  applicationIdentifier:
    process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER || "",
  subscriberId: process.env.NEXT_PUBLIC_NOVU_SUBSCRIBER_ID || "",
  appearance: {
    elements: {
      bellContainer: {
        width: "30px",
        height: "30px",
      },
      bellIcon: {
        width: "30px",
        height: "30px",
      },
    },
  },
};

export function NovuInbox() {
  return <Inbox {...novuConfig} />;
}
