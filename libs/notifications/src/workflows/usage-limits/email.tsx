import { Button, Heading, Section, Text } from '@react-email/components';
import React from 'react';
import { renderAsync } from '@react-email/components';
import { EmailLayout } from '../../templates/layout';

interface EmailProps {
  percentage: number;
  organizationName: string;
}

export function UsageLimitsEmail({ percentage, organizationName }: EmailProps) {
  return (
    <EmailLayout previewText="Usage Limits Alert">
      <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
        You've Used {percentage}% of Your Monthly Events
      </Heading>
      <Text className="text-[14px] leading-[24px] text-black">Hi!</Text>
      
      <Text className="text-[14px] leading-[24px] text-black">
        Your organization {organizationName} has used {percentage}% of the free tier monthly limit of 30,000 events.
      </Text>

      <Text className="text-[14px] leading-[24px] text-black">
        To ensure uninterrupted service and access to additional features, we recommend upgrading your plan before reaching the limit.
      </Text>

      <Section className="mb-[32px] mt-[32px] text-center">
        <Button
          className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
          href={'https://dashboard.novu.co/settings/billing'}
        >
          Upgrade Your Plan
        </Button>
      </Section>

      <Text className="text-[12px] leading-[20px] text-gray-500">
        Note: Once you reach 100% utilization, notifications will be blocked until you upgrade or the next billing cycle begins.
      </Text>
    </EmailLayout>
  );
}

export interface RenderEmailOptions {
  percentage: number;
  organizationName: string;
}

export async function renderUsageLimitsEmail(options: RenderEmailOptions) {
  return renderAsync(<UsageLimitsEmail {...options} />);
}
