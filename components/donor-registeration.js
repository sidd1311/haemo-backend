// const express = require('express')
// const router = express.Router()
// const { MongoClient } = require('mongodb');
// require('dotenv').config()

// const url = process.env.Mongo_URL;
// const client = new MongoClient(url);
// const dbName = 'HaemoShare-Blood';  


// router.post('/register-donor', async(req, res) => {
//  const { name, bloodGroup, age, mobile, weight, email, city, state, district, country, disease, available } = req.body
//     try{
//         await client.connect();
//         const db = client.db(dbName);
//         const collection = db.collection('donors');
//         const donor = {
//             name,
//             bloodGroup,
//             age,
//             mobile,
//             weight,
//             email,
//             city,
//             state,
//             district,
//             country,
//             disease,
//             available : true
//         };
//         const result = await collection.insertOne(donor);

      
//         res.status(201).json({ message: 'Donor registered successfully', donorId: result.insertedId });
//     } catch (e) {
//         console.error(`Error occurred: ${e}`);
//         res.status(400).json({ message: 'An error occurred while registering the donor' });
//     } finally {
//         await client.close(); 
//     }
// }); 


// module.exports = router;


const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
require('dotenv').config();

const url = process.env.MONGO_URL;
const client = new MongoClient(url);
const dbName = 'HaemoShare-Blood';

// Set up the email transporter using Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Or any other email provider
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password or app-specific password
    }
});

router.post('/register-donor', async (req, res) => {
    const { name, bloodGroup, age, mobile, weight, email, city, state, district, country, disease, available } = req.body;
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('donors');
        const donor = {
            name,
            bloodGroup,
            age,
            mobile,
            weight,
            email,
            city,
            state,
            district,
            country,
            disease,
            isApprocved: false,
            available: true
        };
        const result = await collection.insertOne(donor);

        // Send email confirmation
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Donor Registration Successful',
            text: `Dear ${name},\n\nThank you for registering as a blood donor with HaemoShare.\nYour Blood Group: ${bloodGroup}\n\nWe appreciate your contribution!\n\nBest Regards,\nHaemoShare Team`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Donor registered successfully and email sent', donorId: result.insertedId });
    } catch (e) {
        console.error(`Error occurred: ${e}`);
        res.status(400).json({ message: 'An error occurred while registering the donor' });
    } finally {
        await client.close();
    }
});

    // GET route to retrieve all donors
    router.get('/donors', async (req, res) => {
        try {
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection('donors');
            const donors = await collection.find().toArray();
            
            res.status(200).json(donors);
        } catch (e) {
            console.error(`Error occurred: ${e}`);
            res.status(400).json({ message: 'An error occurred while fetching donors' });
        } finally {
            await client.close();
        }
    });

module.exports = router;
