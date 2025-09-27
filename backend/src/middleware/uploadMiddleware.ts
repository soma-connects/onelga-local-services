import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { logger } from '../utils/logger';

// Define allowed file types
const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

// Create upload directory if it doesn't exist
import fs from 'fs';
const uploadDir = process.env['UPLOAD_PATH'] || 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const { service } = req.params;
    const servicePath = path.join(uploadDir, service || 'general');
    
    // Create service directory if it doesn't exist
    if (!fs.existsSync(servicePath)) {
      fs.mkdirSync(servicePath, { recursive: true });
    }
    
    cb(null, servicePath);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = ALLOWED_FILE_TYPES[file.mimetype as keyof typeof ALLOWED_FILE_TYPES] || path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  },
});

// File filter function
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed
  if (ALLOWED_FILE_TYPES[file.mimetype as keyof typeof ALLOWED_FILE_TYPES]) {
    cb(null, true);
  } else {
    const error = new Error(`File type ${file.mimetype} is not allowed. Allowed types: PDF, JPG, PNG, GIF, DOC, DOCX`);
    cb(error as any, false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760'), // 10MB default
    files: 10, // Maximum 10 files per request
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string = 'file') => {
  return (req: Request, res: any, next: any) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (error: any) => {
      if (error) {
        logger.error('File upload error:', error);
        
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum size allowed is 10MB.',
            });
          }
          
          if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files. Maximum 10 files allowed.',
            });
          }
          
          if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: `Unexpected field name. Expected: ${fieldName}`,
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: error.message || 'File upload failed',
        });
      }
      
      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 5) => {
  return (req: Request, res: any, next: any) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (error: any) => {
      if (error) {
        logger.error('Multiple file upload error:', error);
        
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'One or more files are too large. Maximum size allowed is 10MB per file.',
            });
          }
          
          if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum ${maxCount} files allowed.`,
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: error.message || 'File upload failed',
        });
      }
      
      next();
    });
  };
};

// Middleware for mixed file upload (multiple fields)
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return (req: Request, res: any, next: any) => {
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (error: any) => {
      if (error) {
        logger.error('Fields upload error:', error);
        
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'One or more files are too large. Maximum size allowed is 10MB per file.',
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: error.message || 'File upload failed',
        });
      }
      
      next();
    });
  };
};

// Utility function to get file URL
export const getFileUrl = (req: Request, filename: string, service: string = 'general'): string => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${service}/${filename}`;
};

// Utility function to delete file
export const deleteFile = (filePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        logger.error('File deletion error:', error);
        resolve(false);
      } else {
        logger.info(`File deleted: ${filePath}`);
        resolve(true);
      }
    });
  });
};

// Utility function to validate file exists
export const fileExists = (filePath: string): boolean => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    logger.error('File existence check error:', error);
    return false;
  }
};

// File upload controller for API endpoint
export const uploadFiles = async (req: Request, res: any) => {
  try {
    const files = req.files as Express.Multer.File[];
    const file = req.file as Express.Multer.File;
    
    if (!files && !file) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }
    
    const uploadedFiles = files || (file ? [file] : []);
    const fileUrls = uploadedFiles.map(uploadedFile => {
      return {
        originalName: uploadedFile.originalname,
        filename: uploadedFile.filename,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype,
        url: getFileUrl(req, uploadedFile.filename, req.params['service']),
        path: uploadedFile.path,
      };
    });
    
    logger.info(`${uploadedFiles.length} file(s) uploaded successfully`);
    
    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: {
        files: fileUrls,
      },
    });
  } catch (error) {
    logger.error('Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
    });
  }
};

export default upload;
