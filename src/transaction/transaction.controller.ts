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
import { Roles } from '../sig/decorators/roles.decorator';

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
  @ApiResponse({ status: 400, description: 'Données Invalides' })
  @ApiResponse({ status: 404, description: 'Portfolio ou Instrument introuvable' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister toutes les transactions',
    description: 'Retourne toutes les transactions enregistrées avec filtre optionnel par portfolio',
  })
  @ApiResponse({ status: 200, description: 'Liste de transactions retournée avec succès' })
  findAll(@Query('portfolioId') portfolioId?: string) {
    return this.transactionService.findAll(portfolioId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir une transaction par ID',
    description: 'Retourne une transaction spécifique',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de la transaction" })
  @ApiResponse({ status: 200, description: 'Transaction retournée avec succès' })
  @ApiResponse({ status: 404, description: 'Transaction introuvable' })
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une transaction',
    description: "Modifie les informations d'une transaction existante",
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de la transaction" })
  @ApiResponse({ status: 200, description: 'Transaction mise à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Transaction non trouvée' })
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une transaction',
    description: 'Supprime définitivement une transaction',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de la transaction" })
  @ApiResponse({ status: 200, description: 'Transaction supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Transaction non trouvée' })
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
