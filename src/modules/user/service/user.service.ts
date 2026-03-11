import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/auth/entity/user.entity';
import { RoleEnum } from 'src/common';
import { IdentityProof } from 'src/modules/auth/entity/identity-proof.entity';
import { CompleteProfileDto } from '../dto/complete-profile.dto';
import { StringUtils } from 'src/core/utils/stringUtils';
import { File } from 'src/modules/fileUpload/entity/file.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(IdentityProof)
    private readonly identityProofRepository: Repository<IdentityProof>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async getAllUser(
    page: number = 1,
    size: number = 10,
  ): Promise<{ message: string; data: object[]; paginationMeta: object }> {
    const skip = (page - 1) * size;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: size,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sanitized = users.map(({ password: _p, ...rest }) => rest);

    return {
      message: 'Users fetched successfully',
      data: sanitized,
      paginationMeta: { page, size, total },
    };
  }

  /**
   * Get all customers (role = CUSTOMER). Admin only.
   */
  async getAllCustomers(
    page: number = 1,
    size: number = 10,
  ): Promise<{
    message: string;
    data: Omit<User, 'password'>[];
    paginationMeta: object;
  }> {
    const skip = (page - 1) * size;

    const [users, total] = await this.userRepository.findAndCount({
      where: { role: RoleEnum.CUSTOMER },
      skip,
      take: size,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sanitized = users.map(({ password: _p, ...rest }) => rest) as Omit<
      User,
      'password'
    >[];

    return {
      message: 'Customers fetched successfully',
      data: sanitized,
      paginationMeta: { page, size, total },
    };
  }

  /**
   * Get a single user by ID (excludes password).
   */
  async getUserById(
    id: string,
  ): Promise<{ message: string; data: Omit<User, 'password'> }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _p, ...rest } = user;

    return {
      message: 'User fetched successfully',
      data: rest as Omit<User, 'password'>,
    };
  }

  async completeProfile(
    userId: string,
    dto: CompleteProfileDto,
  ): Promise<{ message: string; data: Omit<User, 'password'> }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update profile fields
    user.address = dto.address;
    user.role = dto.role;
    user.latitude = dto.latitude;
    user.longitude = dto.longitude;
    user.serviceName = dto.serviceName;
    user.experienceYear = dto.experienceYear;
    user.phoneNumber = dto.phoneNumber;
    user.workingHourFrom = dto.workingHourFrom;
    user.workingHourTo = dto.workingHourTo;

    await this.userRepository.save(user);

    // Save identity proofs (each linked to an uploaded File)
    if (dto.identityProofs && dto.identityProofs.length > 0) {
      const proofEntities = await Promise.all(
        dto.identityProofs.map(async (proof) => {
          const file = await this.fileRepository.findOne({
            where: { fileId: proof.fileId },
          });
          if (!file) {
            throw new NotFoundException(
              `File with id ${proof.fileId} not found`,
            );
          }
          return this.identityProofRepository.create({
            id: `IP_${StringUtils.generateRandomAlphaNumeric(10)}`,
            type: proof.type,
            file,
            user,
          });
        }),
      );
      await this.identityProofRepository.save(proofEntities);
    }

    // Reload with relations
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _p, ...rest } = updatedUser!;

    return {
      message: 'Profile completed successfully',
      data: rest as Omit<User, 'password'>,
    };
  }
}
