// EXPRESS
const express = require('express');

// MONGOOSE
const mongoose = require('mongoose');

require('dotenv').config();
const app = express();                                                       // Create Server
app.use(express.json());
const port = process.env.PORT;                                               // Create Port

// ROUTES
const userRoute = require('./src/routes/user.route');
app.use('/api', userRoute);

// DATABASE CONNECTION
app.listen( port , async () => {
     mongoose.connect(process.env.MONGO_DB_URL)                             // Online Database
    .then(() => console.log("DB is Connected..."))
    .catch(err => console.log(err.message));
    console.log(`Server start at http://localhost:${port}`);
});