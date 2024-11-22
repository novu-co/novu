import { type Types } from 'mongoose';
import { type IMemberInvite, type MemberRoleEnum, type MemberStatusEnum } from '@novu/shared';

import { type UserEntity } from '../user';
import type { OrganizationId } from '../organization';
import type { ChangePropsValueType } from '../../types/helpers';

export class MemberEntity {
  _id: string;

  _userId: string;

  user?: Pick<UserEntity, 'firstName' | '_id' | 'lastName' | 'email'>;

  roles: MemberRoleEnum[];

  invite?: IMemberInvite;

  memberStatus: MemberStatusEnum;

  _organizationId: OrganizationId;
}

export type MemberDBModel = ChangePropsValueType<Omit<MemberEntity, 'invite'>, '_userId' | '_organizationId'> & {
  invite?: IMemberInvite & {
    _inviterId: Types.ObjectId;
  };
};
