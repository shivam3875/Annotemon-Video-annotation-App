import express from "express";
import multer from "multer";
import path from "path";
import render from "./render.js";
import cors from "cors";
import fs from 'fs';
import fsPromises from 'fs/promises';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import {app,server} from "./sockets/socket.js"
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/overlay', async (req, res) => {
  try {
    const { videoPath, annotations, socketId } = req.body;
    if (!videoPath || !annotations) {
      return res.status(400).json({ error: 'Missing video or annotation' });
    }
    if (!Array.isArray(annotations)) {
      return res.status(400).json({ error: 'Annotations must be an array' });
    }

    const outputFileName = `annotated_${Date.now()}.mp4`;
    // const outputPath = path.join(__dirname, 'output', outputFileName);
    const outputPath = path.join('output', outputFileName);

    await render(videoPath, annotations, outputPath, socketId);

    // Cloudinary पर upload करें
    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: "video",
      upload_preset: "Annotation",
      tags: "preset-Annotation",
    });

    // Temp file delete करें
    // await fs.unlink(outputPath);
    await fsPromises.unlink(outputPath);

    // User को Cloudinary URL दें
    res.json({ url: result.secure_url });

  } catch (error) {
    console.error('Error in /overlay:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use('/output', express.static('output'));

async function cleanupOldCloudinaryFilesByPreset(maxAgeMs = 3600000) {
  const now = Date.now();
  let nextCursor = null;
  let deletedCount = 0;
  const timestamp = new Date(now - maxAgeMs).toISOString();

  do {
    const result = await cloudinary.search
      .expression(`tags=preset-Annotation AND created_at<"${timestamp}"`)
      .max_results(100)
      .next_cursor(nextCursor)
      .sort_by('created_at','asc')
      .execute();

    if (!result.resources.length) break;

    for (const file of result.resources) {
      try {
        const delResult = await cloudinary.uploader.destroy(file.public_id, { resource_type: file.resource_type , invalidate: true });
        if (delResult.result !== "ok") {
          console.log(`Failed to delete file: ${file.public_id}, reason: ${delResult.result}`);
        } else {
          console.log('Deleted old Cloudinary file:', file.public_id);
          deletedCount++;
        }
      } catch (err) {
        console.error('Delete error:', err, file.public_id);
      }
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log(`Cleanup complete. Deleted ${deletedCount} old files for tag preset-Annotation`);
}

setInterval(() => {
  cleanupOldCloudinaryFilesByPreset(3600000)
    .catch(err => console.error('Cloudinary cleanup error:', err));
}, 60 * 60* 1000);

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));  
