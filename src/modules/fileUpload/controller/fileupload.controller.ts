import {
  Body,
  Controller,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { FileuploadService } from '../service/fileUpload.service';
import { AuthorizationGuard, JwtAuthGuard } from 'src/core/guard';
import { FileType } from 'src/common';

@ApiTags('UploadFile')
@Controller()
export class FileuploadController {
  constructor(private readonly fileuploadService: FileuploadService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/uploadFile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: Object.values(FileType),
        },
      },
    },
  })
  async saveImages(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: FileType,
  ) {
    return this.fileuploadService.saveImage(file, type);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch('/updateFile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: Object.values(FileType),
        },
      },
    },
  })
  async updateImages(
    @UploadedFile() file: Express.Multer.File,
    @Query('image_id') image_id: string,
    @Body('type') type: FileType,
  ) {
    return this.fileuploadService.updateImage(file, type, image_id);
  }
}
