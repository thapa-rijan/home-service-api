import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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

  /**
   * Get all users — ADMIN only (via authorization table)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  /**
   * Get all customers — ADMIN only (via authorization table)
   */
  @Get('customers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all customers (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customers fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAllCustomers() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.userService.getAllCustomers();
  }

  /**
   * Get user by ID — ADMIN and CUSTOMER (via authorization table)
   */
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
