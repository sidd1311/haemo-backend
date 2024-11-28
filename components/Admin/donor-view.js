const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
require('dotenv').config();

const url = process.env.MONGO_URL;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'HaemoShare-Blood';

router.get('/unapproved-donor', async(req, res) => {
    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('donors');
        const unapprovedDonors = await collection.find({ isApproved: false }).toArray();
        
        res.status(200).json(unapprovedDonors);

    }catch (e){
        console.log(`An Error Occured: ${e}`)
        res.status(400).json({ message: 'An error occurred while fetching unapproved donors' });
    }finally {
        await client.close();
    }
})

router.put('/approve-donor/:id', async (req, res) => {
    const donorId = req.params.id;

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('donors');


        const result = await collection.updateOne(
            { _id: new ObjectId(donorId) },
            { $set: { isApproved: true } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Donor not found or already approved' });
        }

        res.status(200).json({ message: 'Donor approved successfully' });
    } catch (e) {
        console.error(`Error occurred: ${e}`);
        res.status(400).json({ message: 'An error occurred while approving the donor' });
    } finally {
        await client.close();
    }
});

router.get('/approved-donors', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('donors');

        const approvedDonors = await collection.find({ isApproved: true }).toArray();
        
        res.status(200).json(approvedDonors);
    } catch (e) {
        console.error(`Error occurred: ${e}`);
        res.status(400).json({ message: 'An error occurred while fetching approved donors' });
    } finally {
        await client.close();
    }
});
router.put('/edit-donor/:id', async (req, res) => {
    const donorId = req.params.id;
    const updateFields = req.body;  // Fields to update should be passed in the request body

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('donors');

        // Update donor information
        const result = await collection.updateOne(
            { _id: new ObjectId(donorId), isApproved: true },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Donor not found or already up-to-date' });
        }

        res.status(200).json({ message: 'Donor information updated successfully' });
    } catch (e) {
        console.error(`Error occurred: ${e}`);
        res.status(400).json({ message: 'An error occurred while updating the donor' });
    } finally {
        await client.close();
    }
});

// Route to delete an approved donor
router.delete('/delete-donor/:id', async (req, res) => {
    const donorId = req.params.id;

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('donors');

        const result = await collection.deleteOne({ _id: new ObjectId(donorId), isApproved: true });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Donor not found or already deleted' });
        }

        res.status(200).json({ message: 'Donor deleted successfully' });
    } catch (e) {
        console.error(`Error occurred: ${e}`);
        res.status(400).json({ message: 'An error occurred while deleting the donor' });
    } finally {
        await client.close();
    }
});

module.exports = router;
