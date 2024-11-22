import { type ChangeEntity } from './change.entity';
import { type UserEntity } from '../user';

export type ChangeEntityPopulated = ChangeEntity & {
  user: Pick<UserEntity, '_id' | 'firstName' | 'lastName' | 'profilePicture'>;
};
