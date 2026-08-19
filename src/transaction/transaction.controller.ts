import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/sig/decorators/roles.decorator';

@ApiTags('Transaction')
@ApiBearerAuth('access-token')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un transaction',
    description: 'Ajoute un nouveau transaction',
  })
  @ApiResponse({status: 201, description: 'transaction ajouté avec succès' })
  @ApiResponse({status: 400, description: 'Données Invalide' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister tous les transactions',
    description: 'Retourne tous les transactions enregistrés',
  })
  @ApiResponse({status: 201, description: 'liste tous les transactions avec succès'})
  findAll(@Query('portfolioId') portfolioId?: string,) {
    return this.transactionService.findAll(portfolioId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir des transactions par filtre', 
    description: 'retourne un ou des transactions par filtre'
  })
  @ApiResponse({status: 200, description: 'transaction retourne avec succes'})
  @ApiResponse({status: 404, description: 'filtre impossible'})
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }


}
