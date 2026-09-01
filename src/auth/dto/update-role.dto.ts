import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RoleUser } from '@prisma/client';

export class UpdateRoleDto {
  @ApiProperty({
    enum: RoleUser,
    example: RoleUser.ADMIN,
    description: 'Nouveau rôle à attribuer',
  })
  @IsEnum(RoleUser, {
    message: `Le rôle doit être une des valeurs suivantes: ${Object.values(RoleUser).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Le rôle est requis' })
  role: RoleUser;
}
