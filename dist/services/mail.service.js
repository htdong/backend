var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    send: (res, mailContent) => __awaiter(this, void 0, void 0, function* () {
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
                from: mailContent.from,
                to: mailContent.to,
                subject: mailContent.subject,
                text: mailContent.textMessage,
                html: mailContent.htmlMessage,
            };
            return smtpTransport.sendMail(mailOptions)
                .then(function (info) {
                console.log(info);
                return {
                    status: 200,
                    data: info
                };
            })
                .catch(function (err) {
                console.log(err);
                return {
                    status: 500,
                    message: 'sendMail failed!',
                    data: err
                };
            });
        }
        catch (err) {
            return Promise.resolve({
                status: 500,
                message: 'Mail Service failed!',
                data: err
            });
        }
    })
};
module.exports = mailService;
