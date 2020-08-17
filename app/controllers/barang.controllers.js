const db    = require("../models/index");
const Barang = db.barangs;
const Op    = db.Sequelize.Op;

//Barang Create
exports.create = (req, res) => {
    //Validate request
    if (!req.body.nama) {
        res.status(400).send(
            {
                message: "Content can not be empty"
            }
        );
        return;
    }
    //Create Barang
    const barangs = {
        nama: req.body.nama,
        tanggal: req.body.tanggal,
        harga: req.body.harga,
        foto_struk: "-"
    }
    Barang.create(barangs)
        .then((data) => {
            res.send(data);
        }).catch((err) => {
            res.status(500).send({
                message: err.message || 
                "Some error occured while creating the Barang"
            })
        });
};

//put upload image
exports.uploadImageBarang = async (req, res) => {
    const id = req.params.id;
    const name = req.params.name;

    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field 
            let foto_struk = req.files.foto_struk;
            var renameFotoStruk = + id
                + "-"
                + name
                + (foto_struk.name).substring((foto_struk.name).indexOf("."))

            Barang.update({
                foto_struk: renameFotoStruk

            }, {
                where: { id: id }
            }).then((result) => {
                if (result == 1) {
                    foto_struk.mv('./uploads/struk/' + renameFotoStruk);
                    //send response
                    res.send({
                        status: true,
                        message: 
                        'Foto Struk File is uploaded',
                        data: {
                            name: foto_struk.name,
                            rename : renameFotoStruk,
                            mimetype: foto_struk.mimetype,
                            size: foto_struk.size
                        }
                    });
                } else {
                    res.send({
                        message: 
                        `Cannot update barang with id = ${id}`
                    })
                }
            }).catch((err) => {
                res.status(500).send({
                    message: `Error updating barang id = ${id}`
                })
            })

        }
    } catch (err) {
        res.status(500).send(err);
    }
};

//Retrieve All
exports.findAll = (req, res) => {
    const nama = req.query.nama;
    let condition = 
    nama ? { nama: { [Op.like]: `%${nama}%` } } : null;
    Barang.findAll({ where: condition })
    .then((data) => {
        res.send(data);
    }).catch((err) => {
        res.status(500).send({
            message:
                err.message || "Some error occured while find barang"
        })
    });
};


//PUT Data Barang
exports.updateBarang = async (req, res) => {
    const id = req.params.id;

    try {
        if (!req.params) {
            res.send({
                status: false,
                message: 'No Id selected'
            });
        } else {
            //get data that have been submitted
            var nama        = req.param('nama');
            var tanggal     = req.param('tanggal');
            var harga       = req.param('harga');
            var foto_struk  = req.param('foto_struk');  

            Barang.update({
                nama: nama,
                tanggal: tanggal,
                harga: harga,
                foto_struk: foto_struk
            }, {
                where: { id: id }
            }).then((result) => {
                if (result == 1) {
                    res.send({
                        status: true,
                        message: 
                        'Sukses!! Data Barang berhasil di Update.'
                    });
                } else {
                    res.send({
                        message: 
                        `Cannot update barang with id = ${id}`
                    })
                }
            }).catch((err) => {
                res.status(500).send({
                    message: `Error updating barang id = ${id}`
                })
            })

        }
    } catch (err) {
        res.status(500).send(err);
    }
};