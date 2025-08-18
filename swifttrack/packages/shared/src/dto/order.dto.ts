import { IsEmail, IsEnum, IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OrderSize, OrderWeight, OrderStatus } from '../utils/enums';

export class LocationDto {
  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;

  @IsString()
  @IsOptional()
  address?: string;
}

export class CreateOrderDto {
  @IsEnum(OrderSize)
  orderSize: OrderSize;

  @IsEnum(OrderWeight)
  orderWeight: OrderWeight;

  @IsString()
  orderType: string;

  @IsBoolean()
  @IsOptional()
  priority?: boolean = false;

  @IsNumber()
  amount: number;

  @IsString()
  address: string;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  locationOrigin?: LocationDto;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  locationDestination?: LocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  @IsOptional()
  locations?: LocationDto[];

  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class OrderQueryDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  priority?: boolean;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}

export class FailOrderDto {
  @IsString()
  reason: string;
}
