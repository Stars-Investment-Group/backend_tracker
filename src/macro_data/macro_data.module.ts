import { Module } from '@nestjs/common';
import { MacroDataService } from './macro_data.service';
import { MacroDataController } from './macro_data.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MacroDataInternalController } from './macro-data-internal.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MacroDataController,MacroDataInternalController],
  providers: [MacroDataService],
  exports: [MacroDataService]
})
export class MacroDataModule {}
