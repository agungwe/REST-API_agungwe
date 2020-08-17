module.exports = app => {
    const users = require("../controllers/user.controller")

    let router = require("express").Router()

    //create new post
    router.post("/signup",users.signup)
    //Login User
    router.post("/signin",users.signin)
    //Lupa Password User
    router.post("/reset_password",users.forgot_password)

    router.put("/image-photo/:id/:name", users.uploadImageKTP);

    app.use("/api/users",router)
}