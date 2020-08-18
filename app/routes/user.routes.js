module.exports = app => {
    const users = require("../controllers/user.controller")

    let router = require("express").Router()

    //create new post
    router.post("/signup",users.signup)
    //Login User
    router.post("/signin",users.signin)
    //Lupa Password User
    router.post("/resetpass",users.resetpassword)

    router.put("/image-photo/:id/:name", users.uploadImageKTP);

    app.use("/api/users",router)
}