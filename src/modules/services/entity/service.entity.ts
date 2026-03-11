import { ServiceStatus } from 'src/common/enum/service-status';
import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Category } from 'src/modules/category/entity/category.entity';
import { Provider } from 'src/modules/auth/entity/provider.entity';
import { File } from 'src/modules/fileUpload/entity/file.entity';

@Entity()
export class Service {
  @PrimaryColumn({ length: 10, unique: true })
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: false })
  duration: number;

  @Column({ type: 'enum', enum: ServiceStatus })
  status: ServiceStatus;

  @OneToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToOne(() => Provider, (provider) => provider.user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @OneToOne(() => File, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'fileId' })
  files: File;
}
