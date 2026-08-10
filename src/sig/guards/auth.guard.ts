import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Vérifier si la route est publique
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token manquant. Veuillez vous authentifier.');
    }
    
    try {
      // 🔧 Décoder le token 
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token invalide');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('✅ Token décodé:', payload);
      
      // Ajouter l'utilisateur à la requête
      request.user = payload;
      return true;
    } catch (error) {
      console.error('❌ Erreur token:', error.message);
      throw new UnauthorizedException('Token invalide ou expiré.');
    }
  }
  
  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}