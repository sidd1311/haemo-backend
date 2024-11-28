const express = require('express')
var app = express()
const bcrypt = require('bcrypt');
const router = express.Router()
const { MongoClient } = require('mongodb');
var cookieParser = require('cookie-parser')
const http = require('http');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken')
app.use(cookieParser())

require('dotenv').config();
const url = process.env.MONGO_URL
const client = new MongoClient(url);
const dbName = 'HaemoShare-Blood';

router.post('/login', async(req, res) => {
    const { loginField, password } = req.body
    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        const user = await collection.findOne({
            $or: [
              { email: loginField },
              { username: loginField },
              { Mobile: loginField }
            ]
          });
          if (!user) {
            return res.status(400).json({ message: 'User not found' });
          }

          const isPassword = await bcrypt.compare(password, user.password)

          if(!isPassword){
            return res.status(400).json({message: "Incorrect Password"})
          }

          const token = jwt.sign(
            {
                id: user._id,
                email : user.email,
                name: user.name,
              
            },
            'secret-key',
            {
                expiresIn : "4h"
            }
          )
          user.token = token
          user.password = undefined
          const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days expiry
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', // Only set to true in production
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' // Lax for local, None for production
          };
          
          res.cookie("token", token, options);
          console.log(token)
          res.status(200).json({message: "Login Successful", token})


      

    }catch(e){
        console.log(`Error : ${e}`)
    }
    finally {
        await client.close();
      } 
})

module.exports = router


