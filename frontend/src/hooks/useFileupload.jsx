import { usevideourlContext } from "../Context/videourlContext";

const useFileupload = () => {
  const { setvideourl } = usevideourlContext();

  const uploadfile = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file); // 'file' field name देना है
    formData.append('upload_preset', 'Annotation'); // Cloudinary में बनाया हुआ unsigned preset
    formData.append('tags', 'preset-Annotation'); //addition

    // Cloudinary का endpoint
    const url = "https://api.cloudinary.com/v1_1/dw6w4c618/video/upload";

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      xhr.upload.onprogress = function(event) {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent); // progress callback
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setvideourl(data.secure_url); // या data.url
          resolve(data);
        } else {
          reject(new Error("Cloudinary upload failed"));
        }
      };

      xhr.onerror = function() {
        reject(new Error("Network error"));
      };

      xhr.send(formData);
    });
  };

  return { uploadfile };
};

export default useFileupload;
