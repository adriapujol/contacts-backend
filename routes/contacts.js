const express = require('express');
const router = express.Router();
const Contact = require('../model/contact');


// ROUTES

router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find({});
        res.status(200).send(contacts);
    } catch {
        res.status(500).send({ message: "There was an error, try again later." });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
        await Contact.findByIdAndDelete(id).exec();
        res.status(200).send({ message: "Contact deleted." });
    } catch {
        res.status(500).send({ message: `There was and error deleting the user with id: ${id}` });
    }
})

router.post('/new', async (req, res) => {
    try {
        await Contact.findOne({ email: req.body.email }, async (err, found) => {
            if (err) throw err;
            if (found) {
                res.status(409).send({ message: "This contact already exists." });
            } else {
                const contact = new Contact({ name: req.body.name, lastName: req.body.lastName, email: req.body.email, phone: req.body.phone });
                await contact.save();
                res.status(200).send(contact);
            }

        });
    } catch {
        res.status(500).send({ message: "There was an error." });
    }
})


router.put('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    console.log(body);
    try {
        await Contact.findOne({ email: body.email }, async (err, found) => {
            console.log("Before found if");
            if (err) throw err;
            if (found) {
                // console.log(found);
                if (found._id.toString() !== id) {
                    // console.log(typeof found._id);
                    // console.log(typeof id);
                    // console.log("Same id: ", found._id, id);
                    res.status(409).send({ message: "This email already exists" });
                } else {
                    // console.log("first found: ", found);
                    found.name = body.name;
                    found.lastName = body.lastName;
                    found.email = body.email;
                    found.phone = body.phone;
                    found.save();
                    res.status(200).send(found);
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
        res.status(500).send({ message: "There was an error." });
    }
})


module.exports = router;