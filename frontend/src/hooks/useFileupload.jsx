import { usevideourlContext } from "../Context/videourlContext";


const useFileupload = () => {

    const {setvideourl}=usevideourlContext()
  
    const uploadfile= async (file)=>{

        const formData = new FormData();
        formData.append('video', file);

    try{

        const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("Upload result:", data.url);

        if(data.error){
            throw new Error(data.error);
        }

        setvideourl(data.url);

    } 
    catch(error){
        console.log(error.message)
    }
  }

  return {uploadfile}
}


export default useFileupload
