import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../primitives/card';
import { ChannelTypeEnum } from '@novu/shared';
import { Usecase } from './usecases-list.utils';

interface UsecaseSelectOnboardingProps {
  onHover: (id: ChannelTypeEnum | null) => void;
  onClick: (id: ChannelTypeEnum) => void;
  selectedUseCases: ChannelTypeEnum[];
  channelOptions: Usecase[];
}

export function UsecaseSelectOnboarding({
  onHover,
  onClick,
  selectedUseCases,
  channelOptions,
}: UsecaseSelectOnboardingProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="flex w-full flex-col items-center gap-8">
        <div className="flex w-full flex-col items-start gap-1">
          <div className="flex w-full items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs text-[#717784]">3/3</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-[#232529]">How do you plan to use Novu?</h2>
            <p className="text-xs text-[#717784]">
              You can route notifications across channels intelligently with Novu's powerful workflows, among the
              channels below.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          {channelOptions.map((option, index) => (
            <Card
              key={index}
              className={`rounded-xl border ${selectedUseCases.includes(option.id) ? 'border-transparent' : 'border-neutral-200'} shadow-none transition-all duration-300`}
              onMouseEnter={() => onHover(option.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(option.id)}
            >
              <CardContent
                className={`rounded-xl p-[2.5px] hover:cursor-pointer ${
                  selectedUseCases.includes(option.id)
                    ? 'bg-gradient-to-r from-[hsla(20,100%,65%,1)] to-[hsla(310,100%,45%,1)]'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start gap-3.5 rounded-xl bg-[#ffffff] p-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center opacity-40`}
                    style={{ color: `hsl(var(--${option.color}))` }}
                  >
                    <option.icon className={`h-8 w-8 fill-${option.color} stroke-${option.color}`} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-medium text-[#232529]">{option.title}</h3>
                    <p className="text-xs text-[#717784]">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
