import { WorkflowResponseDto } from './workflow.dto';
import { LimitOffsetPaginationDto } from '../../types';

export class GetListQueryParams extends LimitOffsetPaginationDto<WorkflowResponseDto, 'updatedAt'> {
  query?: string;
}
