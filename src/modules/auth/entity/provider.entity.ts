import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Service } from 'src/modules/services/entity/service.entity';

@Entity()
export class Provider {
  @PrimaryColumn({ length: 15, unique: true })
  id: string;

  @Column({ type: 'int', default: 0 })
  experienceYear: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  ratePerHour: number;

  @Column({ nullable: true })
  specialization: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  jobCompleted: number;

  @OneToOne(() => User, (user: User) => user.provider, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Service, (service) => service.provider, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
