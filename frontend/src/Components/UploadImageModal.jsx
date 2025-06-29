import useImageFileupload from '../hooks/useImageFileUpload';
import { LuImageUp } from "react-icons/lu";



const UploadImageModal = () => {

  const {uploadimagefile} = useImageFileupload();

  const handleFileChange = async (e) => {
    await uploadimagefile(e.target.files[0]);
  }


  return (
    <>
        <label
          className="flex items-center gap-2 relative group cursor-pointer"
        >
          <LuImageUp color='white' size={30}/>
          <span className="
            absolute left-1/2 -translate-x-1/2 bottom-full mb-2
            opacity-0 group-hover:opacity-100
            bg-white text-blue-300 text-xs rounded px-2 py-1
            transition-opacity duration-200 whitespace-nowrap
            pointer-events-none z-10
          ">
            Upload Image
          </span>
          <input
            id="json-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
    </>
  )
}

export default UploadImageModal
