import { useimageurlContext } from "../Context/imageurlContext";

const useImageFileupload = () => {
  const { setImageurl } = useimageurlContext();

  const uploadimagefile = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file); // 'file' field name Cloudinary के लिए 'file' होना चाहिए
    formData.append('upload_preset', 'Annotation'); // यहाँ अपना unsigned upload preset डालें
    formData.append('tags', 'preset-Annotation'); // addition

    // Cloudinary का endpoint (image के लिए)
    const url = "https://api.cloudinary.com/v1_1/dw6w4c618/image/upload";

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
          setImageurl(data.secure_url); // Cloudinary image URL context में save
          resolve(data);
        } else {
          reject(new Error("Cloudinary image upload failed"));
        }
      };

      xhr.onerror = function() {
        reject(new Error("Network error"));
      };

      xhr.send(formData);
    });
  };

  return { uploadimagefile };
};

export default useImageFileupload;
