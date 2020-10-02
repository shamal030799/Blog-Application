// Initialise port and host
const port = 3000;
const host = "127.0.0.1";

// Express Dependency - initialise
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const Mongo = require("mongoose");
const key = require("./setup/config");
const bcrypt = require("bcrypt");

// Tables
const User = require("./tables/Register");

var app = express();

// Initialisation for Bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// SESSION CONFIGURATION
const sess = {
    name: "User",
    resave: false,
    saveUninitialized: true,
    secret: "mySecret",
    cookie: {}
}

if (app.get('env') === "product ion") {
    sess.cookie.secure = false;
    sess.cookie.maxAge = 60 * 60;
    sess.cookie.sameSite = true;
}
app.use(session(sess));

app.set('view engine', 'ejs');


// Middleware
const redirectLogin = (request, response, next) => {
    if (!request.session.Email) {
        response.redirect("/register");
    } else
        next();
}

const redirectHome = (request, response, next) => {
    if (request.session.Email) {
        response.redirect("/users")
    } else
        next();
}

// Create Users👥 Array - We will store users data in this array (When you are not using database)
// const registeredUsers = [];

// const allBlogs = [];


// Database Connection
// Mongo.connect is a promise. Therefore there will be two possiblities 1. Fulfilled or 2.Failed. So fulfilled one goes into then block and failure one goes to catch block.
// then().catch() statements are used to prevent server crash incase of failed promise.
Mongo.connect(key.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Database connected successfully🎉 !");
    })
    .catch((error) => {
        console.log("Something went wrong🤦‍♀️ :", error);
    });



// Basic Page
app.use("/register", redirectHome, express.static(__dirname + "/public"));
app.get("/", (request, response) => {
    response.status(301).redirect("/users");
})


// CREATION of  different paths/pages
// Structure is http://host:port/path - GET request - response - response.send("<h1>Hello this is our blog engine !</h1>");
app.get("/users", (request, response) => {

    // BEFORE USING DATABASE :
    // console.log(registeredUsers);
    // response.render("users", {
    //     status: "",
    //     users: registeredUsers
    // });

    // AFTER USING DATABASE :
    User.find()
        .then((users) => {
            console.log(users);
            if (request.session.Email) {
                response.render("users", {
                    status: "Logged",
                    users: users
                });
            } else
                response.render("users", {
                    status: "",
                    users: users
                });
        })
        .catch(err => console.log(err))


})

app.get("/blogs/:email", redirectLogin, (request, response) => {
    const email = request.params.email;
    console.log(email);


    // BEFORE :
    // //get Index of user from allBlogs Array
    // const blogIndex = allBlogs.findIndex(user => user.email === email);

    // if (allBlogs[blogIndex].titles.length === 0) { //Checking whether it contains blogs or not !
    //     response.render("blogCollection", {
    //         status: 0
    //     })
    // } else {
    //     response.render("blogCollection", {
    //         status: 1,
    //         emails: allBlogs[blogIndex].email,
    //         titles: allBlogs[blogIndex].titles,
    //         urls: allBlogs[blogIndex].urls
    //     })
    // }


    // AFTER :
    User.findOne({
            email: email
        })
        .then((user) => {
            console.log(user);
            if (user.titles.length === 0) { //Checking whether it contains blogs or not !
                response.status(200).render("blogCollection", {
                    status: 0
                })
            } else {
                response.status(200).render("blogCollection", {
                    status: 1,
                    emails: user.email,
                    titles: user.titles,
                    urls: user.urls
                })
            }
        })
        .catch(err => console.log(err))


})

