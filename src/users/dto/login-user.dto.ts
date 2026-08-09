import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mot de passe requis' })
  passwordHash: string;
}