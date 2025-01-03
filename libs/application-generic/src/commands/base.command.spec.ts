import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { BaseCommand, CommandValidationException } from './base.command';

export class TestCommand extends BaseCommand {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsDefined()
  password: string;
}

describe('BaseCommand', () => {
  it('should return object of type that extends the base', async () => {
    const obj = { email: 'test@test.com', password: 'P@ssw0rd' };
    expect(TestCommand.create(obj)).toEqual(obj);
  });

  it('should throw CommandValidationException with error messages when field values are not valid', async () => {
    try {
      TestCommand.create({ email: undefined, password: undefined });
      expect(false).toBeTruthy();
    } catch (e) {
      expect((e as CommandValidationException).getResponse()).toEqual({
        className: 'TestCommand',
        constraintsViolated: {
          email: {
            messages: [
              'email should not be null or undefined',
              'email must be an email',
              'email should not be empty',
            ],
            value: undefined,
          },
          password: {
            messages: ['password should not be null or undefined'],
            value: undefined,
          },
        },
        message: 'Validation failed',
      });
    }
  });

  it('should throw CommandValidationException with error message when only one field is not valid', async () => {
    try {
      TestCommand.create({ email: 'test@test.com', password: undefined });
      expect(false).toBeTruthy();
    } catch (e) {
      expect((e as CommandValidationException).getResponse()).toEqual({
        className: 'TestCommand',
        constraintsViolated: {
          password: {
            messages: ['password should not be null or undefined'],
            value: undefined,
          },
        },
        message: 'Validation failed',
      });
    }
  });
});
