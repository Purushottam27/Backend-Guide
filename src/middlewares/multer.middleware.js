import multer from 'multer'

// code taken from the multer documentation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp") // root folder me hainisliye single . not ..
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, file.originalname + '-' + uniqueSuffix) // to give uique file name
  }
})

const upload = multer(
    { 
        storage,
        // limits: {
        //     fileSize: 10*1024*1024 // 10 MB
        // }
        // multer also gives as the option to include the file filter function from which we can restrict the uploades of specific file formate.
    }
)

export {upload} 