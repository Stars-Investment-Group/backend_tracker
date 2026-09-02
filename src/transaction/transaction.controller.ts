import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../sig/decorators/current-user.decorator';

@ApiTags('Transaction')
@ApiBearerAuth('access-token')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une transaction',
    description: 'Ajoute une nouvelle transaction dans un portfolio',
  })
  @ApiResponse({ status: 201, description: 'Transaction ajoutée avec succès' })
  @ApiResponse({ status: 400, description: 'Données Invalides ou solde insuffisant' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Portfolio ou Instrument introuvable' })
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: any,
  ) {
    return this.transactionService.create(createTransactionDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les transactions',
    description: "Retourne les transactions de l'utilisateur avec filtre optionnel par portfolio",
  })
  @ApiResponse({ status: 200, description: 'Liste de transactions retournée avec succès' })
  findAll(
    @CurrentUser() user: any,
    @Query('portfolioId') portfolioId?: string,
  ) {
    return this.transactionService.findAll(user, portfolioId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir une transaction par ID',
    description: 'Retourne une transaction spécifique',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de la transaction" })
  @ApiResponse({ status: 200, description: 'Transaction retournée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Transaction introuvable' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.transactionService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une transaction',
    description: "Modifie les informations d'une transaction existante",
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de la transaction" })
  @ApiResponse({ status: 200, description: 'Transaction mise à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Transaction non trouvée' })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() user: any,
  ) {
    return this.transactionService.update(id, updateTransactionDto, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une transaction',
    description: 'Supprime définitivement une transaction',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de la transaction" })
  @ApiResponse({ status: 200, description: 'Transaction supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Transaction non trouvée' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.transactionService.remove(id, user);
  }
}
