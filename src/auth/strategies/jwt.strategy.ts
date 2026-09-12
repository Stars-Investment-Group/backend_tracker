import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly databaseService: DatabaseService,
    configService: ConfigService,
  ) {
    const secret =
      configService.get<string>('JWT_SECRET') ||
      process.env.JWT_SECRET ||
      (process.env.NODE_ENV !== 'production'
        ? 'sig-tracker-dev-secret-key'
        : undefined);

    if (!secret) {
      throw new Error(
        "FATAL: Variable d'environnement JWT_SECRET non définie pour la production.",
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.databaseService.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Utilisateur introuvable ou session expirée',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte utilisateur désactivé');
    }

    return user;
  }
}
