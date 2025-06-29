import React, { useState } from 'react';
import { LuClipboardPaste } from "react-icons/lu";
import { useimageurlContext } from '../Context/imageurlContext';

const ImageURLModal = () => {
  const [url, seturl] = useState("");
  const [error, setError] = useState("");
  const { setImageurl } = useimageurlContext();

  const handleURLChange = (event) => {
    seturl(event.target.value);
    setError(""); // Reset error on input change
  };

  // Function to validate image URL
  const validateImageURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => reject(false);
      img.src = url;
    });
  };

  const handlePasteImage = async () => {
    setError("");
    try {
      await validateImageURL(url);
      setImageurl(url); // Only set if image is valid
      seturl("");
      const modal = document.getElementById('my_modal_2');
      if (modal) modal.close();
    } catch {
      seturl("");
      setError("Invalid image URL. Please enter a valid image link.");
    }
  };

  return (
    <>
      <button className="relative group cursor-pointer" onClick={() => document.getElementById('my_modal_2').showModal()}>
        <LuClipboardPaste color='white' size={30} />
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-white text-blue-300 text-xs rounded px-2 py-1 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
          Paste Image URL
        </span>
      </button>

      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <input
            className='w-full border-2 border-blue-300 rounded-xl p-2 text-blue-300 focus:border-blue-400 focus:outline-none'
            type='text'
            value={url}
            onChange={handleURLChange}
            placeholder="Paste source"
          />
          {error && <div className="text-red-500 text-xs mt-2 text-center">{error}</div>}
          <div className='w-full flex justify-center mt-10'>
            <button
              disabled={url === ""}
              onClick={handlePasteImage}
              className="btn bg-blue-300 text-white font-sans"
            >
              Paste Image
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default ImageURLModal;
