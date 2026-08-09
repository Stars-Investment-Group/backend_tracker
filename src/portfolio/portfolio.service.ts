import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfolioService {

  constructor(private readonly databaseService: DatabaseService) {}


  async create(createPortfolioDto: CreatePortfolioDto, userId: string) {
    return this.databaseService.portfolio.create({
      data: {
        name: createPortfolioDto.name,
        description: createPortfolioDto.description,
        currency: createPortfolioDto.currency,
        userId: userId,
      }
    })
  }

  async findAll() {
    return this.databaseService.portfolio.findMany({});
  }

  async findOne(id: string) {
    return this.databaseService.portfolio.findUnique({
      where: {id},
    })
  }

  async update(id: string, updatePortfolioDto: UpdatePortfolioDto) {
    return this.databaseService.portfolio.update({
      where: {id},
      data: updatePortfolioDto,
      select: {
        name: true,
        description: true,
        currency: true,
        isActive: true,
      }
    })
  }

  async remove(id: string) {
    try {
      const portfolio = await this.databaseService.portfolio.findUnique({
        where: { id },
        
      });

      if (!portfolio) {
        throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
      }


      const deletedProduct = await this.databaseService.portfolio.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Produit supprimé avec succès',
        product: deletedProduct
      };
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }
}
