import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// first we configure the cloudinary, then we use async method to upload the file which we already saved locally on our server, if any error occurred while uploading then remove the file.
// These is the code that we can use in very project if we need to handle the images and the videos.

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async function(localFilePath){
    try {
        if(!localFilePath) return null

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })

        console.log("File is uploaded on cloudinary ",response.url); // form reponse we get the public url which we can give to user to access the images.

        // fs.unlink(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation failed
        return null

        // if(fs.existsSync(localFilePath)){
        //     fs.unlinkSync(localFilePath);
        // }
    }
}

export {uploadOnCloudinary}

// (async function() {

//     // Configuration
    
    
//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();