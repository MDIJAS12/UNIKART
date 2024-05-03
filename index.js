    const express = require("express");
    const path = require("path");
    const collection = require("./config");
    const bcrypt = require('bcrypt');

    const app = express();
    // convert data into json format
    app.use(express.json());
    // Static file
    app.use(express.static("public"));

    
// Define route to serve indexx.html as the default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "indexx.html"));
});



    app.use(express.urlencoded({ extended: false }));
    //use EJS as the view engine
    app.set("view engine", "ejs");

    app.get("/login", (req, res) => {
        res.render("login");
    });

    app.get("/signup", (req, res) => {
        res.render("signup");
    });

    // Register User
    app.post("/signup", async (req, res) => {

        const data = {
            name: req.body.username,
            password: req.body.password
        }

        // Check if the username already exists in the database
        const existingUser = await collection.findOne({ name: data.name });

        if (existingUser) {
            res.send('User already exists. Please choose a different username.');
        } else {
            // Hash the password using bcrypt
            const saltRounds = 10; // Number of salt rounds for bcrypt
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            data.password = hashedPassword; // Replace the original password with the hashed one

            const userdata = await collection.insertMany(data);
            console.log(userdata);
        }
        res.redirect("/login");

    });

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            return res.alert("User name not found");
        }
        
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            return res.send("Incorrect password");
        }
        
        // If login successful, redirect the user to the indexx.html page
        res.redirect("/"); // Assuming indexx.html is served as the default route
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("An error occurred during login. Please try again later.");
    }
});



    // Define Port for Application
    const port = 3000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    });

