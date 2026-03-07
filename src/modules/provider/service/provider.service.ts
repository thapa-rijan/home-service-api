import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from 'src/modules/auth/entity/provider.entity';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async getAllProviders(
    page: number = 1,
    size: number = 10,
  ): Promise<{ message: string; data: object[]; paginationMeta: object }> {
    const skip = (page - 1) * size;

    const [providers, total] = await this.providerRepository.findAndCount({
      relations: ['user', 'user.phoneNumbers'],
      skip,
      take: size,
    });

    const sanitized = providers.map(({ user, ...providerRest }) => {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...userRest } = user;
        return { ...providerRest, user: userRest };
      }
      return providerRest;
    });

    return {
      message: 'Providers fetched successfully',
      data: sanitized,
      paginationMeta: { page, size, total },
    };
  }

  /**
   * Get a single provider by provider ID with linked user info (password excluded).
   */
  async getProviderById(
    id: string,
  ): Promise<{ message: string; data: object }> {
    const provider = await this.providerRepository.findOne({
      where: { id },
      relations: ['user', 'user.phoneNumbers'],
    });

    if (!provider) {
      throw new NotFoundException(`Provider with id ${id} not found`);
    }

    const { user, ...providerRest } = provider;
    let result: object = providerRest;

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userRest } = user;
      result = { ...providerRest, user: userRest };
    }

    return { message: 'Provider fetched successfully', data: result };
  }
}
