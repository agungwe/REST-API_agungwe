module.exports = app => {
    const auth  = require('../middleware/auth');
    const barangs = require("../controllers/barang.controllers");

    let router = 
    require("express").Router();

    //create a new post
    router.post("/", barangs.create);
    //Pencarian semua data dari tabel
    router.get("/", barangs.findAll);
    //Update data barang
    router.put("/update/:id", barangs.updateBarang);


    router.put("/image-photo/:id/:nama", barangs.uploadImageBarang);

    app.use("/api/barangs", auth.isAuth,router);
}