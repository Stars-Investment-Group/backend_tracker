import { Module } from '@nestjs/common';
import { DataExplorerService } from './data-explorer.service';
import { DataExplorerController } from './data-explorer.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DataExplorerController],
  providers: [DataExplorerService],
  exports: [DataExplorerService]
})
export class DataExplorerModule {}
