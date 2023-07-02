const express = require("express")
// import path from 'path'
const cors = require("cors")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const path = require('path');

const userRoute = require("./app/routes/users.router.js")


const app = express();

const corsOptions = {};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome." });
});



// Add routes here.
app.use("/user", userRoute)


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});