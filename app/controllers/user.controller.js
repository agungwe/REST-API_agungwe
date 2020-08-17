var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')
var flash = require('express-flash')
var async = require('async')
// var nodemailer = require('nodemailer')
// var crypto = require('crypto')
var forgot = require('password-reset')

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
exports.forgot_password = function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({
          email: req.body.email
        }).exec(function(err, users) {
          if (users) {
            done(err, users);
          } else {
            done('User not found.');
          }
        });
      },
      function(users, done) {
        // create the random token
        crypto.randomBytes(20, function(err, buffer) {
          var token = buffer.toString('hex');
          done(err, users, token);
        });
      },
      function(users, token, done) {
        User.findByIdAndUpdate({ _id: users._id }, { reset_password_token: token, reset_password_expires: Date.now() + 86400000 }, { upsert: true, new: true }).exec(function(err, new_user) {
          done(err, token, new_user);
        });
      },
      function(token, users, done) {
        var data = {
          to: users.email,
          from: email,
          template: 'forgot-password-email',
          subject: 'Password help has arrived!',
          context: {
            url: 'http://localhost:8080/api/users/reset_password?token=' + token,
            name: users.fullName.split(' ')[0]
          }
        };
  
        smtpTransport.sendMail(data, function(err) {
          if (!err) {
            return res.json({ message: 'Kindly check your email for further instructions' });
          } else {
            return done(err);
          }
        });
      }
    ], function(err) {
      return res.status(422).json({ message: err });
    });
  };

  