# Project setup
1. npm init
2. Initialize the git and create the repo
3. Create the .gitignore(use the site gitignore generator to generate its code) , .env files and src , public folders
4. Then create the main files inside the src folder either by gitbash/linux cmd "touch file1 file2 " or directly from explorer which are:
    index.js -> file which is a application entry point. It initializes environment variables, connects to the database, and starts the Express server.
    app.js -> Initializes the Express application, registers middleware, routes, and global error handlers.
    constants.js -> Stores reusable project-wide constants to avoid hardcoding values.
5. Install the dev dependencies with npm i -D 'name'  like nodemon, prettier and eslint and the production dependencies: npm i express mongoose dotenv bcrypt jsonwebtoken cookie-parser cors
6. Then modify the package.json file -> type:module, in script dev:nodemon src/index.js
7. Then create the foldes inside the src either by gitbash/linux cmd "mkdir controllers middlewares routes models db utilis" or create directly from explorer.
8. Then create the .prettierrc and prettierignore files and after dicussing with the teammates decide the .prettierrc file code which is used for formatting and reduce the conflict errors.

# Project Structure
Project
│
├── node_modules/
├── public/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middlewares/
│   ├── db/
│   ├── utils/
│   ├── services/
│   ├── constants.js
│   ├── app.js
│   └── index.js
│
├── .env
├── .gitignore
├── .prettierrc
├── .prettierignore
├── package.json
└── README.md

# Database Connection:
1. Now connect the database in a professional way with error handling, also handle the dotenv config as it was not imported with the import syntax but to do so we have updated our package.json in script.
2. By using the modular programming seprate out the works in diffent files like handle the database url connection in the connection.js file inside db folder, and call the connection function in the main index.js file by using .then and .catch if connection is successful inside .then start the server by app.listen()
3. One more thing is write all the sensitive info inside the .env file like mongoDB uri, port(if you want), CORS_ORIGIN etc..

# Express and some middlewares setup:
1. All the express work is been handled inside the app.js file where we imported the express and used the express methods as app = express() and then we can use its properties and methods easily.
2. Now we also need some packages cookie-parser and the cors which help in parsing the cookies and handle external req on the server respectively.
3. First of all middleware is simply a function that runs between the client's request and the final route handler
4. Here we used some build in middlewares to handle the data like: express.json(), express.urlencoded(), and also third party middlewares like express.cors(), express.cookieParser(). 

# Error and Response Handling Helper functions:
1. We have created a asyncHandler.js helper file beacuse without it we have to write try and catch in every controller function but in asyncHandler we have to handle it single time and we can use it in multiple controllers.
2. Then we created apiError.js file which actually handles the errors by extending the JS Error module and overwrite it which our custom errors so that we can easily handle them.
3. Then we created apiResponse.js file which handles how we send the response to the user in a structured way.

# Models and Schema:
1. First think is to keep in mind that think practically what are the fields do really exist for that particular model and also think that does it is a string, number or array type and to which the field is linked.
2. Also in the things like hashing the password , verifing it , generating the access and the refresh token through JWT is been done inside the user model itself by using the hooks pre(save) and method respectively.
3. Also if we think that there is a need of pagination in any model then use -> mongoose-aggregate-paginate-v2 package as a plugin which help us to automatically handle the pagination.
