import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { RoleUser } from "@prisma/client";


export class CreateUserDto {

    @IsEmail({}, {message: 'Email invalide'})
    @IsNotEmpty({message: 'Email requis'})
    email: string;

    @IsString()
    @MinLength(6, { message: 'Mot de passe: minimum 6 caractères' })
    @IsNotEmpty({ message: 'Mot de passe requis' })
    passwordHash : string;

    @IsString()
    @IsNotEmpty({ message: 'firstName requis' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'lastName requis' })
    lastName: string;

    @ApiProperty({description: 'role de lutilisateur', enum: RoleUser})
    @IsEnum(RoleUser, {
        message: ({ value }) =>
        `Le rôle '${value}' est invalide. Valeurs autorisées: ${Object.values(RoleUser).join(', ')}`,
    })
    @IsOptional()
    role?: RoleUser;

    @IsString()
    @IsNotEmpty({ message: 'company requis' })
    company: string;

    @IsString()
    @IsNotEmpty({ message: 'theme requis' })
    theme: string;


}
