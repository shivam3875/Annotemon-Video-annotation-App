# Video Annotation Backend

## Description
Node.js backend for rendering video annotations over uploaded videos using FFmpeg and Canvas.

## Setup
1. Make sure you have [FFmpeg](https://ffmpeg.org/download.html) installed and accessible in your PATH.
2. Run `npm install` to install dependencies.
3. Run `node server.js` to start the server (default port 5000).

## API
- POST `/upload`  
  FormData fields:  
  - `video` (file, mp4 video)  
  - `annotation` (file, JSON annotation)  

Returns JSON: `{ "url": "http://localhost:5000/output/annotated_TIMESTAMP.mp4" }`

## Folder Structure
- `uploads/` - Uploaded videos  
- `annotations/` - Uploaded annotation JSONs  
- `output/` - Rendered annotated videos  
- `temp/` - Temporary PNG frames for overlay rendering  

## Notes
- Assumes 640x360 resolution and 25 FPS. You can customize in `render.js`.  
- Clean up temp files automatically after rendering.
