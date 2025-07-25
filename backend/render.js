// import path from "path";
// import { fileURLToPath } from "url";
// import { createCanvas,loadImage } from "canvas";
// import ffmpeg from "fluent-ffmpeg";
// import { Readable } from "stream";
// import {io} from "./sockets/socket.js"


// // ffmpeg.setFfmpegPath("C:/Users/kumar/Downloads/ffmpeg/ffmpeg.exe");
// // ffmpeg.setFfprobePath("C:/Users/kumar/Downloads/ffmpeg/ffprobe.exe");

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// //fre drawing with tention on node canvas
// function drawSmoothCurve(ctx, points, tension = 0.5) {
//   if (points.length < 4) {
//     // Kam points hain to seedha line bana do
//     ctx.beginPath();
//     ctx.moveTo(points[0], points[1]);
//     for (let i = 2; i < points.length; i += 2) {
//       ctx.lineTo(points[i], points[i + 1]);
//     }
//     ctx.stroke();
//     return;
//   }

//   // Helper: Catmull-Rom spline ke liye control points nikaalo
//   function getControlPoints(p0, p1, p2, p3, t) {
//     // p0, p1, p2, p3: [x, y] arrays
//     const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
//     const d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
//     const d3 = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);

//     const d1a = d1 === 0 ? 1 : d1;
//     const d2a = d2 === 0 ? 1 : d2;
//     const d3a = d3 === 0 ? 1 : d3;

//     const A = [
//       (p2[0] - p0[0]) / (d1a + d2a),
//       (p2[1] - p0[1]) / (d1a + d2a)
//     ];
//     const B = [
//       (p3[0] - p1[0]) / (d2a + d3a),
//       (p3[1] - p1[1]) / (d2a + d3a)
//     ];

//     const cp1 = [
//       p1[0] + A[0] * d1a * t,
//       p1[1] + A[1] * d1a * t
//     ];
//     const cp2 = [
//       p2[0] - B[0] * d2a * t,
//       p2[1] - B[1] * d2a * t
//     ];

//     return [cp1, cp2];
//   }

//   // Points ko [x, y] pairs me convert karo
//   const pts = [];
//   for (let i = 0; i < points.length; i += 2) {
//     pts.push([points[i], points[i + 1]]);
//   }

//   ctx.beginPath();
//   ctx.moveTo(pts[0][0], pts[0][1]);

//   for (let i = 1; i < pts.length - 2; i++) {
//     const [cp1, cp2] = getControlPoints(
//       pts[i - 1], pts[i], pts[i + 1], pts[i + 2], tension
//     );
//     ctx.bezierCurveTo(
//       cp1[0], cp1[1],
//       cp2[0], cp2[1],
//       pts[i + 1][0], pts[i + 1][1]
//     );
//   }

//   // Last segment ko line se close karo
//   ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
//   ctx.stroke();
// }

// async function render(videoPath, annotations, outputPath, socketId) {
//   return new Promise((resolve, reject) => {
//     try {

//       // Get video info (dimensions and fps) using ffprobe
//       ffmpeg.ffprobe(videoPath, async (err, metadata) => {  //yahan change kiya sync krdiya
//         if (err) return reject(err);

//         // Find the video stream
//         const videoStream = metadata.streams.find(
//           s => s.codec_type === 'video' && s.width && s.height
//         );
//         if (!videoStream) return reject(new Error('No video stream found'));

//         // Extract width and height
//         const width = videoStream.width;
//         const height = videoStream.height;

//         // Extract FPS (frame rate)
//         const rFrameRate = videoStream.r_frame_rate; // e.g., "25/1"
//         const parts = rFrameRate.split('/');
//         const fps = parseInt(parts[0]) / parseInt(parts[1]);

//         // Extract duration
//         const duration = metadata.format.duration;
//         const totalFrames = Math.floor(duration * fps);

//         const imageCache = {}; //image cache
//         const imageAnnots = annotations.filter(a => a.type === "image");
//         for (const a of imageAnnots) {
//           if (!imageCache[a.src]) {
//             imageCache[a.src] = await loadImage(a.src);
//           }
//         }

//         // Create canvas with video dimensions
//         const canvas = createCanvas(width, height);
//         const ctx = canvas.getContext('2d');

//         // --- Create frameStream here ---
//         const frameStream = new Readable({
//           read() {} // We'll push data manually
//         });

//         // --- Start ffmpeg process here ---
//         const ffmpegProcess = ffmpeg()
//           .input(frameStream)
//           .inputFormat('image2pipe')
//           .inputOptions('-framerate', `${fps}`)
//           .input(videoPath)
//           .complexFilter('[1:v][0:v] overlay=0:0')
//           .outputOptions([
//             '-c:v', 'libx264',
//             '-pix_fmt', 'yuv420p',
//             '-preset', 'fast',
//             '-crf', '23'
//           ])
//           .on('error', (err) => {
//             console.error('FFmpeg error:', err.message);
//             if (ffmpegProcess && ffmpegProcess.kill) {
//               ffmpegProcess.kill('SIGKILL');
//             }
//             reject(err)
//           })
//           .on('end', () => resolve())
//           .save(outputPath)
//           // .format('mp4')
//           // .pipe(uploadStream, { end: true });


//           let lastEmit = 0;

//         // Draw overlay frame PNGs
//         for (let i = 0; i < totalFrames; i++) {
//           const currentTime = i / fps;

//           // Clear canvas
//           ctx.clearRect(0, 0, width, height);

