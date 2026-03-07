import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProviderService } from '../service/provider.service';
import { JwtAuthGuard } from 'src/core/guard/jwt-guard';
import { AuthorizationGuard } from 'src/core/guard/authorization-guard';

@ApiTags('Providers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  // Get all providers (all authenticated roles)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all providers (all authenticated roles)' })
  @ApiResponse({ status: 200, description: 'Providers fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllProviders(
    @Query('page') page: string = '1',
    @Query('size') size: string = '10',
  ) {
    return this.providerService.getAllProviders(Number(page), Number(size));
  }

  // Get provider by ID — all authenticated roles (via authorization table)

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get provider by ID (all authenticated roles)' })
  @ApiResponse({ status: 200, description: 'Provider fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  getProviderById(@Param('id') id: string) {
    return this.providerService.getProviderById(id);
  }
}
