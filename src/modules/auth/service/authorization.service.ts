/*this file is responsible for checking if a role has authorization
  for a specific path and method within a vendor context
*/
/* Currently not in use, but may be needed later */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authorization } from '../entity/authorization';
import { Role } from '../entity/role.entity';
import { RoleEnum } from 'src/common/enum/role.enum';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Authorization)
    private readonly authorizationRepository: Repository<Authorization>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async isAuthorizedByRoleName(
    roleName: RoleEnum,
    path: string,
    method: string,
  ): Promise<boolean> {
    const role = await this.roleRepository.findOne({
      where: { role: roleName },
    });

    if (!role) {
      return false;
    }

    const authorization = await this.authorizationRepository.findOne({
      where: {
        role: { id: role.id },
        path,
      },
      relations: ['role'],
    });

    if (!authorization) {
      return false;
    }

    return authorization.methods.includes(method);
  }
}
