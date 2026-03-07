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
import { UserService } from '../service/user.service';
import { JwtAuthGuard } from 'src/core/guard/jwt-guard';
import { AuthorizationGuard } from 'src/core/guard/authorization-guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get all users (Admin only)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllUsers(
    @Query('page') page: string = '1',
    @Query('size') size: string = '10',
  ) {
    return this.userService.getAllUser(Number(page), Number(size));
  }

  // Get all customers (Admin only)
  @Get('customers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all customers (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customers fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllCustomers(
    @Query('page') page: string = '1',
    @Query('size') size: string = '10',
  ) {
    return this.userService.getAllCustomers(Number(page), Number(size));
  }

  // Get user by ID (Admin and Customer)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID (Admin and Customer)' })
  @ApiResponse({ status: 200, description: 'User fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
