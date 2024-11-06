import { Button, Heading, Section, Text } from '@react-email/components';
import React from 'react';
import { renderAsync } from '@react-email/components';
import { EmailLayout } from '../../templates/layout';

interface EmailProps {
  name?: string;
  upgradeUrl?: string;
}

export function UsageLimitsEmail({ name = '', upgradeUrl = '' }: EmailProps) {
  return (
    <EmailLayout previewText="Usage Limits Alert">
      <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
        You are reaching your usage limits
      </Heading>
      <Text className="text-[14px] leading-[24px] text-black">Hello {name}</Text>

      <Section className="mb-[32px] mt-[32px] text-center">
        <Button
          className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
          href={upgradeUrl}
        >
          Upgrade Now
        </Button>
      </Section>
    </EmailLayout>
  );
}

export interface RenderEmailOptions {
  name?: string;
  upgradeUrl?: string;
}

export async function renderUsageLimitsEmail(options: RenderEmailOptions) {
  return renderAsync(<UsageLimitsEmail {...options} />);
}
