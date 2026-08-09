import { IsEmail, IsEmpty, IsNotEmpty, IsString, MinLength } from "class-validator";

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

    @IsString()
    @IsNotEmpty({ message: 'theme requis' })
    theme: string;


}
