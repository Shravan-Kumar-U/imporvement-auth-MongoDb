const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { z } = require("zod");
const { UserModel, TodoModel } = require("./db");
const app = express();
const JWT_SECRETE = "Pain"
app.use(express.json());

mongoose.connect("");

app.post("/signup", async function(req, res){
    //Authenticaton using ZOD external library
    const requireBody = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(3).max(30),
        name: z.string().min(3).max(20)
    })
    //const parseData = requireBody.parse(req.body);
    const parseData = requireBody.safeParse(req.body);
    if(!parseData.success){
        res.json({
            message: "Please enter correctly",
            error: parseData.error
        })
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const errrorThrow = false;
    //here not storing the plain password in database.Here i am hashing the user's real password to an unreadable formate using bcypt library so if ever my database is leaked nobody can see the original password of the user in my database
    try{
        //here i am using try catch because this region in the code may throw an error if the user enters an existing email
        const hashedPassword = await bcrypt.hash(password, 7);
        console.log(hashedPassword);
    

    await UserModel.create({
        email: email,
        password: hashedPassword,
        name: name
    })
    }catch(e){
        res.json({
            message : "Please change the email id. User name is already exists"
        })
        errrorThrow = true;
    }

    if(!errrorThrow){
        res.json({
            message : "You are signed up"
        })
    }
})

app.post("/signin", async function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    const user = await UserModel.findOne({
        email: email
    })
    if(!user){
        res.json({
            message : "User in this email does'nt  exist in our data base"
        })
        return;
    }
    //using bcrypt i am verifing the users hashed password and the hashed password which is stored in the database 
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(user);
    
    if(passwordMatch){
        console.log({
            id: user._id.toString()
        });
        //if user give the correct credintials i will return a token to the user
        const token = jwt.sign({
            id: user._id.toString()
        }, JWT_SECRETE);
        res.json({
            token : token
        })
    }else{
        res.status(404).json({
            message : "Incorrect Credentials"
        })
    }
})

function auth(req, res, next){
    const token = req.headers.token;
    const decodedData = jwt.verify(token, JWT_SECRETE);
    if(decodedData){
        console.log(decodedData.id);
        
        req.id = decodedData.id;

        next();
    }else{
        res.status(404).json({
            message : "Incorrect Credentials"
        })
    }
}

app.post("/todo", auth, function(req, res){
    const id = req.id;
    res.json({
        id: id
    })
})
app.get("/todos", auth,  function(req, res){
    const id = req.id;
    res.json({
        id: id
    })
})

app.listen(3000);