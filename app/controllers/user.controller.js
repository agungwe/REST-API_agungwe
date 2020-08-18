var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')
var flash = require('express-flash')
var async = require('async')
var nodemailer = require('nodemailer')
var crypto = require('crypto')
var forgot = require('password-reset')
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const MongoClient = require('mongodb').MongoClient;
const db = require('../models/index');
const { random } = require('lodash');
const { token } = require('morgan');
const { users } = require('../models/index');
const User = db.users

//Registrasi
exports.signup = function (req,res) {
    //Validate Request
    if (!req.body.email || !req.body.password) {
        res.status(400).send(
            {
                message: "Content cannot be empty"
            }
        )
        return
    }

    //Create User
    var salt = bcrypt.genSaltSync(10)
    var hash = bcrypt.hashSync(req.body.password,salt)
    
    const user = {
        email     : req.body.email,
        password  : hash,
        foto_ktp  : "-"
    }

    User.create(user)
        .then((data) =>{
            res.send(data)
        }).catch((err)=>{
            res.status(500).send({
                message : err.message || "some error occured"
            })
        })
};

//put upload image User
exports.uploadImageKTP = async (req, res) => {
    const id = req.params.id;
    const email = req.params.email;

    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field 
            let foto_ktp = req.files.foto_ktp;
            var renameFotoKTP = + id
                + "-"
                + name
                + (foto_ktp.name).substring((foto_ktp.name).indexOf("."))

            Sales.update({
                foto_ktp: renameFotoKTP

            }, {
                where: { id: id }
            }).then((result) => {
                if (result == 1) {
                    foto_ktp.mv('./uploads/user/' + renameFotoKTP);
                    //send response
                    res.send({
                        status: true,
                        message: 
                        'Foto KTP/SIM File is uploaded',
                        data: {
                            name: foto_ktp.name,
                            rename : renameFotoKTP,
                            mimetype: foto_ktp.mimetype,
                            size: foto_ktp.size
                        }
                    });
                } else {
                    res.send({
                        message: 
                        `Cannot update Users with id = ${id}`
                    })
                }
            }).catch((err) => {
                res.status(500).send({
                    message: `Error updating Users id = ${id}`
                })
            })

        }
    } catch (err) {
        res.status(500).send(err);
    }
};

//Login
exports.signin = function (req, res) {
    var email = req.body.email;
    var pass = req.body.password;

    User.findOne({ where: { email: email} })
        .then((data) => {
            var hasil = bcrypt.compareSync(pass, data.password);
            console.log(hasil);

            if (hasil == true){

                var secret = "TEXT SECRET LETAK KAN DI ENV";
                var expiresIn = "30 days";

                jwt.sign({ id: data.id}, secret, { algorithm: 'HS256', expiresIn: expiresIn},
                    function (err, token) {

                    if (err) {
                        res.json({
                            "results":
                            {
                                "status": false,
                                "msg": 'Error occured while generating token'
                            }
                        });
                    } else {
                        if (token != false) {
                            res.header();
                            res.json({
                                "results":
                                {
                                    "status": true,
                                    "token": token,
                                    "user":{
                                            id: data.id
                                         }
                                    }
                                });
                                    res.end();   
                                }
                                else {
                                    res.json({
                                        "results": 
                                        {
                                            "status": false,
                                            "msg": 'Could not create token'}    
                                    });
                                    res.end();
                                }
                            }
                        });
                } else {
                    res.send({
                        message: "Email atau Password Anda Salah!!"
                    });
                }
            
        }).catch((err) => {
            res.status(500).send({
                message: "Error retrieving post with id =" + id
            });
        });
};


//Lupa Password
exports.resetpassword = function (req, res){
	//Validate Request
	if( !req.body.email){
		res.status(400).send(
			{
				message: "Content can not be empty"
			}
		);
		return;
	}

	//reset password
	const length = 8;
	const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let new_password = '';
    for (let i = length; i > 0; --i) new_password += chars[Math.floor(Math.random() * chars.length)];

	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(new_password, salt);

	const email = req.body.email;
	User.update({
		password: hash
	}, {
		where: {email:email}
	}).then( (result) => {
		if(result == 1){
			//send response
			res.send({
				status: true,
				message: 'Your password has been reset',
				data: {
					email: email,
					new_password : new_password,
				}
			});
		} else {
			res.send({
				message: `Cannot reset password with email = ${email}`,
			});
		}
	}).catch((err) =>{
		res.status(500).send(err);
	});
};