// There are two method to handle the async handler: They use higher order funciton means: A function that takes another function as an argument or returns a function.
// 1. Promise method which is mostly used:

// const asyncHandler = (requestHandler) => {  // here requestHandler is a controller function like handleLogin 
//     return (req,res,next) =>{  // returning the middleware function  
//         Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err)) 
//     }
// }

// 2. By using async await and try & catch method: In modern project these method is preferred

const asyncHandler = (requestHandler)=> {
    return async (req,res,next)=>{   
        // returning the middleware function  and using it inside post/get reqs requesthandler(handleLogin) so we donot have to write multiple times try and catch to handle error
        try {
            await requestHandler(req,res,next) 
        } catch (err) {
            // next(err)
            res.status(err.code || 500).json({   // these we use as the global error middleware 
                success:false,
                message:err.message
            })
            
        }
    }
}

export {asyncHandler}