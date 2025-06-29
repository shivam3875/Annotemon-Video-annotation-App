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

// Multer setup: only for video file
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

app.post('/delete-upload', (req, res) => {
  const { videoUrl } = req.body;
  console.log(videoUrl);
  try {
    // URL se relative path nikalo
    const url = new URL(videoUrl);
    const relativePath = url.pathname; // e.g. /uploads/abc123.mp4
    const absolutePath = path.join(__dirname, relativePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      res.json({ success: true });
    } else {
      console.log("file mot found")
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    console.log("file error")
    res.status(500).json({ error: err.message });
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

