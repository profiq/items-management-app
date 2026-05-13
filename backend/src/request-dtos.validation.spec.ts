import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { CreateCategoryDto } from './categories/dto/create-category.dto';
import { CreateCityDto } from './cities/dto/create-city.dto';
import { CreateEmailNotificationDto } from './email-notifications/dto/create-email-notification.dto';
import { CreateLoanDto } from './loans/dto/create-loan.dto';
import { UpdateLoanDto } from './loans/dto/update-loan.dto';
import { CreateLocationDto } from './locations/dto/create-location.dto';
import { CreateTagDto } from './tags/dto/create-tag.dto';
import { CreateUserRequest } from './user/dto/create_user';

const validateDto = <T extends object>(
  dto: new () => T,
  payload: Record<string, unknown>
) => validateSync(plainToInstance(dto, payload));

describe('request DTO validation', (): void => {
  it('rejects empty names in lookup DTOs', (): void => {
    expect(validateDto(CreateCategoryDto, { name: '' })).not.toHaveLength(0);
    expect(validateDto(CreateCityDto, { name: '' })).not.toHaveLength(0);
    expect(validateDto(CreateTagDto, { name: '' })).not.toHaveLength(0);
  });

  it('rejects invalid location payloads', (): void => {
    const errors = validateDto(CreateLocationDto, {
      name: '',
      city_id: 0,
    });

    expect(errors).not.toHaveLength(0);
  });

  it('rejects invalid loan payloads', (): void => {
    const errors = validateDto(CreateLoanDto, {
      copy_id: 0,
      user_id: 'not-a-number',
      due_date: 'not-a-date',
    });

    expect(errors).not.toHaveLength(0);
  });

  it('rejects invalid loan update payloads', (): void => {
    const errors = validateDto(UpdateLoanDto, {
      returned_at: 'not-a-date',
      returned_by_user_id: 0,
    });

    expect(errors).not.toHaveLength(0);
  });

  it('allows null loan return fields for clearing return state', (): void => {
    const errors = validateDto(UpdateLoanDto, {
      returned_at: null,
      returned_by_user_id: null,
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects invalid email notification payloads', (): void => {
    const errors = validateDto(CreateEmailNotificationDto, {
      loan_id: 0,
      type: '',
    });

    expect(errors).not.toHaveLength(0);
  });

  it('rejects invalid user creation payloads', (): void => {
    const errors = validateDto(CreateUserRequest, {
      name: '',
      workspace_id: '',
    });

    expect(errors).not.toHaveLength(0);
  });

  it('strips fields that are not part of the request DTO', async (): Promise<void> => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true });

    const result = (await pipe.transform(
      { name: 'Books', archived_at: new Date().toISOString() },
      { type: 'body', metatype: CreateCategoryDto }
    )) as CreateCategoryDto & { archived_at?: string };

    expect(result).toBeInstanceOf(CreateCategoryDto);
    expect(result.name).toBe('Books');
    expect(result.archived_at).toBeUndefined();
  });
});
