'use strict';

const querystring = require('querystring');

// defines the allowed dimensions, default dimensions and how much variance from allowed
// dimension is allowed.

const variables = {
    allowedExtensions: [ 'bmp', 'gif', 'jpeg', 'jpg', 'png' ],
    allowedStyle: [ 'webp', 'avatar', 'avatar_jpg' ],
};

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;

    // parse the querystrings key-value pairs. In our case it would be lambda=style/webp
    const params = querystring.parse(request.querystring);

    // fetch the uri of original image
    let fwdUri = request.uri;

    // if there is no lambda attribute, just pass the request
    if (!params.lambda) {
        callback(null, request);
        return;
    }

    let style, extension, imageName;

    // parse the style from query string
    let match = params.lambda.match(/^style\/(.+)$/);
    if (!match) {
        callback(null, request);
        return;
    }
    style = match[1]

    // parse the url filename extension
    // In our case /images/image.jpg
    match = fwdUri.match(/^\/(.*\.([a-z]+))$/);
    if (!match) {
        callback(null, request);
        return;
    }
    imageName = match[1]
    extension = match[2]

    // if there is no allowed style or extension attribute, just pass the request
    if (!variables.allowedStyle.includes(style) || !variables.allowedExtensions.includes(extension)) {
        callback(null, request);
        return;
    }
   
    // build the new uri to be forwarded upstream
    fwdUri = '/lambda!' + style + '/' + imageName;

    // final modified url is of format /lambda!webp/images/image.jpg
    request.uri = fwdUri;
    request.querystring = '';
    callback(null, request);
};
