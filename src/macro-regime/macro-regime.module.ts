import { Module } from '@nestjs/common';
import { MacroRegimeService } from './macro-regime.service';
import { MacroRegimeController } from './macro-regime.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MacroRegimeController],
  providers: [MacroRegimeService],
  exports: [MacroRegimeService]
})
export class MacroRegimeModule {}
