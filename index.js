const express = require('express')
var bodyParser = require('body-parser')
require('dotenv').config()
const cors = require('cors');

const app = express()



const corsOptions = {
  origin: ['http://localhost:5173', 'https:/haemoshare.vercel.app', 'https://oliveclear.com'], // Allowed origins
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200 // To handle legacy browsers
};

app.use(cors(corsOptions));

// Handle Preflight Requests for all routes
app.options('*', cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.get('origin')); // Dynamically allow the current origin if it is listed
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  next();
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// app.use(cors());
const donorRoutes = require('./components/donor-registeration')
const loginRoute = require('./components/Authentication/login')
const signupRoute = require('./components/Authentication/register')
const AdminDonorRoute = require('./components/Admin/donor-view')

app.use('/api', donorRoutes, loginRoute, signupRoute, AdminDonorRoute)


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
