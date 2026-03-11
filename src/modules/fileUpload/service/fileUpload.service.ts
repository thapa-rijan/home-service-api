import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StringUtils } from 'src/core/utils/stringUtils';
import { Repository } from 'typeorm';
import { File } from '../entity/file.entity';
import { CloudinaryService } from './cloudinary.service';
import { FileType } from 'src/common/enum/file-type';
import { FileMetaType } from 'src/common/enum/file_metatype';

@Injectable()
export class FileuploadService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private readonly FILE_TYPE_RULES = {
    [FileType.SERVICE]: {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      metaType: FileMetaType.IMAGE,
      errorMessage:
        'Service image must be an image file (JPEG, PNG, JPG, WEBP)',
    },
  };

  private validateFile(file: Express.Multer.File, type: FileType): void {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file');
    }

    const rules = this.FILE_TYPE_RULES[type];
    if (!rules) {
      throw new BadRequestException(`Unsupported file type: ${type}`);
    }

    if (!rules.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(rules.errorMessage);
    }
  }

  private getMetaType(type: FileType): FileMetaType {
    return this.FILE_TYPE_RULES[type]?.metaType ?? FileMetaType.IMAGE;
  }

  async saveImage(file: Express.Multer.File, type: FileType) {
    this.validateFile(file, type);

    const { cdnUrl, key, endpointUrl, bucket } =
      await this.cloudinaryService.uploadFile(file);

    if (!cdnUrl || !key) {
      throw new InternalServerErrorException('Failed to upload file');
    }

    const fileRecord = this.fileRepository.create({
      fileId: StringUtils.generateRandomAlphaNumeric(10),
      cdnUrl,
      key,
      endpointUrl,
      bucket,
      type,
      metaType: this.getMetaType(type),
    });

    return this.fileRepository.save(fileRecord);
  }

  async updateImage(file: Express.Multer.File, type: FileType, fileId: string) {
    this.validateFile(file, type);

    if (!fileId) {
      throw new BadRequestException('File ID is required');
    }

    const existingFile = await this.fileRepository.findOne({
      where: { fileId },
    });

    if (!existingFile) {
      throw new NotFoundException('File not found');
    }

    if (existingFile.type !== type) {
      throw new BadRequestException('File type mismatch');
    }

    const { cdnUrl, key, endpointUrl, bucket } =
      await this.cloudinaryService.uploadFile(file);

    if (!cdnUrl || !key) {
      throw new InternalServerErrorException('Failed to upload file');
    }

    try {
      await this.cloudinaryService.deleteFile(existingFile.key);
    } catch (error) {
      console.error('Error deleting old file from Cloudinary:', error);
    }

    existingFile.cdnUrl = cdnUrl;
    existingFile.key = key;
    existingFile.endpointUrl = endpointUrl;
    existingFile.bucket = bucket;
    existingFile.metaType = this.getMetaType(type);

    return this.fileRepository.save(existingFile);
  }

  async deleteImage(fileIds: string | string[]) {
    if (!fileIds || (Array.isArray(fileIds) && fileIds.length === 0)) {
      throw new BadRequestException('File ID(s) are required');
    }

    const ids = Array.isArray(fileIds) ? fileIds : [fileIds];
    const files = await this.fileRepository.find({
      where: ids.map((id) => ({ fileId: id })),
    });

    if (files.length === 0) {
      throw new NotFoundException('File(s) not found');
    }

    const foundIds = files.map((file) => file.fileId);
    const missingIds = ids.filter((id) => !foundIds.includes(id));
    if (missingIds.length > 0) {
      throw new NotFoundException(
        `File(s) not found for ID(s): ${missingIds.join(', ')}`,
      );
    }

    const deletionErrors: string[] = [];
    for (const file of files) {
      try {
        await this.cloudinaryService.deleteFile(file.key);
      } catch (error) {
        console.error(
          `Error deleting file ${file.fileId} from Cloudinary:`,
          error,
        );
        deletionErrors.push(file.fileId);
      }
    }

    await this.fileRepository.remove(files);

    return {
      message: 'File(s) deleted successfully',
      deletedCount: files.length,
      deletedIds: foundIds,
      ...(deletionErrors.length > 0 && {
        warnings: `Failed to delete from Cloudinary for IDs: ${deletionErrors.join(', ')}`,
      }),
    };
  }
}
