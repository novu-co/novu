import { Badge } from './primitives/badge';
import TruncatedText from './truncated-text';

type WorkflowTagsProps = {
  tags: string[];
};

export const WorkflowTags = (props: WorkflowTagsProps) => {
  const { tags } = props;

  const sliceFactor = 3;
  let firstTags: string[] = [];
  let restTags: string[] = [];
  if (tags.length > sliceFactor) {
    firstTags = tags.slice(0, sliceFactor - 1);
    restTags = tags.slice(sliceFactor - 1);
  } else {
    firstTags = tags;
  }

  return (
    <div className="flex items-center gap-1">
      <>
        {firstTags.map((tag) => (
          <Badge
            key={tag}
            variant={'soft'}
            className="text-feature bg-feature/10 max-w-[130px] font-[600]"
            kind={'pill'}
          >
            <TruncatedText>{tag}</TruncatedText>
          </Badge>
        ))}
        {restTags.length > 0 && (
          <Badge variant={'soft'} className="text-feature bg-feature/10 max-w-[130px] font-[600]" kind="pill">
            +{restTags.length}
          </Badge>
        )}
      </>
    </div>
  );
};
