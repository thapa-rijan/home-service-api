import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Authorization {
  @PrimaryColumn({ length: 10, unique: true })
  id: string;

  @Column()
  path: string;

  @Column('simple-json')
  methods: string[];

  @ManyToOne(() => Role, (role) => role.authorizations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
