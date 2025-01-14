import {
  ExecutionDetailFeedItem,
  JobFeedItem,
  NotificationFeedItemEntity,
  NotificationStepEntity,
  StepFilter,
} from '@novu/dal';
import { FilterParts, FilterPartTypeEnum, ProvidersIdEnum, StepTypeEnum } from '@novu/shared';
import {
  ActivityNotificationExecutionDetailResponseDto,
  ActivityNotificationJobResponseDto,
  ActivityNotificationResponseDto,
  ActivityNotificationStepResponseDto,
} from '../../dtos/activities-response.dto';
import {
  FieldFilterPartDto,
  FilterPartsDto,
  OnlineInLastFilterPartDto,
  PreviousStepFilterPartDto,
  RealtimeOnlineFilterPartDto,
  StepFilterDto,
  TenantFilterPartDto,
  WebhookFilterPartDto,
} from '../../../shared/dtos/step-filter-dto';

export function mapFeedItemToDto(
  notificationFeedItemEntity: NotificationFeedItemEntity
): ActivityNotificationResponseDto {
  const activityNotificationResponseDto: ActivityNotificationResponseDto = {
    _id: notificationFeedItemEntity._id,
    _environmentId: notificationFeedItemEntity._environmentId.toString(),
    _organizationId: notificationFeedItemEntity._organizationId.toString(),
    transactionId: notificationFeedItemEntity.transactionId,
    createdAt: notificationFeedItemEntity.createdAt,
    channels: notificationFeedItemEntity.channels,
  };

  if (notificationFeedItemEntity.template) {
    activityNotificationResponseDto.template = {
      _id: notificationFeedItemEntity.template._id,
      name: notificationFeedItemEntity.template.name,
      triggers: notificationFeedItemEntity.template.triggers,
    };
  }
  activityNotificationResponseDto.subscriber = {
    _id: notificationFeedItemEntity.subscriber._id,
    email: notificationFeedItemEntity.subscriber.email,
    firstName: notificationFeedItemEntity.subscriber.firstName,
    lastName: notificationFeedItemEntity.subscriber.lastName,
    phone: notificationFeedItemEntity.subscriber.phone,
  };
  activityNotificationResponseDto.jobs = notificationFeedItemEntity.jobs.map(mapJobToDto);

  return activityNotificationResponseDto;
}

function mapChildFilterToDto(filterPart: FilterParts): FilterPartsDto {
  switch (filterPart.on) {
    case FilterPartTypeEnum.SUBSCRIBER:
    case FilterPartTypeEnum.PAYLOAD:
      return {
        ...filterPart,
        on: filterPart.on, // Ensure the correct enum value is set
      } as FieldFilterPartDto;

    case FilterPartTypeEnum.WEBHOOK:
      return {
        ...filterPart,
        on: FilterPartTypeEnum.WEBHOOK,
      } as WebhookFilterPartDto;

    case FilterPartTypeEnum.IS_ONLINE:
      return {
        ...filterPart,
        on: FilterPartTypeEnum.IS_ONLINE,
      } as RealtimeOnlineFilterPartDto;

    case FilterPartTypeEnum.IS_ONLINE_IN_LAST:
      return {
        ...filterPart,
        on: FilterPartTypeEnum.IS_ONLINE_IN_LAST,
      } as OnlineInLastFilterPartDto;

    case FilterPartTypeEnum.PREVIOUS_STEP:
      return {
        ...filterPart,
        on: FilterPartTypeEnum.PREVIOUS_STEP,
      } as PreviousStepFilterPartDto;

    case FilterPartTypeEnum.TENANT:
      return {
        ...filterPart,
        on: FilterPartTypeEnum.TENANT,
      } as TenantFilterPartDto;

    default:
      throw new Error(`Unknown filter part type: ${filterPart}`);
  }
}
function mapToFilterDto(stepFilter: StepFilter): StepFilterDto {
  return {
    children: stepFilter.children.map((child) => mapChildFilterToDto(child)),
    isNegated: stepFilter.isNegated,
    type: stepFilter.type,
    value: stepFilter.value,
  };
}

function convertStepToResponse(step: NotificationStepEntity): ActivityNotificationStepResponseDto {
  return {
    _id: step._id as string,
    active: step.active as boolean,
    filters: step.filters?.map(mapToFilterDto) || [],
  };
}

function mapJobToDto(item: JobFeedItem): ActivityNotificationJobResponseDto {
  return {
    _id: item._id,
    type: item.type as StepTypeEnum,
    digest: item.digest,
    executionDetails: item.executionDetails.map(convertExecutionDetail),
    step: convertStepToResponse(item.step),
    payload: item.payload,
    providerId: item.providerId as ProvidersIdEnum,
    status: item.status,
    updatedAt: item.updatedAt,
  };
}
function convertExecutionDetail(detail: ExecutionDetailFeedItem): ActivityNotificationExecutionDetailResponseDto {
  return {
    _id: detail._id,
    detail: detail.detail,
    isRetry: detail.isRetry,
    isTest: detail.isTest,
    providerId: detail.providerId as unknown as ProvidersIdEnum,
    source: detail.source,
    status: detail.status,
    createdAt: detail.createdAt,
  };
}
