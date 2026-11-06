import { Module } from '@nestjs/common';
import { AlertMacroService } from './alert-macro.service';
import { AlertMacroController } from './alert-macro.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AlertMacroController],
  providers: [AlertMacroService],
  exports: [AlertMacroService]
})
export class AlertMacroModule {}
