import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { File } from 'src/modules/fileUpload/entity/file.entity';
import { IdentityProofType } from 'src/common/enum/identity-proof-type.enum';

export { IdentityProofType };

@Entity()
export class IdentityProof {
  @PrimaryColumn({ length: 20, unique: true })
  id: string;

  @Column({ type: 'enum', enum: IdentityProofType })
  type: IdentityProofType;

  @OneToOne(() => File, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'fileId' })
  file: File;

  @ManyToOne(() => User, (user: User) => user.identityProofs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
