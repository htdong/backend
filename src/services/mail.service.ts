console.log('   /...MailService');

// EXTERNAL
var nodemailer = require('nodemailer');

// INTERNAL
var mailInfo = require('../config/base/constants.base');
var response = require('./response.service');

/**
* mailService
* To auto send mail to user
*
* @function send
*/
var mailService = {

  /**
  * @function send
  * Send email to user
  *
  * @param res
  * @param mailContent
  *
  * @return {Promise}
  */
  send: async (res, mailContent) => {
    try {
      console.log('Mail Content: ', mailContent);
      let smtpTransport = nodemailer.createTransport({
        service: mailInfo.mailService,
        auth: {
          user: mailInfo.mailUser,
          pass: mailInfo.mailPassword
        }
      });

      var mailOptions = {
        from:     mailContent.from,
        to:       mailContent.to,
        subject:  mailContent.subject,
        text:     mailContent.textMessage,
        html:     mailContent.htmlMessage,
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

module.exports = mailService;
