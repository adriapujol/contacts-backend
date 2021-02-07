if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Contact = require('./model/contact');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// DATABASE CONNECTION
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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
        await Contact.findOne({ email: req.body.email }, async (err, found) => {
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


app.put('/edit/:id', async (req, res) => {
    const id = req.params.id;
    console.log("ID PARAMS: ", id);
    const body = req.body;
    console.log("REQ BODY: ", req.body);
    try {
        await Contact.findOne({ email: body.email }, async (err, found) => {
            if (err) throw err;
            if (found) {
                if (found._id.toString() !== id) {
                    res.status(409).send({ message: "This email already exists" });
                }
            } else {
                await Contact.findByIdAndUpdate(id, { ...body }, { new: true }, async (err, result) => {
                    if (err) {
                        throw err;
                    } else {
                        console.log("changed");
                        res.status(200).send(result);
                    }
                })
            }
        })
    } catch {
        res.status(500).send("There was an error");
    }
})

app.listen(process.env.PORT || 3001, () => {
    console.log("CONNECTED");
});