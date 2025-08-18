import { IsString, IsOptional } from 'class-validator';

export class WarehouseArrivalDto {
  @IsString()
  @IsOptional()
  sectionNo?: string;

  @IsString()
  @IsOptional()
  rackNo?: string;
}

export class WarehouseDepartureDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
