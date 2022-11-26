'use strict';

const { SESClient,SendEmailCommand, SendEmailCommandInput, SendEmailCommandOutput } = require("@aws-sdk/client-ses")
const charset = "UTF-8"

/**
 * Ensures the provided is an array, by returning existing arrays, or wrapping in an array.
 * @param {*} val the value to ensure is an array.
 * @returns either the original val, if it was already an array, or a new array containing val.
 */
const asArray = (val) => {
  return Array.isArray(val) ? val : [val]
}

module.exports = {
  init: (providerOptions = {}, settings = {}) => {

    const ses = new SESClient(providerOptions)

    return {
      send: options => {
        return new Promise((resolve, reject) => {
          const { from, to, cc, bcc, replyTo, subject, text, html } = options;

          const fromVal = from || settings.defaultFrom
          const replyToVal = replyTo || settings.defaultReplyTo

          const msg = {
            Source: fromVal,
            ReplyToAddresses: asArray(replyToVal),
            Destination: {
              ToAddresses: asArray(to),
              CcAddresses: asArray(cc),
              BccAddresses: asArray(bcc),
            },
            Message: {
              Subject: { Data: subject, Charset: charset },
              Body: {
                Text: { Data: text, Charset: charset },
                Html: { Data: html || text, Charset: charset }
              },
            }
          }

          const sendCommand = new SendEmailCommand(msg)

          ses.send(msg).then((email) => {
            resolve();
          }).catch((err) => {
            if (err) {
              if (err.Message) {
                reject(`${err.Message} ${err.Detail ? err.Detail : ''}`);
              }
            }
            reject(err);
          })
        });
      },
    };
  },
};
