import { useimageurlContext } from "../Context/imageurlContext";



const useImageFileupload = () => {

    const {setImageurl}=useimageurlContext();
  
    const uploadimagefile= async (file)=>{

        const formData = new FormData();
        formData.append('image', file);

    try{

        const response = await fetch("http://localhost:5000/upload/image", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("Upload result:", data.url);

        if(data.error){
            throw new Error(data.error);
        }

        setImageurl(data.url);

    } 
    catch(error){
        console.log(error.message)
    }
  }

  return {uploadimagefile}
}


export default useImageFileupload