//           for (const a of annotations) {
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type=="rect") {
//                   ctx.save(); // Save the current state

//                   // Move the origin to the center of the rectangle
//                   ctx.translate(a.left, a.top);

//                   // Rotate (angle in radians)
//                   ctx.rotate(a.rotation * Math.PI / 180);

//                   if (a.fill) {
//                     ctx.fillStyle = a.fill;
//                     ctx.fillRect(0, 0, a.width, a.height);
//                   }

//                   ctx.strokeStyle = a.stroke;
//                   ctx.lineWidth = a.strokeWidth;

//                   // Draw rectangle centered at top left corner
//                   ctx.strokeRect(0,0, a.width, a.height);

//                   ctx.restore(); // Restore the state
//               }
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type=="circle") {
//                 ctx.strokeStyle = a.stroke;
//                 ctx.lineWidth = a.strokeWidth;

//                 // a.left = centerX, a.top = centerY, a.radius = radius
//                 ctx.beginPath();
//                 ctx.arc(a.left, a.top, a.radius, 0, 2 * Math.PI);

//                 if(a.fill){
//                   ctx.fillStyle=a.fill;
//                   ctx.fill();
//                 }

//                 ctx.stroke();
//               }
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type == "line") {
//                 ctx.strokeStyle = a.stroke;
//                 ctx.lineWidth = a.strokeWidth;
//                 ctx.beginPath();
//                 ctx.moveTo(a.points[0], a.points[1]);
//                 ctx.lineTo(a.points[2], a.points[3]);
//                 ctx.stroke();
//               }
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type == "text") {
//                 ctx.save();

//                 // Move to text position and apply rotation
//                 ctx.translate(a.left, a.top);
//                 ctx.rotate((a.rotation || 0) * Math.PI / 180);

//                 // Set font (e.g., "italic bold 42px Arial")
//                 const fontStyle = a.fontStyle || "";
//                 const fontSize = a.fontSize || 24;
//                 const fontFamily = a.fontFamily || "Arial";
//                 ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`.trim();

//                 // Set color
//                 ctx.fillStyle = a.fontColor || "#000000";

//                 // Multiline support
//                 const lines = (a.text || "").split('\n');
//                 const lineHeight = Math.round(fontSize * a.lineHeight);

//                 for (let i = 0; i < lines.length; i++) {
//                   const line = lines[i];
//                   // ctx.fillText(line, 0, i * lineHeight);
//                   const ascent =  fontSize;
//                   ctx.fillText(line, 0, i * lineHeight + ascent);


//                   // Underline if needed
//                   if (a.textDecoration === "underline") {
//                     const metrics = ctx.measureText(line);
//                     const underlineY = i * lineHeight + ascent + Math.max(4, fontSize / 6); // 4px below baseline
//                     ctx.beginPath();
//                     ctx.strokeStyle = a.fontColor || "#000000";
//                     ctx.lineWidth = Math.max(1, Math.floor(fontSize / 15));
//                     ctx.moveTo(0, underlineY);
//                     ctx.lineTo(metrics.width, underlineY);
//                     ctx.stroke();
//                   }
//                 }

//                 ctx.restore();
//               }
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type=="freedraw") {
//                 ctx.save();

//                  ctx.globalCompositeOperation = a.mode === "eraser" ? "destination-out" : "source-over";

//                 ctx.strokeStyle = a.stroke || "#df4b26";
//                 ctx.lineWidth = a.strokeWidth || 4;
//                 ctx.lineCap = "round";
//                 ctx.lineJoin = "round";
//                 drawSmoothCurve(ctx, a.points, a.tension || 0.5); // <-- yahan tension set kar sakte hain
//                 ctx.restore();
//               }
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type === "image") {
//                 const img = imageCache[a.src];
//                 if (img) {
//                   ctx.save();
//                   ctx.translate(a.left, a.top);
//                   ctx.rotate((a.rotation || 0) * Math.PI / 180);
//                   ctx.drawImage(img, 0, 0, a.width, a.height);
//                   ctx.restore();
//                 }
//               }
//           };

//           const buffer = canvas.toBuffer('image/png');
//           frameStream.push(buffer);

//           if (i % 100 === 0 || i === totalFrames - 1) {
//             console.log(`Rendered frame ${i + 1} / ${totalFrames}`);
//           }

//           const percent = Math.floor(((i + 1) / totalFrames) * 100);
//           // if (socketId) {
//           //   io.to(socketId).emit("render-progress", { percent });
//           // }
//           const now = Date.now();
//           if (percent === 100 || now - lastEmit > 1000) { // हर 1s या 100% पर emit
//             io.to(socketId).emit("render-progress", { percent });
//             lastEmit = now;
//           }

//         }

//         frameStream.push(null); // Signal end of stream
        
//       });
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// export default render; 














// import path from "path";
// import { fileURLToPath } from "url";
// import { createCanvas,loadImage } from "canvas";
// import ffmpeg from "fluent-ffmpeg";
// import { Readable } from "stream";
// import {io} from "./sockets/socket.js"


// ffmpeg.setFfmpegPath("C:/Users/kumar/Downloads/ffmpeg/ffmpeg.exe");
// ffmpeg.setFfprobePath("C:/Users/kumar/Downloads/ffmpeg/ffprobe.exe");

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// //fre drawing with tention on node canvas
// function drawSmoothCurve(ctx, points, tension = 0.5) {
//   if (points.length < 4) {
//     // Kam points hain to seedha line bana do
//     ctx.beginPath();
//     ctx.moveTo(points[0], points[1]);
//     for (let i = 2; i < points.length; i += 2) {
//       ctx.lineTo(points[i], points[i + 1]);
//     }
//     ctx.stroke();
//     return;
//   }

//   // Helper: Catmull-Rom spline ke liye control points nikaalo
//   function getControlPoints(p0, p1, p2, p3, t) {
//     // p0, p1, p2, p3: [x, y] arrays
//     const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
//     const d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
//     const d3 = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);

//     const d1a = d1 === 0 ? 1 : d1;
//     const d2a = d2 === 0 ? 1 : d2;
//     const d3a = d3 === 0 ? 1 : d3;

//     const A = [
//       (p2[0] - p0[0]) / (d1a + d2a),
//       (p2[1] - p0[1]) / (d1a + d2a)
//     ];
//     const B = [
//       (p3[0] - p1[0]) / (d2a + d3a),
//       (p3[1] - p1[1]) / (d2a + d3a)
//     ];

//     const cp1 = [
//       p1[0] + A[0] * d1a * t,
//       p1[1] + A[1] * d1a * t
//     ];
//     const cp2 = [
//       p2[0] - B[0] * d2a * t,
//       p2[1] - B[1] * d2a * t
//     ];

//     return [cp1, cp2];
//   }

//   // Points ko [x, y] pairs me convert karo
//   const pts = [];
//   for (let i = 0; i < points.length; i += 2) {
//     pts.push([points[i], points[i + 1]]);
//   }

//   ctx.beginPath();
//   ctx.moveTo(pts[0][0], pts[0][1]);

//   for (let i = 1; i < pts.length - 2; i++) {
//     const [cp1, cp2] = getControlPoints(
//       pts[i - 1], pts[i], pts[i + 1], pts[i + 2], tension
//     );
//     ctx.bezierCurveTo(
//       cp1[0], cp1[1],
//       cp2[0], cp2[1],
//       pts[i + 1][0], pts[i + 1][1]
//     );
//   }

//   // Last segment ko line se close karo
//   ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
//   ctx.stroke();
// }

// async function render(videoPath, annotations, outputPath, socketId) {
//   return new Promise((resolve, reject) => {
//     try {

//       // Get video info (dimensions and fps) using ffprobe
//       ffmpeg.ffprobe(videoPath, async (err, metadata) => {  //yahan change kiya sync krdiya
//         if (err) return reject(err);

//         // Find the video stream
//         const videoStream = metadata.streams.find(
//           s => s.codec_type === 'video' && s.width && s.height
//         );
//         if (!videoStream) return reject(new Error('No video stream found'));

//         // Extract width and height
//         const width = videoStream.width;
//         const height = videoStream.height;

//         // Extract FPS (frame rate)
//         const rFrameRate = videoStream.r_frame_rate; // e.g., "25/1"
//         const parts = rFrameRate.split('/');
//         const fps = parseInt(parts[0]) / parseInt(parts[1]);

//         // Extract duration
//         const duration = metadata.format.duration;
//         const totalFrames = Math.floor(duration * fps);

//         const imageCache = {}; //image cache
//         const imageAnnots = annotations.filter(a => a.type === "image");
//         for (const a of imageAnnots) {
//           if (!imageCache[a.src]) {
//             imageCache[a.src] = await loadImage(a.src);
//           }
//         }

//         // Create canvas with video dimensions
//         const canvas = createCanvas(width, height);
//         const ctx = canvas.getContext('2d');

//         // --- Create frameStream here ---
//         const frameStream = new Readable({
//           read() {} // We'll push data manually
//         });

//         // --- Start ffmpeg process here ---
//         const ffmpegProcess = ffmpeg()
//           .input(frameStream)
//           .inputFormat('image2pipe')
//           .inputOptions('-framerate', `${fps}`)
//           .input(videoPath)
//           .complexFilter('[1:v][0:v] overlay=0:0')
//           .outputOptions([
//             '-c:v', 'libx264',
//             '-pix_fmt', 'yuv420p',
//             '-preset', 'fast',
//             '-crf', '23'
//           ])
//           .on('error', (err) => {
//             console.error('FFmpeg error:', err.message);
//             if (ffmpegProcess && ffmpegProcess.kill) {
//               ffmpegProcess.kill('SIGKILL');
//             }
//             reject(err)
//           })
//           .on('end', () => resolve())
//           .save(outputPath)
//           // .format('mp4')
//           // .pipe(uploadStream, { end: true });


//           let lastEmit = 0;

//         // Draw overlay frame PNGs
//         for (let i = 0; i < totalFrames; i++) {
//           const currentTime = i / fps;

//           // Clear canvas
//           ctx.clearRect(0, 0, width, height);

//           for (const a of annotations) {
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type=="rect") {
//                   ctx.save(); // Save the current state

//                   // Move the origin to the center of the rectangle
//                   ctx.translate(a.left, a.top);

//                   // Rotate (angle in radians)
//                   ctx.rotate(a.rotation * Math.PI / 180);

//                   if (a.fill) {
//                     ctx.fillStyle = a.fill;
//                     ctx.fillRect(0, 0, a.width, a.height);
//                   }

//                   ctx.strokeStyle = a.stroke;
//                   ctx.lineWidth = a.strokeWidth;

//                   // Draw rectangle centered at top left corner
//                   ctx.strokeRect(0,0, a.width, a.height);

//                   ctx.restore(); // Restore the state
//               }
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type=="circle") {
//                 ctx.strokeStyle = a.stroke;
//                 ctx.lineWidth = a.strokeWidth;

//                 // a.left = centerX, a.top = centerY, a.radius = radius
//                 ctx.beginPath();
//                 ctx.arc(a.left, a.top, a.radius, 0, 2 * Math.PI);

//                 if(a.fill){
//                   ctx.fillStyle=a.fill;
//                   ctx.fill();
//                 }

//                 ctx.stroke();
//               }
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type == "line") {
//                 ctx.strokeStyle = a.stroke;
//                 ctx.lineWidth = a.strokeWidth;
//                 ctx.beginPath();
//                 ctx.moveTo(a.points[0], a.points[1]);
//                 ctx.lineTo(a.points[2], a.points[3]);
//                 ctx.stroke();
//               }
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type == "text") {
//                 ctx.save();

//                 // Move to text position and apply rotation
//                 ctx.translate(a.left, a.top);
//                 ctx.rotate((a.rotation || 0) * Math.PI / 180);

//                 // Set font (e.g., "italic bold 42px Arial")
//                 const fontStyle = a.fontStyle || "";
//                 const fontSize = a.fontSize || 24;
//                 const fontFamily = a.fontFamily || "Arial";
//                 ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`.trim();

//                 // Set color
//                 ctx.fillStyle = a.fontColor || "#000000";

//                 // Multiline support
//                 const lines = (a.text || "").split('\n');
//                 const lineHeight = Math.round(fontSize * a.lineHeight);

//                 for (let i = 0; i < lines.length; i++) {
//                   const line = lines[i];
//                   // ctx.fillText(line, 0, i * lineHeight);
//                   const ascent =  fontSize;
//                   ctx.fillText(line, 0, i * lineHeight + ascent);


//                   // Underline if needed
//                   if (a.textDecoration === "underline") {
//                     const metrics = ctx.measureText(line);
//                     const underlineY = i * lineHeight + ascent + Math.max(4, fontSize / 6); // 4px below baseline
//                     ctx.beginPath();
//                     ctx.strokeStyle = a.fontColor || "#000000";
//                     ctx.lineWidth = Math.max(1, Math.floor(fontSize / 15));
//                     ctx.moveTo(0, underlineY);
//                     ctx.lineTo(metrics.width, underlineY);
//                     ctx.stroke();
//                   }
//                 }

//                 ctx.restore();
//               }
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type=="freedraw") {
//                 ctx.save();

//                  ctx.globalCompositeOperation = a.mode === "eraser" ? "destination-out" : "source-over";

//                 ctx.strokeStyle = a.stroke || "#df4b26";
//                 ctx.lineWidth = a.strokeWidth || 4;
//                 ctx.lineCap = "round";
//                 ctx.lineJoin = "round";
//                 drawSmoothCurve(ctx, a.points, a.tension || 0.5); // <-- yahan tension set kar sakte hain
//                 ctx.restore();
//               }
//               if (currentTime >= a.startTime && currentTime <= a.endTime && a.type === "image") {
//                 const img = imageCache[a.src];
//                 if (img) {
//                   ctx.save();
//                   ctx.translate(a.left, a.top);
//                   ctx.rotate((a.rotation || 0) * Math.PI / 180);
//                   ctx.drawImage(img, 0, 0, a.width, a.height);
//                   ctx.restore();
//                 }
//               }
//           };

//           const buffer = canvas.toBuffer('image/png');
//           frameStream.push(buffer);

//           if (i % 100 === 0 || i === totalFrames - 1) {
//             console.log(`Rendered frame ${i + 1} / ${totalFrames}`);
//           }

//           const percent = Math.floor(((i + 1) / totalFrames) * 100);
//           // if (socketId) {
//           //   io.to(socketId).emit("render-progress", { percent });
//           // }
//           const now = Date.now();
//           if (percent === 100 || now - lastEmit > 1000) { // हर 1s या 100% पर emit
//             io.to(socketId).emit("render-progress", { percent });
//             lastEmit = now;
//           }

//         }

//         frameStream.push(null); // Signal end of stream
        
//       });
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// export default render; 













// import path from "path";
// import { fileURLToPath } from "url";
// import { createCanvas,loadImage } from "canvas";
// import ffmpeg from "fluent-ffmpeg";
// import { Readable } from "stream";
// import {io} from "./sockets/socket.js"


// // ffmpeg.setFfmpegPath("C:/Users/kumar/Downloads/ffmpeg/ffmpeg.exe");
// // ffmpeg.setFfprobePath("C:/Users/kumar/Downloads/ffmpeg/ffprobe.exe");

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// //fre drawing with tention on node canvas
// function drawSmoothCurve(ctx, points, tension = 0.5) {
//   if (points.length < 4) {
//     // Kam points hain to seedha line bana do
//     ctx.beginPath();
//     ctx.moveTo(points[0], points[1]);
//     for (let i = 2; i < points.length; i += 2) {
//       ctx.lineTo(points[i], points[i + 1]);
//     }
//     ctx.stroke();
//     return;
//   }

//   // Helper: Catmull-Rom spline ke liye control points nikaalo
//   function getControlPoints(p0, p1, p2, p3, t) {
//     // p0, p1, p2, p3: [x, y] arrays
//     const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
//     const d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
//     const d3 = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);

//     const d1a = d1 === 0 ? 1 : d1;
//     const d2a = d2 === 0 ? 1 : d2;
//     const d3a = d3 === 0 ? 1 : d3;

//     const A = [
//       (p2[0] - p0[0]) / (d1a + d2a),
//       (p2[1] - p0[1]) / (d1a + d2a)
//     ];
//     const B = [
//       (p3[0] - p1[0]) / (d2a + d3a),
//       (p3[1] - p1[1]) / (d2a + d3a)
//     ];

//     const cp1 = [
//       p1[0] + A[0] * d1a * t,
//       p1[1] + A[1] * d1a * t
//     ];
//     const cp2 = [
//       p2[0] - B[0] * d2a * t,
//       p2[1] - B[1] * d2a * t
//     ];

//     return [cp1, cp2];
//   }

//   // Points ko [x, y] pairs me convert karo
//   const pts = [];
//   for (let i = 0; i < points.length; i += 2) {
//     pts.push([points[i], points[i + 1]]);
//   }

//   ctx.beginPath();
//   ctx.moveTo(pts[0][0], pts[0][1]);

//   for (let i = 1; i < pts.length - 2; i++) {
//     const [cp1, cp2] = getControlPoints(
//       pts[i - 1], pts[i], pts[i + 1], pts[i + 2], tension
//     );
//     ctx.bezierCurveTo(
//       cp1[0], cp1[1],
//       cp2[0], cp2[1],
//       pts[i + 1][0], pts[i + 1][1]
//     );
//   }

//   // Last segment ko line se close karo
//   ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
//   ctx.stroke();
// }

// function breakIntervalsWithAnnotations(annotations) {
//   // Sabhi unique time points collect karo (always include 0)
//   const points = new Set([0]);
//   for (const ann of annotations) {
//     points.add(ann.startTime);
//     points.add(ann.endTime);
//   }
//   const sorted = Array.from(points).sort((a, b) => a - b);

//   const result = [];
//   // Har interval ke liye active annotations dhoondo
//   for (let i = 0; i < sorted.length - 1; i++) {
//     const start = sorted[i];
//     const end = sorted[i + 1];
//     const active = [];
//     for (const ann of annotations) {
//       // Agar annotation is interval mein active hai
//       if (ann.startTime < end && ann.endTime > start) {
//         // startTime/endTime ko copy mein mat daalo
//         const {startTime, endTime, ...rest} = ann;
//         active.push(rest);
//       }
//     }
//     if (active.length > 0) {
//       result.push([start, end, ...active]);
//     } else {
//       result.push([start, end]);
//     }
//   }
//   return result;
// }


// async function render(videoPath, annotations, outputPath, socketId) {
//   return new Promise((resolve, reject) => {
//     try {
//     //     // Prepare temp frames folder
//     //   const tempDir = path.join(__dirname, 'temp');
//     //   if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

//     //   // Clear old temp frames
//     //   fs.readdirSync(tempDir).forEach(f => fs.unlinkSync(path.join(tempDir, f)));

//       // Get video info (dimensions and fps) using ffprobe
//       ffmpeg.ffprobe(videoPath, async (err, metadata) => {  //yahan change kiya sync krdiya
//         if (err) return reject(err);

//         // Find the video stream
//         const videoStream = metadata.streams.find(
//           s => s.codec_type === 'video' && s.width && s.height
//         );
//         if (!videoStream) return reject(new Error('No video stream found'));

//         // Extract width and height
//         const width = videoStream.width;
//         const height = videoStream.height;

//         // Extract FPS (frame rate)
//         const rFrameRate = videoStream.r_frame_rate; // e.g., "25/1"
//         const parts = rFrameRate.split('/');
//         const fps = parseInt(parts[0]) / parseInt(parts[1]);

//         // Extract duration
//         const duration = metadata.format.duration;
//         const totalFrames = Math.floor(duration * fps);

//         const imageCache = {}; //image cache
//         const imageAnnots = annotations.filter(a => a.type === "image");
//         for (const a of imageAnnots) {
//           if (!imageCache[a.src]) {
//             imageCache[a.src] = await loadImage(a.src);
//           }
//         }

//         // Create canvas with video dimensions
//         const canvas = createCanvas(width, height);
//         const ctx = canvas.getContext('2d');

//         // --- Create frameStream here ---
//         const frameStream = new Readable({
//           read() {} // We'll push data manually
//         });

//         // --- Start ffmpeg process here ---
//         const ffmpegProcess = ffmpeg()
//           .input(frameStream)
//           .inputFormat('image2pipe')
//           .inputOptions('-framerate', `${fps}`)
//           .input(videoPath)
//           .complexFilter('[1:v][0:v] overlay=0:0')
//           .outputOptions([
//             '-c:v', 'libx264',
//             '-pix_fmt', 'yuv420p',
//             '-preset', 'fast',
//             '-crf', '23'
//           ])
//           .on('error', (err) => {
//             console.error('FFmpeg error:', err.message);
//             if (ffmpegProcess && ffmpegProcess.kill) {
//               ffmpegProcess.kill('SIGKILL');
//             }
//             reject(err)
//           })
//           .on('end', () => resolve())
//           .save(outputPath)
//           // .format('mp4')
//           // .pipe(uploadStream, { end: true });


//           let lastEmit = 0;
//           let compfra=0;

//         // Draw overlay frame PNGs
//         // for (let i = 0; i < totalFrames; i++) {
//         //   const currentTime = i / fps;

//         //   // Clear canvas
//         //   ctx.clearRect(0, 0, width, height);

//         //   for (const a of annotations) {
//         //       if (currentTime >= a.startTime && currentTime <= a.endTime && a.type=="rect") {
//         //           ctx.save(); // Save the current state

//         //           // Move the origin to the center of the rectangle
//         //           ctx.translate(a.left, a.top);

//         //           // Rotate (angle in radians)
//         //           ctx.rotate(a.rotation * Math.PI / 180);

//         //           if (a.fill) {
//         //             ctx.fillStyle = a.fill;
//         //             ctx.fillRect(0, 0, a.width, a.height);
//         //           }

//         //           ctx.strokeStyle = a.stroke;
//         //           ctx.lineWidth = a.strokeWidth;

//         //           // Draw rectangle centered at top left corner
//         //           ctx.strokeRect(0,0, a.width, a.height);

//         //           ctx.restore(); // Restore the state
//         //       }
//         //       if (currentTime >= a.startTime && currentTime <= a.endTime && a.type=="circle") {
//         //         ctx.strokeStyle = a.stroke;
//         //         ctx.lineWidth = a.strokeWidth;

//         //         // a.left = centerX, a.top = centerY, a.radius = radius
//         //         ctx.beginPath();
//         //         ctx.arc(a.left, a.top, a.radius, 0, 2 * Math.PI);

//         //         if(a.fill){
//         //           ctx.fillStyle=a.fill;
//         //           ctx.fill();
//         //         }

//         //         ctx.stroke();
//         //       }
//         //       if (currentTime >= a.startTime && currentTime <= a.endTime && a.type == "line") {
//         //         ctx.strokeStyle = a.stroke;
//         //         ctx.lineWidth = a.strokeWidth;
//         //         ctx.beginPath();
//         //         ctx.moveTo(a.points[0], a.points[1]);
//         //         ctx.lineTo(a.points[2], a.points[3]);
//         //         ctx.stroke();
//         //       }
//         //       if (currentTime >= a.startTime && currentTime <= a.endTime && a.type == "text") {
//         //         ctx.save();

//         //         // Move to text position and apply rotation
//         //         ctx.translate(a.left, a.top);
//         //         ctx.rotate((a.rotation || 0) * Math.PI / 180);

//         //         // Set font (e.g., "italic bold 42px Arial")
//         //         const fontStyle = a.fontStyle || "";
//         //         const fontSize = a.fontSize || 24;
//         //         const fontFamily = a.fontFamily || "Arial";
//         //         ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`.trim();

//         //         // Set color
//         //         ctx.fillStyle = a.fontColor || "#000000";

//         //         // Multiline support
//         //         const lines = (a.text || "").split('\n');
//         //         const lineHeight = Math.round(fontSize * a.lineHeight);

//         //         for (let i = 0; i < lines.length; i++) {
//         //           const line = lines[i];
//         //           // ctx.fillText(line, 0, i * lineHeight);
//         //           const ascent =  fontSize;
//         //           ctx.fillText(line, 0, i * lineHeight + ascent);


//         //           // Underline if needed
//         //           if (a.textDecoration === "underline") {
//         //             const metrics = ctx.measureText(line);
//         //             const underlineY = i * lineHeight + ascent + Math.max(4, fontSize / 6); // 4px below baseline
//         //             ctx.beginPath();
//         //             ctx.strokeStyle = a.fontColor || "#000000";
//         //             ctx.lineWidth = Math.max(1, Math.floor(fontSize / 15));
//         //             ctx.moveTo(0, underlineY);
//         //             ctx.lineTo(metrics.width, underlineY);
//         //             ctx.stroke();
//         //           }
//         //         }

//         //         ctx.restore();
//         //       }
//         //       if (currentTime >= a.startTime && currentTime <= a.endTime && a.type=="freedraw") {
//         //         ctx.save();

//         //          ctx.globalCompositeOperation = a.mode === "eraser" ? "destination-out" : "source-over";

//         //         ctx.strokeStyle = a.stroke || "#df4b26";
//         //         ctx.lineWidth = a.strokeWidth || 4;
//         //         ctx.lineCap = "round";
//         //         ctx.lineJoin = "round";
//         //         drawSmoothCurve(ctx, a.points, a.tension || 0.5); // <-- yahan tension set kar sakte hain
//         //         ctx.restore();
//         //       }
//         //       if (currentTime >= a.startTime && currentTime <= a.endTime && a.type === "image") {
//         //         const img = imageCache[a.src];
//         //         if (img) {
//         //           ctx.save();
//         //           ctx.translate(a.left, a.top);
//         //           ctx.rotate((a.rotation || 0) * Math.PI / 180);
//         //           ctx.drawImage(img, 0, 0, a.width, a.height);
//         //           ctx.restore();
//         //         }
//         //       }
//         //   };

//         //   const buffer = canvas.toBuffer('image/png');
//         //   frameStream.push(buffer);

//         //   if (i % 100 === 0 || i === totalFrames - 1) {
//         //     console.log(`Rendered frame ${i + 1} / ${totalFrames}`);
//         //   }

//         //   const percent = Math.floor(((i + 1) / totalFrames) * 100);
//         //   // if (socketId) {
//         //   //   io.to(socketId).emit("render-progress", { percent });
//         //   // }
//         //   const now = Date.now();
//         //   if (percent === 100 || now - lastEmit > 1000) { // हर 1s या 100% पर emit
//         //     io.to(socketId).emit("render-progress", { percent });
//         //     lastEmit = now;
//         //   }

//         // }

//         const intervalsWithAnnotations=breakIntervalsWithAnnotations(annotations);

//         for (const interval of intervalsWithAnnotations) {
//             const [start, end, ...activeAnnotations] = interval;
//             const frameCount = Math.round((end - start) * fps);

//             // Clear and redraw using activeAnnotations
//             ctx.clearRect(0, 0, width, height);

//             for (const a of activeAnnotations) {
//               if (a.type=="rect") {
//                   ctx.save(); // Save the current state

//                   // Move the origin to the center of the rectangle
//                   ctx.translate(a.left, a.top);

//                   // Rotate (angle in radians)
//                   ctx.rotate(a.rotation * Math.PI / 180);

//                   if (a.fill) {
//                     ctx.fillStyle = a.fill;
//                     ctx.fillRect(0, 0, a.width, a.height);
//                   }

//                   ctx.strokeStyle = a.stroke;
//                   ctx.lineWidth = a.strokeWidth;

//                   // Draw rectangle centered at top left corner
//                   ctx.strokeRect(0,0, a.width, a.height);

//                   ctx.restore(); // Restore the state
//               }
//               if (a.type=="circle") {
//                 ctx.strokeStyle = a.stroke;
//                 ctx.lineWidth = a.strokeWidth;

//                 // a.left = centerX, a.top = centerY, a.radius = radius
//                 ctx.beginPath();
//                 ctx.arc(a.left, a.top, a.radius, 0, 2 * Math.PI);

//                 if(a.fill){
//                   ctx.fillStyle=a.fill;
//                   ctx.fill();
//                 }

//                 ctx.stroke();
//               }
//               if (a.type == "line") {
//                 ctx.strokeStyle = a.stroke;
//                 ctx.lineWidth = a.strokeWidth;
//                 ctx.beginPath();
//                 ctx.moveTo(a.points[0], a.points[1]);
//                 ctx.lineTo(a.points[2], a.points[3]);
//                 ctx.stroke();
//               }
//               if (a.type == "text") {
//                 ctx.save();

//                 // Move to text position and apply rotation
//                 ctx.translate(a.left, a.top);
//                 ctx.rotate((a.rotation || 0) * Math.PI / 180);

//                 // Set font (e.g., "italic bold 42px Arial")
//                 const fontStyle = a.fontStyle || "";
//                 const fontSize = a.fontSize || 24;
//                 const fontFamily = a.fontFamily || "Arial";
//                 ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`.trim();

//                 // Set color
//                 ctx.fillStyle = a.fontColor || "#000000";

//                 // Multiline support
//                 const lines = (a.text || "").split('\n');
//                 const lineHeight = Math.round(fontSize * a.lineHeight);

//                 for (let i = 0; i < lines.length; i++) {
//                   const line = lines[i];
//                   // ctx.fillText(line, 0, i * lineHeight);
//                   const ascent =  fontSize;
//                   ctx.fillText(line, 0, i * lineHeight + ascent);


//                   // Underline if needed
//                   if (a.textDecoration === "underline") {
//                     const metrics = ctx.measureText(line);
//                     const underlineY = i * lineHeight + ascent + Math.max(4, fontSize / 6); // 4px below baseline
//                     ctx.beginPath();
//                     ctx.strokeStyle = a.fontColor || "#000000";
//                     ctx.lineWidth = Math.max(1, Math.floor(fontSize / 15));
//                     ctx.moveTo(0, underlineY);
//                     ctx.lineTo(metrics.width, underlineY);
//                     ctx.stroke();
//                   }
//                 }

//                 ctx.restore();
//               }
//               if (a.type=="freedraw") {
//                 ctx.save();

//                  ctx.globalCompositeOperation = a.mode === "eraser" ? "destination-out" : "source-over";

//                 ctx.strokeStyle = a.stroke || "#df4b26";
//                 ctx.lineWidth = a.strokeWidth || 4;
//                 ctx.lineCap = "round";
//                 ctx.lineJoin = "round";
//                 drawSmoothCurve(ctx, a.points, a.tension || 0.5); // <-- yahan tension set kar sakte hain
//                 ctx.restore();
//               }
//               if (a.type === "image") {
//                 const img = imageCache[a.src];
//                 if (img) {
//                   ctx.save();
//                   ctx.translate(a.left, a.top);
//                   ctx.rotate((a.rotation || 0) * Math.PI / 180);
//                   ctx.drawImage(img, 0, 0, a.width, a.height);
//                   ctx.restore();
//                 }
//               }                
//             }

//             const buffer = canvas.toBuffer('image/png');

//             // Push the same buffer for every frame in this interval
//             for (let f = 0; f < frameCount; f++) {
//                 frameStream.push(buffer);
//                 // Optionally emit progress, e.g.
//                 // percent = Math.floor((currentFrameIdx + 1) / totalFrames * 100);
//             }

//             compfra++;
//             console.log(`Rendered frame ${compfra}`);
//         }

//         frameStream.push(null); // Signal end of stream
        
//       });
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// export default render; 
















import path from "path";
import { fileURLToPath } from "url";
import { createCanvas,loadImage } from "canvas";
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import {io} from "./sockets/socket.js"
import fs from 'fs';


// ffmpeg.setFfmpegPath("C:/Users/kumar/Downloads/ffmpeg/ffmpeg.exe");
// ffmpeg.setFfprobePath("C:/Users/kumar/Downloads/ffmpeg/ffprobe.exe");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//fre drawing with tention on node canvas
function drawSmoothCurve(ctx, points, tension = 0.5) {
  if (points.length < 4) {
    // Kam points hain to seedha line bana do
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i], points[i + 1]);
    }
    ctx.stroke();
    return;
  }

  // Helper: Catmull-Rom spline ke liye control points nikaalo
  function getControlPoints(p0, p1, p2, p3, t) {
    // p0, p1, p2, p3: [x, y] arrays
    const d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const d3 = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);

    const d1a = d1 === 0 ? 1 : d1;
    const d2a = d2 === 0 ? 1 : d2;
    const d3a = d3 === 0 ? 1 : d3;

    const A = [
      (p2[0] - p0[0]) / (d1a + d2a),
      (p2[1] - p0[1]) / (d1a + d2a)
    ];
    const B = [
      (p3[0] - p1[0]) / (d2a + d3a),
      (p3[1] - p1[1]) / (d2a + d3a)
    ];

    const cp1 = [
      p1[0] + A[0] * d1a * t,
      p1[1] + A[1] * d1a * t
    ];
    const cp2 = [
      p2[0] - B[0] * d2a * t,
      p2[1] - B[1] * d2a * t
    ];

    return [cp1, cp2];
  }

  // Points ko [x, y] pairs me convert karo
  const pts = [];
  for (let i = 0; i < points.length; i += 2) {
    pts.push([points[i], points[i + 1]]);
  }

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);

  for (let i = 1; i < pts.length - 2; i++) {
    const [cp1, cp2] = getControlPoints(
      pts[i - 1], pts[i], pts[i + 1], pts[i + 2], tension
    );
    ctx.bezierCurveTo(
      cp1[0], cp1[1],
      cp2[0], cp2[1],
      pts[i + 1][0], pts[i + 1][1]
    );
  }

  // Last segment ko line se close karo
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
  ctx.stroke();
}

