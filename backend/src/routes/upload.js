import express from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configuration multer pour gérer l'upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB par défaut
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Upload d'image
router.post('/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // Upload vers Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('rsocial-uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Récupérer l'URL publique
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('rsocial-uploads')
      .getPublicUrl(filePath);

    res.json({
      message: 'Image uploadée',
      url: publicUrlData.publicUrl,
      path: filePath
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de l\'upload'
    });
  }
});

// Upload multiple
router.post('/images', authenticate, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error } = await supabaseAdmin.storage
        .from('rsocial-uploads')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('rsocial-uploads')
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        path: filePath
      };
    });

    const urls = await Promise.all(uploadPromises);

    res.json({
      message: 'Images uploadées',
      images: urls
    });
  } catch (error) {
    console.error('Erreur upload multiple:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'upload'
    });
  }
});

// Upload de vidéo
router.post('/video', authenticate, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    // Upload vers Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('rsocial-uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Récupérer l'URL publique
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('rsocial-uploads')
      .getPublicUrl(filePath);

    res.json({
      message: 'Vidéo uploadée',
      url: publicUrlData.publicUrl,
      path: filePath
    });
  } catch (error) {
    console.error('Erreur upload vidéo:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de l\'upload de la vidéo'
    });
  }
});

export default router;

