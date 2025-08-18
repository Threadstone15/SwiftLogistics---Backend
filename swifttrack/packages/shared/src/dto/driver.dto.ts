import { IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DriverLocationDto {
  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;

  @IsNumber()
  @IsOptional()
  speed?: number;

  @IsNumber()
  @IsOptional()
  heading?: number;
}

export class AcknowledgeRouteDto {
  @IsString()
  routeId: string;
}
