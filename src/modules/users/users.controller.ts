// External
import express = require("express");
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
var mongoose = require("mongoose");
mongoose.Promise = global. Promise;
var nodemailer = require('nodemailer');
var randomPassword = require('../../services/generatePassword.service');

// Internal
var ConstantsBase = require('../../config/base/constants.base');
import  { SimpleHash } from '../../services/simpleHash.service';

var GkClientSchema = require('../gkClients/gkClient.schema');
var UserSchema = require('./user.schema');

var UsersController = {

  /*
   * USER AUTHENTICATE
   *
   * [01] Validate token
   * [02] Connect systemDb
   * [03] Get gkClient
   * [04] Connect masterDb of gkClient
   * [05] Get user of gkClient by username
   * [06] Authorize user of gkClient by password
   */
  authenticate: (req: express.Request, res: express.Response): void => {

    var systemDbUri = ConstantsBase.urlSystemDb;
    var gkClient;
    var clientUser;

    Promise.resolve()
      .then(()=>{
        if (!mongoose.Types.ObjectId.isValid(req.body.token)) throw new Error('Invalid Token');
        return Promise.resolve();
      })
      .then(() => {
        console.log('[01] Validate token');
        return mongoose.createConnection(systemDbUri, { useMongoClient: true });
      })

      .then((systemDb) => {
        console.log('[02] Connect systemDb');
        var GkClient = systemDb.model('GkClient', GkClientSchema);
        return GkClient.findById(req.body.token);
      })

      .then((client) => {
        if (!client) throw new Error('Client does not exist!');

        console.log('[03] Get GkClient');
        gkClient = client;
        var masterDbUri = 'mongodb://localhost:27017/' + gkClient['clientDb'] + '_0000';
        return mongoose.createConnection(masterDbUri, { useMongoClient: true });
      })

      .then((masterDb) => {
        console.log('[04] Connect masterDb of gkClient');
        var User = masterDb.model('User', UserSchema);
        return User.find({ username: req.body.username})
      })

      .then((users) => {
        if (users.length==0) throw new Error('User does not exist!');

        console.log('[05] Get user of gkClient by username');
        clientUser = users[0];
        var checkPassword = new Promise((resolve, reject) => {
          if (!bcrypt.compareSync(req.body.password, clientUser.hash)) reject(new Error('Incorrect password!'));
          resolve();
        });
        return checkPassword;
      })

      .then(() => {
        console.log('[06] Authorize user of gkClient by password');

        var simpleHash = new SimpleHash();

        const token = jwt.sign({ sub: clientUser._id }, ConstantsBase.secret);
        const awt = simpleHash.encode_array([
          gkClient['clientDb'],
          new Date().getFullYear().toString(),
        ]);
        const encodedTcodes = simpleHash.encode_array(clientUser.tcodes.sort());

        const data = {
          _id: clientUser._id,
          username: clientUser.username,
          firstName: clientUser.firstname,
          lastName: clientUser.lastname,
          token: token,
          awt: awt,
          tcodes: encodedTcodes,
          lges: clientUser.lges,
          defaultLge: clientUser.defaultLge,
          status: clientUser.status
        }
        //console.log(data);
        res.send(data);

      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err.message);
      });

  },

  /*
   * USER REGISTER
   *
   * [01] Validate token
   * [02] Connect systemDb
   * [03] Get gkClient
   * [04] Connect masterDb of gkClient
   * [05] Register new user of gkClient
   */

  register: (req: express.Request, res: express.Response): void => {

    var systemDbUri = ConstantsBase.urlSystemDb;
    var gkClient;
    var clientUser;

    Promise.resolve()
      .then(()=>{
        if (!mongoose.Types.ObjectId.isValid(req.body.token)) throw new Error('Invalid Token');
        return Promise.resolve();
      })
      .then(() => {
        console.log('[01] Validate token');
        return mongoose.createConnection(systemDbUri, { useMongoClient: true });
      })

      .then((systemDb) => {
        console.log('[02] Connect systemDb');
        var GkClient = systemDb.model('GkClient', GkClientSchema);
        return GkClient.findById(req.body.token);
      })

      .then((client) => {
        if (!client) throw new Error('Client does not exist!');

        console.log('[03] Get GkClient');
        gkClient = client;
        var masterDbUri = 'mongodb://localhost:27017/' + gkClient['clientDb'] + '_0000';
        return mongoose.createConnection(masterDbUri, { useMongoClient: true });
      })

      .then((masterDb) => {
        console.log('[04] Connect masterDb of gkClient');
        var User = masterDb.model('User', UserSchema);

        // Do not use standard way as hash is initialized and required
        // clientUser = new User(req.body);
        const tempUser = {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          username: req.body.username,
          hash: bcrypt.hashSync(req.body.password, 10),
          email: req.body.email,
        }
        clientUser = new User(tempUser);
        return User.find({ username: req.body.username});
      })

      .then((users)=>{
        if (users.length>0) throw new Error('User already exist!');
        console.log('[05] Register new user of gkClient');
        return clientUser.save();
      })

      .then((user) => {
        console.log('[--] New registered user:');
        console.log(user);
        res.send({"success": "create"});
      })

      .catch((err) => {
        console.log(err);
        res.status(400).send(err.message);
      });

  },

  /*
   * FORGOT PASSWORD
   *
   * [01] Validate token
   * [02] Connect systemDb
   * [03] Get gkClient
   * [04] Connect masterDb of gkClient
   * [05] Get user of gkClient by username
   * [06] Save random password to user
   * [07] Reset password of user by sending new password to user email
   */

  forgot: (req: express.Request, res: express.Response): void => {

    var systemDbUri = ConstantsBase.urlSystemDb;
    var gkClient;
    var clientUser;

    Promise.resolve()
      .then(()=>{
        if (!mongoose.Types.ObjectId.isValid(req.body.token)) throw new Error('Invalid Token');
        return Promise.resolve();
      })
      .then(() => {
        console.log('[01] Validate token');
        return mongoose.createConnection(systemDbUri, { useMongoClient: true });
      })

      .then((systemDb) => {
        console.log('[02] Connect systemDb');
        var GkClient = systemDb.model('GkClient', GkClientSchema);
        return GkClient.findById(req.body.token);
      })

      .then((client) => {
        if (!client) throw new Error('Client does not exist!');

        console.log('[03] Get GkClient');
        gkClient = client;
        var masterDbUri = 'mongodb://localhost:27017/' + gkClient['clientDb'] + '_0000';
        return mongoose.createConnection(masterDbUri, { useMongoClient: true });
      })

      .then((masterDb) => {
        console.log('[04] Connect masterDb of gkClient');
        clientUser = masterDb.model('User', UserSchema);
        console.log(req.body.email);
        return clientUser.find({ email: req.body.email})
      })

      .then((users) => {
        if (users.length==0) throw new Error('User does not exist!');

        console.log('[05] Get user of gkClient by email');
        return users[0];
      })

      .then((user) => {
        var password = new randomPassword;
        var tempPassword = password.generate();
        var tempUser = user;
        tempUser.hash = bcrypt.hashSync(tempPassword, 10);
        console.log('[06] Save random password to user');
        console.log(tempUser);

        var changedUser = new clientUser(tempUser);
        return changedUser.save();
      })
      .then((user)=>{
        console.log('[07] Send random password to email of user!');

        var subject = 'Forgot password request!';
        var from = 'GK|BPS';
        var textMessage = `Your new password is: ${user.hash}`; // plain text body
        var htmlMessage = `<b>Your new password is: <i>${user.hash}<i></b>`; // html body
        var to = user.email;
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
              user: "gkbps.services@gmail.com",
              pass: "dare.to@FAIL"
          }
        });

        var mailOptions = {
            from: from,
            to: to,
            subject: subject,
            text: textMessage,
            html: htmlMessage,
        }
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                throw error;
            }else{
                console.log('Email sent!');
                res.send('Check your email please!');
            }
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err.message);
      });

  },

  create: (req: express.Request, res: express.Response): void => {
    try {
      console.log(req);
      res.send({"success": "create"});
    }
    catch (e)  {
      console.log(e);
      res.send({"error": "error in your request"});
    }
  },

  findAll: (req: express.Request, res: express.Response): void => {
    try {
      console.log(req);
      res.send({"success": "findAll"});
    }
    catch (e)  {
      console.log(e);
      res.send({"error": "error in your request"});
    }
  },

  findById: (req: express.Request, res: express.Response): void => {
    try {
      res.send({"success": "findById"});
    }
    catch (e)  {
      console.log(e);
      res.send({"error": "error in your request"});
    }
  },

  update: (req: express.Request, res: express.Response): void => {
    try {
      res.send({"success": "update"});
    }
    catch (e)  {
      console.log(e);
      res.send({"error": "error in your request"});
    }
  },

  delete: (req: express.Request, res: express.Response): void => {
    try {
      res.send({"success": "delete"});
    }
    catch (e)  {
      console.log(e);
      res.send({"error": "error in your request"});
    }
  },

};
module.exports = UsersController;
