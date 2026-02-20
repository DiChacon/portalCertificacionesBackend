import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads/documentos');
  },
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (_, file, cb) => {
  const allowed = ['.pdf', '.docx', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Tipo de archivo no permitido'));
};

export const uploadDocumento = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});
