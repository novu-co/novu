import { Plug2 } from 'lucide-react';
import React from 'react';
import { RiPlug2Line } from 'react-icons/ri';
import { Plug } from '../icons/plug';

export function ServerErrorPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
      <div className="relative flex w-1/2 flex-col items-center justify-center gap-3">
        {/* <div className="absolute inset-0 h-full w-full rounded-[866px] border border-dashed border-[#E7E7E7] bg-[#E7E7E7]"></div> */}
        <div className="flex w-36 items-center gap-3 rounded-md border border-[#e6e6e6] bg-white p-3 shadow-[0px_4.233px_4.233px_0px_rgba(31,40,55,0.02),0px_1.693px_1.693px_0px_rgba(31,40,55,0.02),0px_-3px_0px_0px_#F7F7F7_inset]">
          <span className="size-3 rounded-full bg-[#e6e6e6]" />
          <span className="h-3 flex-1 rounded-md bg-[#e6e6e6]" />
        </div>
        <Plug className="text-[#E6E6E6]" />
        <div className="w-36 rounded-md border border-[#e6e6e6] bg-white p-3 text-center shadow-[0px_4.233px_4.233px_0px_rgba(31,40,55,0.02),0px_1.693px_1.693px_0px_rgba(31,40,55,0.02),0px_-3px_0px_0px_#F7F7F7_inset]">
          <p className="text-2xl font-extrabold text-[#ebecef]">500</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="font-medium">Uh-oh, this is on us, not you.</p>
        <div>
          <p className="text-text-soft text-center text-xs font-medium">
            Whoops, we missed a beat. This 500 is a reminder
          </p>
          <p className="text-text-soft text-center text-xs font-medium">we're still human… mostly.</p>
        </div>

        <button className="btn btn-primary"></button>
      </div>
    </div>
  );
}
