import { UpdateExternalOrganizationDto } from '@novu/shared';
import { post } from './api.client';

export function updateClerkOrgMetadata(data: UpdateExternalOrganizationDto) {
  return post('/v1/clerk/organization', data);
}
