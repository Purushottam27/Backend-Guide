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
