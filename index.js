const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "user.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(express.json());

app.use(cors());

let db = null;
const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(process.env.PORT || 3001, () => {
      console.log("Server Running Successfully at localhost://3001");
    });
  } catch (e) {
    console.log(`${e.message}`);
    process.exit(1);
  }
};
initialiseDbAndServer();

app.get("/user", async (request, response) => {
  const getUserQuery = `SELECT * FROM user WHERE name = "kishore";`;
  const userDetails = await db.get(getUserQuery);
  response.send(userDetails);
});

app.post("/login", async (request, response) => {
  console.log(request.body);
  const { email, password } = request.body;

  const userQuery = `SELECT * FROM user WHERE email='${email}';`;

  const dbUser = await db.get(userQuery);
  console.log(dbUser);

  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    if (password === dbUser.password) {
      console.log("password user");
      if (password.length < 8) {
        console.log("hey");
        response.send("Password length must be 8 characters");
      } else {
        console.log("password also matched");
        const payLoad = {
          email: email,
        };
        const jwtToken = jwt.sign(payLoad, "secret_token");
        console.log(jwtToken);
        response.status(200);
        response.send({ jwtToken });
      }
    } else {
      response.send("Invalid Password");
    }
  }
});

module.exports = app;
