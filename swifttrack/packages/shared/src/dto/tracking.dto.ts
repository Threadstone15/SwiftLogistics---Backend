import { IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class TrackingUpdateDto {
  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsNumber()
  @IsOptional()
  speed?: number;

  @IsNumber()
  @IsOptional()
  heading?: number;
}
