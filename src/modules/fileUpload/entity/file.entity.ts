import { FileMetaType, FileType } from 'src/common';
import { Service } from 'src/modules/services/entity/service.entity';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryColumn()
  fileId: string;

  @Column({ nullable: false })
  cdnUrl: string;

  @Column({ nullable: false })
  endpointUrl: string;

  @Column({ nullable: false })
  key: string;

  @Column({ nullable: false })
  bucket: string;

  @Column({ type: 'enum', enum: FileType })
  type: FileType;

  @Column({ type: 'enum', enum: FileMetaType })
  metaType: FileMetaType;

  @OneToOne(() => Service, (service) => service.files, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  service: Service;
}
