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

  /**
   * Get all providers with their linked user info (password excluded).
   */
  async getAllProviders(): Promise<{ message: string; data: object[] }> {
    const providers = await this.providerRepository.find({
      relations: ['user', 'user.phoneNumbers'],
    });

    const sanitized = providers.map(({ user, ...providerRest }) => {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _p, ...userRest } = user;
        return { ...providerRest, user: userRest };
      }
      return providerRest;
    });

    return { message: 'Providers fetched successfully', data: sanitized };
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
      const { password: _p, ...userRest } = user;
      result = { ...providerRest, user: userRest };
    }

    return { message: 'Provider fetched successfully', data: result };
  }
}
