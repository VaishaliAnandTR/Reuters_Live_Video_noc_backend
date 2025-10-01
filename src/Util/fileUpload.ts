import { Request, Response } from 'express';
import { Logger } from '../Util/Logger';
import { customErrorHandler } from './CommonUtil';
import { GcpClient } from '../Service/GcpClient';
import multer from 'multer';
import config from '../Config';

const bucketName = config.GCP.BUCKET_NAME;
// Set up multer to store files in memory temporarily
const multerStorage = multer.memoryStorage();

// File type validation
export const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv', // CSV files
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, Doc, Excel, and PDF are allowed!'), false);
  }
};

// Initialize multer upload middleware
const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
});

// Helper function to upload file to GCP
const uploadToGCP = (
  blob: any,
  buffer: Buffer,
  mimetype: string,
  res: Response,
  successMessage: string
) => {
  const blobStream = blob.createWriteStream({
    resumable: true,
    metadata: {
      contentType: mimetype,
    },
  });

  blobStream.on('finish', () => {
    const response = {
      relativeUrl: `${blob.bucket.name}/${blob.name}`,
    };
    res.status(200).send({
      message: successMessage,
      data: response,
    });
  });

  blobStream.on('error', (err: any) => {
    Logger.error('Error while uploading to GCP', 'uploadToGCP', err);
    return customErrorHandler(res, 500, 'error', null, err?.message);
  });

  blobStream.end(buffer);
};

export const ItemUpload = async (req: any, res: Response) => {
  try {
    upload.single('file')(req, res, async (err: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!req.file) {
        return customErrorHandler(res, 400, 'error', null, 'No file uploaded');
      }

      const storage = await new GcpClient().authorize();
      const bucket = storage.bucket(bucketName);

      const { originalname, buffer, mimetype } = req.file;
      const formname = req.params.formname.replace(/ /g, '_');
      const application_id = req.params.application_id;
      const appendTimestampParam: any = req.params.append_timestamp;

      const appendTimestamp = appendTimestampParam === 'true' || appendTimestampParam === true;
      const folderPath = `${formname}/${application_id}`;
      const cleanFileName = originalname.replace(/ /g, '_');

      let blobName = `${folderPath}/${cleanFileName}`;

      if (appendTimestamp) {
        // If append_timestamp is true, add timestamp to filename
        blobName = `${folderPath}/${Date.now()}-${cleanFileName}`;
      }

      const blob = bucket.file(blobName);

      if (!appendTimestamp) {
        // If appendTimestamp is false, check if file exists and overwrite
        const [exists] = await blob.exists();
        if (exists) {
          // File exists, update (overwrite)
          uploadToGCP(blob, buffer, mimetype, res, 'File updated successfully!');
        } else {
          // File does not exist, upload new
          uploadToGCP(blob, buffer, mimetype, res, 'File uploaded successfully!');
        }
      } else {
        // Always upload new file with timestamp
        uploadToGCP(blob, buffer, mimetype, res, 'File uploaded successfully with timestamp!');
      }
    });
  } catch (err: any) {
    Logger.error('Error while ItemUpload', 'ItemUpload', err);

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File size is too large. Maximum allowed size is 20 MB.',
        });
      }
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err.message?.includes('Invalid file type')) {
      return res.status(400).json({ error: err.message });
    } else {
      return customErrorHandler(res, 500, 'error', null, err);
    }
  }
};

const filUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
});
