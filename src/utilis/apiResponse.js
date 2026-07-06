class ApiResponse {
    constructor(statusCode,data,message='success'){
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.success = statusCode < 400 // basically true he hoga
    }
}

export {ApiResponse}

/*
return res.json(
    new ApiResponse(200, user, "user fetched successfully")
)
 */