import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Service } from 'src/modules/services/entity/service.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToOne(() => Service, (service) => service.category)
  service: Service;
}
