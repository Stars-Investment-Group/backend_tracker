import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { LoginUserDto } from './dto/login-user.dto';



@Injectable()
class UsersService {

  constructor(private readonly databaseService: DatabaseService) {}

  async login(loginUserDto: LoginUserDto) {
    // Vérifier l'utilisateur
    const user = await this.databaseService.user.findUnique({
      where: { email: loginUserDto.email },
    });
  
    if (!user) {
      throw new NotFoundException('Email ou mot de passe incorrect');
    }
  
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(loginUserDto.passwordHash, user.passwordHash);
    if (!isPasswordValid) {
      throw new NotFoundException('Email ou mot de passe incorrect');
    }

    // Mettre à jour la date de dernière connexion
    const updatedUser = await this.databaseService.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });
  
    // Générer le token
    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email,role: updatedUser.role },
      process.env.JWT_SECRET || 'votre-secret-key',
      { expiresIn: '24h' }
    );
  
    // Retourner sans le mot de passe
    const { passwordHash, ...userWithoutPassword } = updatedUser;
  
    return {
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword,
      token: token,
    };
  }

  async create(createUserDto: CreateUserDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.databaseService.user.findUnique({
      where: { email: createUserDto.email },
    });
    
    if (existingUser) {
      throw new ConflictException(`L'email ${createUserDto.email} est déjà utilisé.`);
    }
    const hashedPassword = await bcrypt.hash(createUserDto.passwordHash, 10);
    
    
    return this.databaseService.user.create({
      data: {
        email: createUserDto.email,
        passwordHash: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        company: createUserDto.company,
        role: createUserDto.role,
        preferences: createUserDto.preferences ?? {},
        theme: createUserDto.theme,
      },
    });
  }

  findAll() {
    return this.databaseService.user.findMany({
      select:{
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        preferences: true,
        theme: true,
      }
    })
  }

  async findOne(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      include: {
        portfolios: true,
      },
    });
    
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }
    
    // Ne pas retourner le mot de passe
    const { passwordHash, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    //on vérifie si id existe
    await this.findOne(id);
    
    // Si mot de passe à mettre à jour, le hasher
    if (updateUserDto.passwordHash) {
      updateUserDto.passwordHash = await bcrypt.hash(updateUserDto.passwordHash, 10);
    }
    
    return this.databaseService.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        preferences: true,
        theme: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    
    return this.databaseService.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        preferences: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

export default UsersService;