function breakIntervalsWithAnnotations(annotations) {
  // Sabhi unique time points collect karo (always include 0)
  const points = new Set([0]);
  for (const ann of annotations) {
    points.add(ann.startTime);
    points.add(ann.endTime);
  }
  const sorted = Array.from(points).sort((a, b) => a - b);

  const result = [];
  // Har interval ke liye active annotations dhoondo
  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    const active = [];
    for (const ann of annotations) {
      // Agar annotation is interval mein active hai
      if (ann.startTime < end && ann.endTime > start) {
        // startTime/endTime ko copy mein mat daalo
        const {startTime, endTime, ...rest} = ann;
        active.push(rest);
      }
    }
    if (active.length > 0) {
      result.push([start, end, ...active]);
    } else {
      result.push([start, end]);
    }
  }
  return result;
}


async function render(videoPath, annotations, outputPath, socketId) {
  return new Promise((resolve, reject) => {
    try {
        // Prepare temp frames folder
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      // Clear old temp frames
      fs.readdirSync(tempDir).forEach(f => fs.unlinkSync(path.join(tempDir, f)));

      // Get video info (dimensions and fps) using ffprobe
      ffmpeg.ffprobe(videoPath, async (err, metadata) => {  //yahan change kiya sync krdiya
        if (err) return reject(err);

        // Find the video stream
        const videoStream = metadata.streams.find(
          s => s.codec_type === 'video' && s.width && s.height
        );
        if (!videoStream) return reject(new Error('No video stream found'));

        // Extract width and height
        const width = videoStream.width;
        const height = videoStream.height;

        // Extract FPS (frame rate)
        const rFrameRate = videoStream.r_frame_rate; // e.g., "25/1"
        const parts = rFrameRate.split('/');
        const fps = parseInt(parts[0]) / parseInt(parts[1]);

        // Extract duration
        const duration = metadata.format.duration;
        const totalFrames = Math.floor(duration * fps);

        const imageCache = {}; //image cache
        const imageAnnots = annotations.filter(a => a.type === "image");
        for (const a of imageAnnots) {
          if (!imageCache[a.src]) {
            imageCache[a.src] = await loadImage(a.src);
          }
        }

        // Create canvas with video dimensions
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        let i=0;
        const intervalsWithAnnotations=breakIntervalsWithAnnotations(annotations);
        let overlays=[];

        for (const interval of intervalsWithAnnotations) {
            const [start, end, ...activeAnnotations] = interval;
            const frameCount = Math.round((end - start) * fps);

            // Clear and redraw using activeAnnotations
            ctx.clearRect(0, 0, width, height);

            for (const a of activeAnnotations) {
              if (a.type=="rect") {
                  ctx.save(); // Save the current state

                  // Move the origin to the center of the rectangle
                  ctx.translate(a.left, a.top);

                  // Rotate (angle in radians)
                  ctx.rotate(a.rotation * Math.PI / 180);

                  if (a.fill) {
                    ctx.fillStyle = a.fill;
                    ctx.fillRect(0, 0, a.width, a.height);
                  }

                  ctx.strokeStyle = a.stroke;
                  ctx.lineWidth = a.strokeWidth;

                  // Draw rectangle centered at top left corner
                  ctx.strokeRect(0,0, a.width, a.height);

                  ctx.restore(); // Restore the state
              }
              if (a.type=="circle") {
                ctx.strokeStyle = a.stroke;
                ctx.lineWidth = a.strokeWidth;

                // a.left = centerX, a.top = centerY, a.radius = radius
                ctx.beginPath();
                ctx.arc(a.left, a.top, a.radius, 0, 2 * Math.PI);

                if(a.fill){
                  ctx.fillStyle=a.fill;
                  ctx.fill();
                }

                ctx.stroke();
              }
              if (a.type == "line") {
                ctx.strokeStyle = a.stroke;
                ctx.lineWidth = a.strokeWidth;
                ctx.beginPath();
                ctx.moveTo(a.points[0], a.points[1]);
                ctx.lineTo(a.points[2], a.points[3]);
                ctx.stroke();
              }
              if (a.type == "text") {
                ctx.save();

                // Move to text position and apply rotation
                ctx.translate(a.left, a.top);
                ctx.rotate((a.rotation || 0) * Math.PI / 180);

                // Set font (e.g., "italic bold 42px Arial")
                const fontStyle = a.fontStyle || "";
                const fontSize = a.fontSize || 24;
                const fontFamily = a.fontFamily || "Arial";
                ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`.trim();

                // Set color
                ctx.fillStyle = a.fontColor || "#000000";

                // Multiline support
                const lines = (a.text || "").split('\n');
                const lineHeight = Math.round(fontSize * a.lineHeight);

                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i];
                  // ctx.fillText(line, 0, i * lineHeight);
                  const ascent =  fontSize;
                  ctx.fillText(line, 0, i * lineHeight + ascent);


                  // Underline if needed
                  if (a.textDecoration === "underline") {
                    const metrics = ctx.measureText(line);
                    const underlineY = i * lineHeight + ascent + Math.max(4, fontSize / 6); // 4px below baseline
                    ctx.beginPath();
                    ctx.strokeStyle = a.fontColor || "#000000";
                    ctx.lineWidth = Math.max(1, Math.floor(fontSize / 15));
                    ctx.moveTo(0, underlineY);
                    ctx.lineTo(metrics.width, underlineY);
                    ctx.stroke();
                  }
                }

                ctx.restore();
              }
              if (a.type=="freedraw") {
                ctx.save();

                 ctx.globalCompositeOperation = a.mode === "eraser" ? "destination-out" : "source-over";

                ctx.strokeStyle = a.stroke || "#df4b26";
                ctx.lineWidth = a.strokeWidth || 4;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                drawSmoothCurve(ctx, a.points, a.tension || 0.5); // <-- yahan tension set kar sakte hain
                ctx.restore();
              }
              if (a.type === "image") {
                const img = imageCache[a.src];
                if (img) {
                  ctx.save();
                  ctx.translate(a.left, a.top);
                  ctx.rotate((a.rotation || 0) * Math.PI / 180);
                  ctx.drawImage(img, 0, 0, a.width, a.height);
                  ctx.restore();
                }
              }                
            }

            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(path.join(tempDir, `frame_${i}.png`), buffer);

            overlays.push({image:path.join(tempDir,`frame_${i}.png`), start:start,end:end});

            i++;
            console.log(`Rendered frame ${i}`);
        }

        let command = ffmpeg(videoPath);
        overlays.forEach(ol => {
          command = command.input(ol.image);
        });

        let filter = '';
        for (let i = 0; i < overlays.length; i++) {
          const ol = overlays[i];
          const inLabel = i === 0 ? '[0:v]' : `[tmp${i}]`;
          const outLabel = `[tmp${i + 1}]`;
          filter += `${inLabel}[${i + 1}:v] overlay=0:0:enable='between(t,${ol.start},${ol.end})'${i === overlays.length - 1 ? '' : ` ${outLabel};`}`;
        }

        command
          .complexFilter(filter)
          .outputOptions(['-c:v', 'libx264', '-pix_fmt', 'yuv420p'])
          .on('error', err => reject(err))
          .on('end', () => {
            fs.readdirSync(tempDir).forEach(f => fs.unlinkSync(path.join(tempDir, f)));
            resolve();
          })
          .save(outputPath);
        
      });
    } catch (error) {
      reject(error);
    }
  });
}

export default render; 
