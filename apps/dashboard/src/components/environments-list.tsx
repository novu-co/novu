import { useEnvironment } from '@/context/environment/hooks';
import { useEnvironments } from '@/hooks/use-environments';
import { cn } from '@/utils/ui';
import { IEnvironment } from '@novu/shared';
import { useState } from 'react';
import { RiMore2Fill } from 'react-icons/ri';
import { EditEnvironmentSheet } from './edit-environment-sheet';
import { Badge } from './primitives/badge';
import { Button } from './primitives/button';
import { CopyButton } from './primitives/copy-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './primitives/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './primitives/table';
import { TimeDisplayHoverCard } from './time-display-hover-card';
import TruncatedText from './truncated-text';

export function EnvironmentsList() {
  const { data: environments = [], isLoading } = useEnvironments();
  const { currentEnvironment } = useEnvironment();
  const [editEnvironment, setEditEnvironment] = useState<IEnvironment>();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Identifier</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-1"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {environments.map((environment) => (
            <TableRow key={environment._id} className="group relative isolate">
              <TableCell className="font-medium">
                <div className="flex items-center gap-1">
                  <TruncatedText className="max-w-[32ch]">{environment.name}</TruncatedText>
                  {environment._id === currentEnvironment?._id && (
                    <Badge color="blue" size="sm" variant="lighter">
                      Current
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 transition-opacity duration-200">
                  <TruncatedText className="text-foreground-400 font-code block text-xs">
                    {environment.identifier}
                  </TruncatedText>
                  <CopyButton
                    className="z-10 flex size-2 p-0 px-1 opacity-0 group-hover:opacity-100"
                    valueToCopy={environment.identifier}
                    size="2xs"
                    mode="ghost"
                  />
                </div>
              </TableCell>
              <TableCell className={cn('text-foreground-600 min-w-[180px] text-sm font-medium')}>
                <TimeDisplayHoverCard date={new Date()}>
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TimeDisplayHoverCard>
              </TableCell>
              <TableCell className="w-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" mode="ghost" size="xs">
                      <RiMore2Fill className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => setEditEnvironment(environment)}>
                        Edit environment
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <EditEnvironmentSheet
        environment={editEnvironment}
        isOpen={!!editEnvironment}
        onOpenChange={(open) => !open && setEditEnvironment(undefined)}
      />
    </>
  );
}