app.get("/blogs/fullblog/:title&:email", redirectLogin, (request, response) => {
    const title = request.params.title;
    const email = request.params.email;
    console.log("Title :",title);
    console.log("Email :",email);

    // BEFORE :
    // // Collect index of a blog in allBlogs array with the help of email
    // const blogIndex = allBlogs.findIndex((blog) => blog.email === email);

    // console.log(blogIndex);
    // console.log(allBlogs[blogIndex]);
    // // {
    // //     email: 'ml@gmail.com',
    // //     titles: [ 'Internet','Facebook' ],
    // //     urls: [ 'https://www.netobjex.com/wp-content/uploads/2019/01/1.jpg','xyz.jpeg' ],
    // //     texts: [ 'dkmskndjnsdnjnsjn','sbdhsbdajhsd' ]
    // //   }

    // let i;
    // for (i = 0; i <= allBlogs[blogIndex].titles.length; i++) {
    //     if (allBlogs[blogIndex].titles[i] === title) {
    //         break;
    //     } else
    //         continue;
    // }

    // // console.log("Position of our blog is :", i);
    // const Index = i; //This is our Blog title's index

    // console.log(allBlogs[blogIndex].titles[Index]);
    // console.log(allBlogs[blogIndex].urls[Index])
    // console.log(allBlogs[blogIndex].texts[Index])

    // response.render("blogs", {
    //     user: email,
    //     title: allBlogs[blogIndex].titles[Index],
    //     url: allBlogs[blogIndex].urls[Index],
    //     text: allBlogs[blogIndex].texts[Index]
    // })


    // response.render("blogs", {
    //     user: allBlogs[blogIndex].email
    // });

    // AFTER :
    User.findOne({
            email: email
        })
        .then((user) => {
            // console.log(user);
            let i;
            for (i = 0; i <= user.titles.length; i++) {
                if (user.titles[i] === title) {
                    console.log("We got our title");
                    break;
                } else
                    continue;
            }

            // console.log("Position of our blog is :", i);
            const Index = i; //This is our Blog title's index

            console.log(user.titles[Index]);
            console.log(user.urls[Index])
            console.log(user.texts[Index])

            response.status(200).render("blogs", {
                user: email,
                pic: user.profilepic,
                title: user.titles[Index],
                url: user.urls[Index],
                text: user.texts[Index]
            })

        })
        .catch(err => console.log(err));

})

//GET Registration Form Details
// Purpose - To store registered Users with email and passwords
app.post("/registerDetails", (request, response) => {
    console.log("Username :", request.body.email);
    console.log("Password :", request.body.password);

    // We have to collect email and password of a user
    // Create user object - which email & password of user
    const user = {};

    // Create email and password property for storing
    // admin@gmail.com
    user.email = request.body.email;
    user.password = request.body.password;
    user.profilepic = request.body.pic;

    // For blog posting purpose we have created this array
    user.titles = [];
    user.urls = [];
    user.texts = [];

    // BEFORE :
    // registeredUsers.push(user);


    // For allBlogs array
    // const blog = {};
    // blog.email = request.body.email;

    // // For Blogs Collection
    // blog.titles = [];
    // blog.urls = [];
    // blog.texts = [];

    // allBlogs.push(blog);
    // console.log("Blogs : ", allBlogs);


    // Storing Cookie onto the browser
    // request.session.Email = request.body.email;
    // request.session.Password = request.body.password;
    // console.log(request.session);
    // console.log(registeredUsers);
    // response.status(200).render("users", {
    //     status: "Logged",
    //     users: registeredUsers
    // });
    // response.status(200).json({
    //     "success": "Registration successful.. !"
    // })

    // Upload User data to the database
    // 1. table
    // 2. email,password, titles,urls,texts


    // AFTER :
    User.findOne({
            email: request.body.email
        })
        .then((person) => {
            if (person) {
                response.status(201).render("register", {
                    error: "Error"
                })
            } else {
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        user.password = hash;
                        new User(user).save()
                            .then((user) => {
                                console.log(user);
                                console.log("User Registered🎉 !");
                                // Storing Cookie onto the browser
                                request.session.Email = user.email;
                                request.session.Password = user.password;
                                console.log(request.session);
                                response.status(200).redirect("/users");
                            })
                            .catch(err => console.log(err))
                    });
                });


            }

        })
        .catch(err => console.log("Failed😢 !"));

})


