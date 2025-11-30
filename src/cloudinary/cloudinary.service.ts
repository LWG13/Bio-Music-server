// src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  /**
   * Upload ảnh lên Cloudinary
   */
  async uploadImage(filePath: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return await cloudinary.uploader.upload(filePath, {
      folder: 'music_app/images',
      upload_preset: 'unsigned_upload',
      public_id: `${Math.floor(Math.random() * 100000000)}_${Date.now()}`,
      allowed_formats: ['png', 'jpg', 'jpeg', 'svg', 'webp'],
      overwrite: true,
      invalidate: true,
    });
  }

  /**
   * Upload audio (mp3, wav,...) lên Cloudinary
   */
  async uploadAudio(filePath: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return await cloudinary.uploader.upload(filePath, {
      folder: 'music_app/audios',
      resource_type: 'video', // cần có để Cloudinary hiểu file là audio
      upload_preset: 'unsigned_upload',
      public_id: `${Math.floor(Math.random() * 100000000)}_${Date.now()}`,
      allowed_formats: ['mp3',"mp4", 'wav', 'ogg', 'm4a'],
      overwrite: true,
      invalidate: true,
    });
  }

  /**
   * Xóa file trên Cloudinary theo public_id
   */
  async deleteFile(publicId: string): Promise<any> {
    return await cloudinary.uploader.destroy(publicId);
  }
}