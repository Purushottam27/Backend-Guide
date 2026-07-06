class ApiError extends Error{
    constructor(statusCode,message='Something went wrong',errors = [],statck = ''){
        super(message);
        this.statusCode = statusCode
        this.message = message
        this.errors = errors
        this.data = null
        this.success = false

        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this,this.constructor) // these will tell us in which file , which function, which line the error is occurred which help in debugging.
        }
    }
}

export {ApiError}

// use case:
/*
if(!user){
    throw new ApiError(404,"user not found",["Emai not found","password incorrect"])
}
*/