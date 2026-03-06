import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/auth/entity/user.entity';
import { RoleEnum } from 'src/common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get all users (excludes password). Admin only.
   */
  async getAllUsers(): Promise<{
    message: string;
    data: Omit<User, 'password'>[];
  }> {
    const users = await this.userRepository.find();

    const sanitized = users.map(({ password: _p, ...rest }) => rest) as Omit<
      User,
      'password'
    >[];

    return { message: 'Users fetched successfully', data: sanitized };
  }

  /**
   * Get all customers (role = CUSTOMER). Admin only.
   */
  async getAllCustomers(): Promise<{
    message: string;
    data: Omit<User, 'password'>[];
  }> {
    const users = await this.userRepository.find({
      where: { role: RoleEnum.CUSTOMER },
    });

    const sanitized = users.map(({ password: _p, ...rest }) => rest) as Omit<
      User,
      'password'
    >[];

    return { message: 'Customers fetched successfully', data: sanitized };
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
}
