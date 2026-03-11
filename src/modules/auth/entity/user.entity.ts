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
import { IdentityProof } from './identity-proof.entity';

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

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  serviceName: string;

  @Column({ type: 'int', nullable: true })
  experienceYear: number;

  @Column({ nullable: true })
  workingHourFrom: string;

  @Column({ nullable: true })
  workingHourTo: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.GUEST })
  role: RoleEnum;

  @OneToMany(() => PhoneNumber, (phone) => phone.user, {
    cascade: true,
    eager: true,
  })
  phoneNumbers: PhoneNumber[];

  @OneToMany(() => IdentityProof, (proof: IdentityProof) => proof.user, {
    cascade: true,
    eager: true,
  })
  identityProofs: IdentityProof[];

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
