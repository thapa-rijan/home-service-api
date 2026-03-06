import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from 'src/modules/auth/entity/provider.entity';
import { ProviderService } from './service/provider.service';
import { ProviderController } from './controller/provider.controller';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Provider]), AuthModule],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}
