'use strict';

const http = require('http');
const https = require('https');
const querystring = require('querystring');

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');

// set the S3 endpoints
const BUCKET = 'mimifm';
const styles = {
  webp: {
    format: 'webp',
    formatOptions: { reductionEffort: 6 },
  },
  avatar: {
    format: 'webp',
    formatOptions: { reductionEffort: 6 },
    resize: { width: 180, height: 180 },
  },
  avatar_jpg: {
    format: 'jpeg',
    formatOptions: {},
    resize: { width: 180, height: 180 },
  },
}

exports.handler = (event, context, callback) => {
  let response = event.Records[0].cf.response;

  //console.log("Response status code: %s", response.status);

  // check if image is not present
  if (response.status == 404) {

    let request = event.Records[0].cf.request;

    // read the required path. Ex: uri /lambda!webp/images/image.jpg
    let path = request.uri;

    // read the S3 key from the path variable.
    // Ex: path variable /lambda!webp/images/image.jpg
    let key = path.substring(1);

    // parse the prefix, width, height and image name
    // Ex: key=lambda!webp/images/image.jpg
    let match, requiredStyle, imageName;

    match = key.match(/^lambda!(.*?)\/(.*)/);
    if (!match) {
      callback(null, response);
      return;
    }

    requiredStyle = match[1];
    imageName = match[2];

    // only support styles
    if (!(requiredStyle in styles)) {
      callback(null, response);
      return;
    }

    let selectedStyle = styles[requiredStyle]
    let requiredFormat = selectedStyle.format;
    let originalKey = imageName;

    // get the source image file
    S3.getObject({ Bucket: BUCKET, Key: originalKey }).promise()
      // perform the resize operation
      .then(data => {
        let s = Sharp(data.Body)
          .rotate()
          //.sharpen()
        if (selectedStyle.resize) {
          s = s.resize(selectedStyle.resize)
        }
        return s
          .toFormat(requiredFormat, selectedStyle.formatOptions)
          .toBuffer()
      })
      .then(buffer => {
        // save the resized object to S3 bucket with appropriate object key.
        S3.putObject({
            Body: buffer,
            Bucket: BUCKET,
            ContentType: 'image/' + requiredFormat,
            //CacheControl: 'max-age=31536000',
            Key: key,
            StorageClass: 'STANDARD'
        }).promise()
        // even if there is exception in saving the object we send back the generated
        // image back to viewer below
        .catch(() => { console.log("Exception while writing resized image to bucket")});

        // generate a binary response with resized image
        response.status = 200;
        response.body = buffer.toString('base64');
        response.bodyEncoding = 'base64';
        response.headers['content-type'] = [{ key: 'Content-Type', value: 'image/' + requiredFormat }];
        callback(null, response);
      })
    .catch( err => {
      console.log("Exception while reading source image: %s", err.message);
      callback(null, response);
    });
  } // end of if block checking response statusCode
  else {
    // allow the response to pass through
    callback(null, response);
  }
};
