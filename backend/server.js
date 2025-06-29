import express from "express";
import multer from "multer";
import path from "path";
import render from "./render.js";
import cors from "cors";
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'video') {
      cb(null, './uploads');
    } else if (file.fieldname === 'image') {
      cb(null, './images');
    } else {
      cb(null, './uploads');
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('video'), (req, res) => {
  try {
    const videoFile = req.file.filename;

    if (!videoFile) {
      return res.status(400).json({ error: 'Missing video or annotation' });
    }

    res.json({ url: `http://localhost:5000/uploads/${videoFile}` });
  } catch (error) {
    console.error('Error in /upload:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/upload/image', upload.single('image'), (req, res) => {
  try {
    const imageFile = req.file.filename;

    if (!imageFile) {
      return res.status(400).json({ error: 'Missing image' });
    }

    res.json({ url: `http://localhost:5000/images/${imageFile}` });
  } catch (error) {
    console.error('Error in /upload/image:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/overlay', async (req, res) => {

try {
  const { videoPath, annotations } = req.body;

    if (!videoPath || !annotations) {
      return res.status(400).json({ error: 'Missing video or annotation' });
    }

    const annotationObject=annotations;

    const outputFileName = `annotated_${Date.now()}.mp4`;
    const outputPath = path.join('output', outputFileName);

    await render(videoPath, annotationObject, outputPath);

    res.json({ url: `http://localhost:5000/${outputPath}` });
  } catch (error) {
    console.error('Error in /upload:', error);
    res.status(500).json({ error: error.message });
  }
});

function cleanupOldFiles(dirPath, maxAgeMs = 3600000) {
  fs.readdir(dirPath, (err, files) => {
    if (err) return;
    files.forEach(file => {

      if (file === '.gitkeep') return;

      const filePath = path.join(dirPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (Date.now() - stats.mtimeMs > maxAgeMs) {
          fs.unlink(filePath, err => {
            if (!err) {
              console.log('Deleted old temp file:', filePath);
            }
          });
        }
      });
    });
  });
}

setInterval(() => {
  cleanupOldFiles(path.join(__dirname, 'uploads'));
  cleanupOldFiles(path.join(__dirname, 'images'));
  cleanupOldFiles(path.join(__dirname, 'output'));
}, 60 * 60 * 1000); // 1 hour


app.use('/images', express.static('images'));
app.use('/uploads', express.static('uploads'));
app.use('/output', express.static('output'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  






























// import express from "express";
// import multer from "multer";
// import path from "path";
// import render from "./render.js";
// import cors from "cors";
// import fs from 'fs';
// import morgan from 'morgan';
// import rateLimit from 'express-rate-limit';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Directory paths
// const uploadsDir = path.join(__dirname, 'uploads');
// const imagesDir = path.join(__dirname, 'images');
// const outputDir = path.join(__dirname, 'output');

// // Ensure directories exist
// [uploadsDir, imagesDir, outputDir].forEach(dir => {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// });

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || '*', // In production, set to your frontend domain
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));
// app.use(rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// }));

// // Multer storage and file filter
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if (file.fieldname === 'video') cb(null, uploadsDir);
//     else if (file.fieldname === 'image') cb(null, imagesDir);
//     else cb(null, uploadsDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });
// const fileFilter = (req, file, cb) => {
//   if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
//     return cb(new Error('Only video files are allowed!'));
//   }
//   if (file.fieldname === 'image' && !file.mimetype.startsWith('image/')) {
//     return cb(new Error('Only image files are allowed!'));
//   }
//   cb(null, true);
// };
// const upload = multer({ storage, fileFilter });

// // Routes

// // Video upload
// app.post('/upload', upload.single('video'), (req, res) => {
//   try {
//     const videoFile = req.file?.filename;
//     if (!videoFile) {
//       return res.status(400).json({ error: 'Missing video file' });
//     }
//     const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
//     res.json({ url: `${BASE_URL}/uploads/${videoFile}` });
//   } catch (error) {
//     console.error('Error in /upload:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Image upload
// app.post('/upload/image', upload.single('image'), (req, res) => {
//   try {
//     const imageFile = req.file?.filename;
//     if (!imageFile) {
//       return res.status(400).json({ error: 'Missing image' });
//     }
//     const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
//     res.json({ url: `${BASE_URL}/images/${imageFile}` });
//   } catch (error) {
//     console.error('Error in /upload/image:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Overlay route
// app.post('/overlay', async (req, res) => {
//   try {
//     const { videoPath, annotations } = req.body;
//     if (!videoPath || !annotations) {
//       return res.status(400).json({ error: 'Missing video or annotation' });
//     }
//     // Input validation (basic example)
//     if (!Array.isArray(annotations)) {
//       return res.status(400).json({ error: 'Annotations must be an array' });
//     }
//     const outputFileName = `annotated_${Date.now()}.mp4`;
//     const outputPath = path.join(outputDir, outputFileName);

//     await render(videoPath, annotations, outputPath);

//     const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
//     res.json({ url: `${BASE_URL}/output/${outputFileName}` });
//   } catch (error) {
//     console.error('Error in /overlay:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Cleanup old files utility
// function cleanupOldFiles(dirPath, maxAgeMs = 3600000) {
//   fs.readdir(dirPath, (err, files) => {
//     if (err) {
//       console.error('Cleanup error:', err);
//       return;
//     }
//     files.forEach(file => {
//       if (file === '.gitkeep') return;
//       const filePath = path.join(dirPath, file);
//       fs.stat(filePath, (err, stats) => {
//         if (err) return;
//         if (Date.now() - stats.mtimeMs > maxAgeMs) {
//           fs.unlink(filePath, err => {
//             if (!err) {
//               console.log('Deleted old temp file:', filePath);
//             }
//           });
//         }
//       });
//     });
//   });
// }

// // Periodic cleanup (every hour)
// setInterval(() => {
//   cleanupOldFiles(uploadsDir);
//   cleanupOldFiles(imagesDir);
//   cleanupOldFiles(outputDir);
// }, 60 * 60 * 1000);

// // Static file serving
// app.use('/images', express.static(imagesDir));
// app.use('/uploads', express.static(uploadsDir));
// app.use('/output', express.static(outputDir));

// // Global error handler (for uncaught errors)
// app.use((err, req, res, next) => {
//   console.error('Unhandled Error:', err);
//   res.status(500).json({ error: err.message || 'Internal Server Error' });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
