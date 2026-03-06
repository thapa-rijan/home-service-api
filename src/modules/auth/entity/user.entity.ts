import { RoleEnum, UserStatus } from 'src/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PhoneNumber } from './phone-number.entity';
import { Provider } from './provider.entity';

@Entity()
export class User {
  @PrimaryColumn({ length: 15, unique: true })
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'enum', enum: RoleEnum })
  role: RoleEnum;

  @OneToMany(() => PhoneNumber, (phone) => phone.user, {
    cascade: true,
    eager: true,
  })
  phoneNumbers: PhoneNumber[];

  @OneToOne(() => Provider, (provider) => provider.user, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  provider: Provider;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
