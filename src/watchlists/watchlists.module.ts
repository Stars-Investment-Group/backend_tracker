import { Module } from '@nestjs/common';
import { WatchlistsService } from './watchlists.service';
import { WatchlistsController } from './watchlists.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports:[DatabaseModule],
  controllers: [WatchlistsController],
  providers: [WatchlistsService],
  exports:[WatchlistsService]
})
export class WatchlistsModule {}
