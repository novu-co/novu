import React from 'react';
import { StepTypeEnum } from '@novu/shared';
import { RiEdit2Line, RiPencilRuler2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { Cross2Icon } from '@radix-ui/react-icons';

import { Skeleton } from '@/components/primitives/skeleton';
import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { Notification5Fill } from '@/components/icons';

const STEP_TYPE_TO_SKELETON_CONTENT: Record<StepTypeEnum, () => React.JSX.Element | null> = {
  [StepTypeEnum.EMAIL]: () => {
    return (
      <div className="flex h-full flex-col gap-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  },
  [StepTypeEnum.CHAT]: () => {
    return (
      <div className="flex h-full flex-col gap-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  },
  [StepTypeEnum.IN_APP]: () => {
    return (
      <>
        <div className="flex items-center gap-2.5">
          <RiPencilRuler2Line className="text-foreground-950 size-5 p-0.5 text-sm font-medium" />
          <span>In-app Template</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-100 p-1">
          <div className="flex gap-1">
            <Skeleton className="h-10 min-w-10" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </>
    );
  },
  [StepTypeEnum.SMS]: () => {
    return (
      <div className="flex h-full flex-col gap-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  },
  [StepTypeEnum.PUSH]: () => {
    return (
      <div className="flex h-full flex-col gap-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  },
  [StepTypeEnum.DIGEST]: () => {
    return (
      <div className="flex h-full flex-col gap-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  },
  [StepTypeEnum.DELAY]: () => {
    return (
      <div className="flex h-full flex-col gap-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  },
  [StepTypeEnum.TRIGGER]: () => {
    return (
      <div className="flex h-full flex-col gap-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  },
  [StepTypeEnum.CUSTOM]: () => {
    return (
      <div className="flex h-full flex-col gap-1">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  },
};

export const StepSkeleton = ({ stepType }: { stepType?: StepTypeEnum }) => {
  const navigate = useNavigate();

  if (!stepType) {
    return null;
  }

  const SkeletonContent = STEP_TYPE_TO_SKELETON_CONTENT[stepType];

  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="flex flex-row items-center gap-3 px-3 py-1.5">
        <div className="mr-auto flex items-center gap-2.5 text-sm font-medium">
          <RiEdit2Line className="size-4" />
          <span>Configure Template</span>
        </div>
        <Tabs defaultValue="editor" className="ml-auto">
          <TabsList className="w-min">
            <TabsTrigger value="editor" className="gap-1.5" disabled>
              <RiPencilRuler2Line className="size-5 p-0.5" />
              <span>Editor</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5" disabled>
              <Notification5Fill className="size-5 p-0.5" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="ghost"
          size="xs"
          className="size-6"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('../', { relative: 'path' });
          }}
        >
          <Cross2Icon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </header>
      <Separator />
      <div className="flex h-full w-full flex-col gap-3 px-3 py-3.5">
        <SkeletonContent />
      </div>
      <Separator />
      <footer className="flex justify-end px-3 py-3.5">
        <Button className="ml-auto" variant="default" disabled>
          Save step
        </Button>
      </footer>
    </div>
  );
};
