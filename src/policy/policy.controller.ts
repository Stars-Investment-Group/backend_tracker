import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';



@ApiTags('Policy')
@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}


  @Public()
  @Get('summary')
  @ApiOperation({
    summary: 'Résumé mondial',
    description:
      "Retourne le résumé mondial",
  })
  @ApiResponse({
    status: 200,
    description: 'Résumé retourné avec succès',
  })
  getSummary() {
    return this.policyService.getSummary();
  }


  @Public()
  @Get('central-banks')
  @ApiOperation({
    summary: 'Liste des banques centrales avec taux',
    description:
      "Retourne la liste des banques centrales avec taux",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste retournée avec succès',
  })
  getCentralBanks() {
    return this.policyService.getCentralBanks();
  }

  @Public()
  @Get('actions')
  @ApiOperation({
    summary: 'Historique des décisions récentes',
    description:
      "Retourne historique des décisions récentes",
  })
  @ApiResponse({
    status: 200,
    description: 'historique retournée avec succès',
  })
  getActions() {
    return this.policyService.getActions();
  }


  @Public()
  @Get('actions/:bankCode')
  @ApiOperation({
    summary: 'Décisions d\'une banque spécifi que',
    description:
      "Retourne banque spécifi que",
  })
  @ApiResponse({
    status: 200,
    description: 'Décission retournée avec succès',
  })
  getActionsByBankCode(@Param('bankCode') bankCode: string) {
    return this.policyService.getActionsByBankCode(bankCode);
  }

  @Public()
  @Get('stance-legend')
  @ApiOperation({
    summary: 'Légende des orientations',
    description:
      "Retourne la légende des orientations",
  })
  @ApiResponse({
    status: 200,
    description: 'Légende retournée avec succès',
  })
  getStanceLegend() {
    return this.policyService.getStanceLegend();
  }
}
