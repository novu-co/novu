import { Inbox, InboxContent, InboxProps } from '@novu/react';
import { SVGProps } from 'react';
import { useFetchEnvironments } from '../../context/environment/hooks';
import { useUser } from '@clerk/clerk-react';
import { useAuth } from '../../context/auth/hooks';
import { API_HOSTNAME, WEBSOCKET_HOSTNAME } from '../../config';

interface InboxPreviewContentProps {
  selectedStyle: string;
}

export function InboxPreviewContent({ selectedStyle }: InboxPreviewContentProps) {
  const auth = useAuth();
  const { user } = useUser();
  const { environments } = useFetchEnvironments({ organizationId: auth?.currentOrganization?._id });
  const currentEnvironment = environments?.find((env) => !env._parentId);

  if (!currentEnvironment || !user) {
    return null;
  }

  const configuration: InboxProps = {
    applicationIdentifier: currentEnvironment?.identifier,
    subscriberId: user?.externalId as string,
    backendUrl: API_HOSTNAME ?? 'https://api.novu.co',
    socketUrl: WEBSOCKET_HOSTNAME ?? 'https://ws.novu.co',
  };

  return (
    <>
      {selectedStyle === 'popover' && (
        <div className="relative flex h-full w-full flex-col items-center">
          <div className="mt-10 flex w-full max-w-[440px] items-center justify-end">
            <Inbox
              {...configuration}
              placement="bottom-end"
              appearance={{
                elements: {
                  popoverContent: {
                    maxHeight: '450px',
                  },
                },
              }}
              open
            />
          </div>
          <div className="absolute bottom-[-10px] left-2 flex flex-col items-start">
            <SendNotificationArrow className="mt-2 h-[73px] w-[86px]" />
            <p className="text-success relative top-[-32px] text-[10px] italic">Hit send, to get an notification!</p>
          </div>
        </div>
      )}
      {selectedStyle === 'sidebar' && (
        <div className="h-full">
          <div className="h-full w-[300px] border-r">
            <Inbox
              {...configuration}
              appearance={{
                variables: {
                  colorBackground: '#FCFCFC',
                  colorForeground: '#1A1523',
                  colorPrimary: '#0081F1',
                  colorPrimaryForeground: '#ffffff',
                  colorSecondary: '#F3F3F3',
                  colorSecondaryForeground: '#1A1523',
                  colorCounter: '#E5484D',
                  colorCounterForeground: 'white',
                  colorNeutral: 'black',
                  fontSize: 'inherit',
                  borderRadius: '0.375rem',
                },
                elements: {
                  notificationListNewNotificationsNotice__button: {
                    background: '#2b6cb0',
                  },
                  notificationListContainer: {
                    paddingRight: '10px',
                  },
                  inboxHeader: {
                    padding: '8px 16px',
                  },
                  inboxStatus__dropdownTrigger: {
                    gap: '2px',
                  },
                  moreActionsContainer: {
                    marginRight: '-4px',
                  },
                  inboxStatus__title: {
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                  bellContainer: {
                    display: 'none',
                  },
                  preferences__button: {
                    display: 'none',
                  },
                  popoverContent: {
                    width: '100%',
                    maxWidth: '390px',
                    height: 'calc(100% - 136px)',
                    maxHeight: '100%',
                    borderRadius: '0px',
                    overflow: 'auto',
                    boxShadow:
                      'rgba(15, 15, 15, 0.04) 0px 0px 0px 1px, rgba(15, 15, 15, 0.03) 0px 3px 6px, rgba(15, 15, 15, 0.06) 0px 9px 24px',
                    backgroundColor: '#fff',
                    marginTop: '-64px',
                    marginLeft: '-32px',
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                  notificationImage: {
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                  },
                  notificationDot: {
                    marginTop: '2px',
                    backgroundColor: '#0081F1',
                  },
                  notificationSubject: {
                    color: 'black',
                    fontSize: '14px',
                    fontWeight: '600',
                  },
                  notificationBody: {},
                  notificationPrimaryAction__button: {
                    variant: 'outline',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    height: '26px',
                    borderRadius: '4px',
                    border: '0.5px solid #dfdfdf',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    color: 'black',
                    fontSize: '14px',
                  },
                  notificationSecondaryAction__button: {
                    variant: 'outline',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    height: '26px',
                    borderRadius: '4px',
                    border: '0.5px solid #dfdfdf',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    color: 'black',
                    fontSize: '14px',
                  },
                },
              }}
            >
              <InboxContent />
            </Inbox>
          </div>
        </div>
      )}
      {selectedStyle === 'full-width' && (
        <div className="mt-10 h-full w-full">
          <Inbox {...configuration}>
            <InboxContent />
          </Inbox>
        </div>
      )}
    </>
  );
}

function SendNotificationArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="87" height="73" viewBox="0 0 87 73" fill="none" {...props}>
      <path
        d="M46.7042 38.5367C45.9523 34.1342 42.2234 19.9485 34.0857 23.4153C31.7808 24.3973 29.2755 28.6188 31.7983 30.67C35.1624 33.4054 37.9395 27.6374 37.3445 24.9824C35.7772 17.9881 26.4508 15.3565 20.157 16.3625C14.8716 17.2074 10.2676 20.6788 6.61735 24.3822C4.90504 26.1195 4.21087 28.3203 2.65616 30.084C0.250967 32.8124 2.04904 28.0442 2.01456 26.0896C1.94411 22.0956 2.26233 28.5742 2.27848 29.9515C2.30512 32.224 7.85706 30.608 10.037 30.3405"
        stroke="#1FC16B"
        stroke-linecap="round"
      />
    </svg>
  );
}
