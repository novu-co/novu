export function InAppPreview() {
  return (
    <div className="border-foreground-200 flex flex-col gap-2 rounded-xl border border-dashed px-2">
      <div className="rounded-xl bg-neutral-50 p-2">
        <div className="flex items-center gap-2">
          <div>img</div>
          <span className="text-xs font-medium text-neutral-600">Lorem ipsum dolor sit amet consectetur.</span>
        </div>
        <div className="truncate text-ellipsis text-xs text-neutral-400">
          <span>
            Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus,
            voluptatem.
          </span>
        </div>
      </div>
    </div>
  );
}