// Login path - /login
app.get("/login", redirectHome, (request, response) => {
    response.render("login", {
        error: ""
    });
})


// We will collect our login details
app.post("/loginDetails", (request, response) => {
    console.log("Username :", request.body.email);
    console.log("Password :", request.body.password);

    // BEFORE IMPLEMENTING :
    // console.log(registeredUsers);

    // // Logic behind login
    // // Collect UserIndex (if exists)
    // const userIndex = registeredUsers.findIndex(user => user.email === request.body.email)
    // console.log(userIndex);
    // //For non registered users !
    // if (userIndex === -1) {
    //     response.json({
    //         "message": "You are not registered !"
    //     })
    // } else {

    //     // registeredUsers[userIndex].password is password stored in array
    //     // request.body.password is password coming from your form
    //     // Admin Section
    //     if (registeredUsers[userIndex].email === "admin@gmail.com" && request.body.password === "admin")
    //         response.status(200).json({
    //             "success": "You are in the admin section"
    //         })
    //     else {
    //         if (registeredUsers[userIndex].password === request.body.password && registeredUsers[userIndex].email === request.body.email) {
    //             // Storing Cookie onto the browser
    //             request.session.Email = request.body.email;
    //             request.session.Password = request.body.password;


    //             console.log(request.session);
    //             response.status(200).render("users", {
    //                 status: "Logged",
    //                 users: registeredUsers
    //             });
    //             // response.status(200).json({
    //             //     "success": "Logged In !"
    //             // })
    //         } else
    //             response.status(200).send("<h1>Password not matched !</h1>");
    //         // response.status(400).json({
    //         //     "error": "Password Not matched !"
    //         // })
    //     }
    // }

    //AFTER IMPLEMENTING DATABASE
    User.findOne({
            email: request.body.email
        })
        .then((person) => {
            console.log(person);
            if (!person)
                response.status(404).render("login", {
                    error: "Error"
                })
            else {

                // BEFORE ENCRYPTION
                // person.email is coming from database
                // request.body.email is coming from frontend form
                // if (person.email === request.body.email && person.password === request.body.password) {
                //     // Storing Cookie onto the browser
                //     request.session.Email = person.email;
                //     request.session.Password = person.password;
                //     console.log(request.session);
                //     response.status(200).redirect("/users");
                // } else
                //     response.status(404).redirect("/register");

                //AFTER ENCRYPTION
                bcrypt.compare(request.body.password, person.password).then((res) => {
                    // res === true
                    if (res === true) {
                        // Storing Cookie onto the browser
                        request.session.Email = person.email;
                        request.session.Password = person.password;
                        console.log(request.session);
                        response.status(200).redirect("/users");
                    } else
                        response.status(404).render("login", {
                            error: "passError"
                        })
                });

            }
        })
        .catch(err => console.log(err))

})

// Get Blog form - We need blog title , one picture, blog text
app.get("/blogForm", redirectLogin, (request, response) => {
    response.render("uploadblog",{
        error:""
    });

})

