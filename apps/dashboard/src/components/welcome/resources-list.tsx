import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '../primitives/card';
import { ScrollBar, ScrollArea } from '../primitives/scroll-area';
import { Link } from 'react-router-dom';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';

export interface Resource {
  title: string;
  duration: string;
  image: string;
  url: string;
}

interface ResourcesListProps {
  resources: Resource[];
  title: string;
  icon: React.ReactNode;
}

export function ResourcesList({ resources, title, icon }: ResourcesListProps) {
  const telemetry = useTelemetry();

  const handleResourceClick = (resource: Resource) => {
    telemetry(TelemetryEvent.RESOURCE_CLICKED, {
      title: resource.title,
      url: resource.url,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="font-weight-medium flex items-center gap-2 text-neutral-600">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-7 pl-1">
          {resources.map((resource, index) => (
            <Link
              to={resource.url}
              key={index}
              target="_blank"
              rel="noopener"
              onClick={() => handleResourceClick(resource)}
            >
              <Card
                key={index}
                className="w-60 shrink-0 overflow-hidden border-none shadow-[0px_12px_32px_0px_rgba(0,0,0,0.02),0px_0px_0px_1px_rgba(0,0,0,0.05)] transition-all duration-200 hover:translate-y-[1px] hover:cursor-pointer hover:shadow-md"
              >
                <div className="h-[126px] overflow-hidden bg-neutral-50">
                  <img
                    src={`/images/welcome/${resource.image}`}
                    alt={resource.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <CardContent className="flex h-[94px] flex-col justify-between p-3">
                  <h3 className="whitespace-normal text-sm font-medium text-neutral-900">{resource.title}</h3>

                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-neutral-400" />
                    <span className="text-[10px] text-neutral-400">{resource.duration}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
