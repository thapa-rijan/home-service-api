import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/interfaces/jwtPayload';
import { LoginDTO } from '../dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/user.entity';
import { PhoneNumber } from '../entity/phone-number.entity';
import { Provider } from '../entity/provider.entity';
import { SignUpDto } from '../dto/signup.dto';
import { RoleEnum } from 'src/common/enum/role.enum';
import { EmailDomainValidationService } from './validemail.service';
import { StringUtils } from 'src/core/utils/stringUtils';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PhoneNumber)
    private readonly phoneNumberRepository: Repository<PhoneNumber>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    private readonly validateEmail: EmailDomainValidationService,
  ) {}
  /**
   * Generates an access token using the provided payload.
   * @param payload - JWT payload containing user information.
   * @returns Access token as a string.
   */
  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: (this.configService.get<string>('ACCESS_TOKEN_EXPIRY') ??
        '1h') as StringValue,
    });
  }

  /**
   * Generates a refresh token using the provided payload.
   * @param payload - JWT payload containing user information.
   * @returns Refresh token as a string.
   */
  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: (this.configService.get<string>('REFRESH_TOKEN_EXPIRY') ??
        '7d') as StringValue,
    });
  }

  /**
   * Generates a new access token from a valid refresh token.
   * @param refreshToken - Refresh token as a string.
   * @returns New access token as a string.
   * @throws UnauthorizedException if the refresh token is invalid or expired.
   */
  generateAccessTokenFromRefreshToken(refreshToken: string): string {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      // Create clean payload with only our custom properties
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { exp, iat, nbf, ...cleanPayload } = decoded;

      return this.generateAccessToken(cleanPayload as JwtPayload);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Generates a new access token from a valid refresh token.
   * @param refreshToken - Refresh token as a string.
   * @returns New access token as a string.
   * @throws UnauthorizedException if the refresh token is invalid or expired.
   */
  generateRefreshTokenFromRefreshToken(refreshToken: string): string {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      // Create clean payload with only our custom properties
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { exp, iat, nbf, ...cleanPayload } = decoded;

      return this.generateRefreshToken(cleanPayload as JwtPayload);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Refreshes access token using a valid refresh token.
   * @param refreshToken - Refresh token as a string.
   * @returns Object containing new access token and refresh token.
   * @throws UnauthorizedException if the refresh token is invalid or expired.
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const newAccessToken =
        this.generateAccessTokenFromRefreshToken(refreshToken);
      const newRefreshToken =
        this.generateRefreshTokenFromRefreshToken(refreshToken);
      const data = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
      return {
        message: 'Token refreshed successfully',
        data,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async signUp(
    signUpRequest: SignUpDto,
  ): Promise<{ message: string; data: object }> {
    // Block Admin self-registration
    if (signUpRequest.role === RoleEnum.ADMIN) {
      throw new BadRequestException('Cannot register as Admin on signup');
    }

    // Require provider fields when role is PROVIDER
    if (signUpRequest.role === RoleEnum.PROVIDER) {
      if (
        signUpRequest.experienceYear === undefined ||
        signUpRequest.ratePerHour === undefined ||
        !signUpRequest.specialization
      ) {
        throw new BadRequestException(
          'experienceYear, ratePerHour and specialization are required for PROVIDER signup',
        );
      }
    }

    // Check for duplicate email
    const existingEmail = await this.userRepository.findOne({
      where: { email: signUpRequest.email },
    });
    if (existingEmail) {
      throw new BadRequestException(
        `Email ${signUpRequest.email} is already registered`,
      );
    }

    // Check for duplicate phone numbers
    const duplicatePhone = await this.phoneNumberRepository.findOne({
      where: { phoneNumber: In(signUpRequest.phoneNumbers) },
    });
    if (duplicatePhone) {
      throw new BadRequestException(
        `Phone number ${duplicatePhone.phoneNumber} is already registered`,
      );
    }

    // Validate email domain
    const validatedDomain = await this.validateEmail.validateEmailDomain(
      signUpRequest.email,
    );
    if (!validatedDomain) {
      throw new BadRequestException('Email domain is invalid or not allowed');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(signUpRequest.password, 10);

    // Build User entity
    const userId = `US_${StringUtils.generateRandomAlphaNumeric(10)}`;
    const userEntity = this.userRepository.create({
      id: userId,
      fullName: signUpRequest.fullName,
      email: signUpRequest.email,
      password: hashedPassword,
      role: signUpRequest.role,
      address: signUpRequest.address,
    });

    const savedUser = await this.userRepository.save(userEntity);

    // Save phone numbers
    const phoneEntities = signUpRequest.phoneNumbers.map((num) =>
      this.phoneNumberRepository.create({
        id: `PH_${StringUtils.generateRandomAlphaNumeric(10)}`,
        phoneNumber: num,
        user: savedUser,
      }),
    );
    await this.phoneNumberRepository.save(phoneEntities);

    // Create provider profile when applicable
    let savedProvider: Provider | null = null;
    if (signUpRequest.role === RoleEnum.PROVIDER) {
      const providerEntity = this.providerRepository.create({
        id: `PR_${StringUtils.generateRandomAlphaNumeric(10)}`,
        experienceYear: signUpRequest.experienceYear,
        ratePerHour: signUpRequest.ratePerHour,
        specialization: signUpRequest.specialization,
        rating: 0,
        jobCompleted: 0,
        user: savedUser,
      });
      savedProvider = await this.providerRepository.save(providerEntity);
    }

    // Return response without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = savedUser;

    return {
      message:
        signUpRequest.role === RoleEnum.PROVIDER
          ? 'Provider registered successfully'
          : 'Customer registered successfully',
      data: {
        user: {
          ...userWithoutPassword,
          phoneNumbers: phoneEntities.map((p) => p.phoneNumber),
          ...(savedProvider && {
            provider: {
              id: savedProvider.id,
              experienceYear: savedProvider.experienceYear,
              ratePerHour: savedProvider.ratePerHour,
              specialization: savedProvider.specialization,
              rating: savedProvider.rating,
              jobCompleted: savedProvider.jobCompleted,
            },
          }),
        },
      },
    };
  }
  /**
   * Handles user login process.
   * @param loginDTO - Data transfer object containing user login information.
   * @returns A promise that resolves with JWT tokens and user information.
   * @throws UnauthorizedException if credentials are invalid.
   */
  async login(loginDTO: LoginDTO) {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: loginDTO.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found with this email');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDTO.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Create JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      name: user.fullName,
      role: user.role,
      address: user.address,
    };

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...loggedInUser } = user;

    return {
      message: 'Login successful',
      data: {
        accessToken: this.generateAccessToken(payload),
        refreshToken: this.generateRefreshToken(payload),
        user: loggedInUser,
      },
    };
  }

  /**
   * Get currently logged in user information
   * @param id - User ID from JWT token
   * @returns User information without password
   */
  async getCurrentlyLoggedInUser(
    id: string,
  ): Promise<{ message: string; data: Omit<User, 'password'> }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'User fetched successfully',
      data: userWithoutPassword as Omit<User, 'password'>,
    };
  }
}
