import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import React from 'react';
import { Card, CardContent } from '../primitives/card';
import { RiArrowRightDoubleFill, RiCheckLine, RiLoader3Line, RiLoaderLine } from 'react-icons/ri';

const steps = [
  {
    title: 'Account creation',
    description: "We know it's not always easy — take a moment to celebrate!",
    status: 'completed',
  },
  {
    title: 'Create a workflow',
    description: 'Workflows in Novu, orchestrate notifications across channels.',
    status: 'in-progress',
  },
  {
    title: 'Connect SMS provider',
    description: 'Connect your provider to send SMS notifications with Novu.',
    status: 'pending',
  },
  {
    title: 'Sync to production',
    description: "It's time to send that notification, your users deserve",
    status: 'pending',
  },
  {
    title: 'Invite a team member?',
    description: 'Need help from a team member, let them know',
    status: 'pending',
  },
];

export function ProgressSection() {
  return (
    <Card className="flex items-stretch gap-2 rounded-xl">
      <div className="flex w-full max-w-[350px] grow flex-col items-start justify-between gap-2 rounded-l-xl bg-[#FBFBFB] p-6">
        <div className="flex w-full flex-col gap-2">
          <h2 className="font-label-medium text-base font-medium">You're doing great work! 💪</h2>

          <div className="flex flex-col gap-6 text-sm text-neutral-400">
            <p>Set up Novu to send notifications your users will love.</p>

            <p>Streamline all your customer messaging in one tool and delight them at every touchpoint.</p>
          </div>
        </div>

        <p className="text-sm text-neutral-400">Get started with our setup guide.</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {steps.map((step, index) => (
          <div key={index} className="flex max-w-[370px] items-center gap-1.5">
            <div
              className={`${step.status === 'completed' ? 'bg-success' : 'shadow-xs'} flex h-6 w-6 min-w-6 items-center justify-center rounded-full`}
            >
              {step.status === 'completed' ? (
                <RiCheckLine className="h-4 w-4 text-[#ffffff]" />
              ) : (
                <RiLoader3Line className="h-4 w-4 text-neutral-400" />
              )}
            </div>

            <Card className="shadow-xs w-full p-1 transition-all duration-200 hover:translate-x-[1px] hover:cursor-pointer hover:shadow-md">
              <CardContent className="flex flex-col rounded-[6px] bg-[#FBFBFB] px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      step.status === 'completed' ? 'text-neutral-400 line-through' : 'text-neutral-600'
                    }`}
                  >
                    {step.title}
                  </span>
                  <RiArrowRightDoubleFill className="h-4 w-4 text-neutral-400" />
                </div>
                <p className="text-[10px] leading-[14px] text-neutral-400">{step.description}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </Card>
  );
}
