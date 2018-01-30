console.log('MailService');

var nodemailer = require('nodemailer');
var response = require('./response.service');

var MailService = {
  send: async (res, mailContent) => {
    try {
      console.log('Mail Content: ', mailContent);
      let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "gkbps.services@gmail.com",
          pass: "dare.to@FAIL"
        }
      });      
    
      var mailOptions = {
        from: mailContent.from,
        to: mailContent.to,
        subject: mailContent.subject,
        text: mailContent.textMessage,
        html: mailContent.htmlMessage,
      } 

      return smtpTransport.sendMail(mailOptions)
        .then(function(info){
          console.log(info);
          return {
            status: 200,
            data: info
          }                 
        })
        .catch(function(err){
          console.log(err);
          return {
            status: 500,
            message: 'sendMail failed!',
            data: err
          };
        });                

    } catch (err) {      
      return Promise.resolve({
        status: 500,
        message: 'Mail Service failed!',
        data: err
      });       
    }      
    
  }
}

module.exports = MailService;
  