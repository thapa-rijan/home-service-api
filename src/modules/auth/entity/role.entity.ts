import { IsEnum } from 'class-validator';
import { RoleEnum } from 'src/common';

import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { Authorization } from './authorization';


@Entity()
export class Role {
  @PrimaryColumn({ length: 10, unique: true })
  id: string;

  @Column({ type: 'enum', enum: RoleEnum, unique: true })
  @IsEnum(RoleEnum)
  role: RoleEnum;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @OneToMany(() => Authorization, (authorization) => authorization.role, {
    cascade: true,
  })
  authorizations: Authorization[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
