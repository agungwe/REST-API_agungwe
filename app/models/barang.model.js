module.exports = (sequelize, Sequelize)=>{
    const Barang = sequelize.define("barangs", {
        nama:{
            type: Sequelize.STRING
        },
        tanggal:{
            type: Sequelize.STRING
        },
        harga:{
            type: Sequelize.STRING
        },
        foto_struk:{
            type: Sequelize.STRING
        }       
    });
    return Barang;
}