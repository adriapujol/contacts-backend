if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Contact = require('./model/contact');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

// DATABASE CONNECTION
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));


// ROUTES

app.get('/', (req, res) => {
    res.send("hi");
});


app.get('/read', async (req, res) => {
    try {
        const contacts = await Contact.find({});
        res.status(200).send(contacts);
    } catch {
        res.status(500).send("There was an error, try again");
    }
});

app.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
        await Contact.findByIdAndDelete(id).exec();
        res.status(200).send({ message: "Contact deleted" });
    } catch {
        console.error(`There was and error deleting the user with id: ${id}`);
        res.status(500).send(`There was and error deleting the user with id: ${id}`);
    }
})

app.post('/new', async (req, res) => {
    try {
        await Contact.findOne({ email: req.body.email }, async function (err, found) {
            if (err) throw err;
            if (found) {
                console.log("This contact already exists");
                res.status(409).send({ message: "This contact already exists" });
            } else {
                const contact = new Contact({ name: req.body.name, lastName: req.body.lastName, email: req.body.email, phone: req.body.phone });
                await contact.save();
                res.status(200).send(contact);
            }

        });
    } catch {
        res.status(500).send("There was an error");
    }
})

app.listen(process.env.PORT || 3001, () => {
    console.log("CONNECTED");
});