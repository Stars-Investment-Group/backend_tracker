import { ApiProperty } from '@nestjs/swagger';
import { AlertType } from "@prisma/client";
import {
    IsBoolean,
    IsEnum,
    IsIn,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsUUID,
  } from 'class-validator';
  
  export class CreateAlertDto {
    @IsOptional()
    @IsUUID()
    instrumentId?: string;
  
    @ApiProperty({description:'Type alert', enum: AlertType})
    @IsEnum(AlertType, {
        message: ({ value }) =>
        `Alert '${value}' est invalide. Valeurs autorisées: ${Object.values(AlertType).join(', ')}`,
      })
      alertType: AlertType;
  
    @IsObject()
    condition: Record<string, any>;
  
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
  }