// Get blogForm details
app.post("/blogUpload", (request, response) => {
    console.log(request.body);

    const blogTitle = request.body.title;
    const imageUrl = request.body.imgUrl;
    const blogText = request.body.blogText;


    const email = request.session.Email;
    console.log(email);

    // BEFORE :
    // We have to store blog details in two arrays - 1. registeredUsers 2. allBlogs

    // // Get specific User from registeredUsers array
    // const registeredUser_index = registeredUsers.findIndex((user) => user.email === email); //userIndex will be the location of the user in the array


    // // Storing Details of Blogs in registeredUsers Array
    // registeredUsers[registeredUser_index].titles.push(blogTitle);
    // registeredUsers[registeredUser_index].urls.push(imageUrl);
    // registeredUsers[registeredUser_index].texts.push(blogText);


    // // Get specific User from allBlogs array
    // const allBlog_index = allBlogs.findIndex((user) => user.email === email); //userIndex will be the location of the user in the array

    // // Storing Details of Blogs in allBlogs Array
    // allBlogs[allBlog_index].titles.push(blogTitle);
    // allBlogs[allBlog_index].urls.push(imageUrl);
    // allBlogs[allBlog_index].texts.push(blogText);



    // console.log("Registered Users Array :", registeredUsers);

    // console.log("Blogs Array :", allBlogs);

    // response.status(200).redirect("/users");

    // AFTER :
    User.findOneAndUpdate({
            email: email
        }, {
            $push: {
                titles: blogTitle,
                urls: imageUrl,
                texts: blogText
            }
        }, {
            new: true
        })
        .then(() => {
            console.log("Database Updated Successfully🎉 !")
            response.status(200).redirect("/users");
        })
        .catch(err => {
            console.log(err);
            response.status(200).render("uploadBlog", {
                error: "Error"
            })
        })

})

// Delete a User

app.get("/delete", redirectLogin, (request, response) => {
    response.status(200).render("deleteUser", {
        error: ''
    })
})

app.post("/deleteUser", (request, response) => {
    console.log(request.body);
    const email = request.session.Email;
    const password = request.body.password;


    User.findOne({
            email: email
        })
        .then((user) => {
            if (!user)
                response.status(200).render("deleteUser", {
                    error: 'Error'
                })
            else {
                // password is coming from form
                // user.password is coming from database
                bcrypt.compare(password, user.password).then((isCorrect) => {
                    // res === true
                    if (isCorrect === true) {
                        User.findOneAndDelete({
                                email: user.email
                            })
                            .then(() => {
                                request.session.destroy((error) => {
                                    if (error) {
                                        console.log("Error :", error);
                                        response.status(200).redirect("/users");
                                    } else
                                        response.status(200).redirect("/users");
                                })
                            })
                            .catch(err => console.log(err));
                    } else
                        response.status(200).render("deleteUser", {
                            error: 'passError'
                        })
                });
            }
        })
        .catch(err => console.log(err));
})


// Deleting logic for practice approach !

// Delete a user from registered Users Array
// app.get("/deleteUser", (request, response) => {
//     response.send(`<form action="/delete" method="POST">
//                     <input type="email" name="email" placeholder="Email">
//                     <input type="submit" value="Submit">
//                     </form>`)
// })

// app.post("/delete", (request, response) => {
//     const email = request.body.email;

//     // Get Index
//     const userIndex = registeredUsers.findIndex(user => user.email === email);

//     if (userIndex < 0)
//         response.json({
//             "error": "User not found !"
//         })
//     else {

//         // Deleting user from registeredUsers array !
//         registeredUsers.pop(registeredUsers[userIndex]);
//         console.log(registeredUsers);
//         response.status(200).json({
//             "message": "User Deleted Successfully !"
//         })
//     }
// })

// Logout Path
app.get("/logout", (request, response) => {
    request.session.destroy((error) => {
        if (error) {
            console.log("Error :", error);
            response.status(200).redirect("/users");
        } else
            response.status(200).redirect("/register");
    })
})


// Listening for port and host together !
app.listen(port, host, () => console.log(`Server is running...💻`));


// User{
//     email : xya,
//     password : 123
//     blogTitle : ["what is internet" , "what is social networking?"],
//     blogUrls : ["xyz.jpg","zxc.png"],
//     blogtext : ["qweertt","jcnjjcnjnsjcn"]
// }





// What is object ? 
// Where car is an object
// const car = {
//     // Properties
//     color: "Blue",
//     // Methods
//     move: function () {
//         console.log("Move !");
//     }
// }