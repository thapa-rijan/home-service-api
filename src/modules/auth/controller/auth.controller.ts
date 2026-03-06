import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { LoginDTO } from '../dto/login.dto';
import { SignUpDto } from '../dto/signup.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthUser } from 'src/common/interfaces/authRequest';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User signup endpoint
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed or user already exists',
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  /**
   * User login endpoint
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  async login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }

  /**
   * Refresh access token endpoint
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  /**
   * Get currently logged in user endpoint
   * Note: This requires authentication. Add your JWT guard decorator here.
   * Example: @UseGuards(JwtAuthGuard)
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get currently logged in user' })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  // @UseGuards(JwtAuthGuard) // Uncomment and add your auth guard
  async getCurrentUser(@Request() req: AuthUser) {
    // Extract user ID from JWT payload set by your auth guard
    const userId = req.user.sub;
    return this.authService.getCurrentlyLoggedInUser(userId);
  }
}
