import { FileHandlerInstance, FileHandler as FileHandlerClass } from 'node-filehandler';
import Jimp from 'jimp';
import { UrlProfile } from '../../types/FileProfile';


/**
 * Type Filehandler with thumbnails by making a reference
 * Import this variable to use typed reference to singleton class
 */
export const FileHandler = FileHandlerInstance as FileHandlerClass<keyof UrlProfile>;


/**
 * Init Typed FileHandler
 * This should be run first of all
 */
export const InitFileHandler = () => {
  FileHandler.init({
    siteUrl: process.env.SITE_URL,
    minioOptions: {
      endPoint: process.env.MINIO_ENDPOINT,
      port: +process.env.MINIO_PORT,
      useSSL: process.env.MINIO_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      region: process.env.MINIO_REGION,
    },
    bucketName: process.env.MINIO_BUCKET || `bucket-${process.env.NODE_ENV}`,
    thumbnails: {
      splash: (image) => image.resize(10, Jimp.AUTO).blur(1),
      small: (image) => image.resize(100, Jimp.AUTO).quality(80),
      large: (image) => image.resize(500, Jimp.AUTO).quality(80),
      full: null,
    },
  });
};
