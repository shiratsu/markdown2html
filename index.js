var AWS = require('aws-sdk')
var s3 = new AWS.S3()
var markdown = require('./node_modules/markdown');

exports.handler = async (event) => {
    console.log("*** start ***")

    // const bucket = 'document-indival'
    // var params = { Bucket: bucket }

    let bucketName = event.Records[0].s3.bucket.name;
    let srcKey     = event.Records[0].s3.object.key;
    let destKey    = srcKey.replace(/^.src\//, '').replace(/\.md$/, '.html');
    console.log(srcKey);
    console.log(bucketName);
    console.log(destKey);
    let srcData = await s3.getObject({
        Bucket: bucketName,
        Key:    event.Records[0].s3.object.key,
    }).promise();

    let markdownBody = (new Buffer(srcData.Body)).toString();
    console.log(markdownBody);

    let htmlBody = markdown.toHTML(markdownBody);

    let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Converted from s3://${bucketName}/${event.Records[0].s3.object.key}</title>
      </head>
      <body>
        ${htmlBody}
      </body>
    </html>
      `

    let destData = await s3.putObject({
        Bucket:      bucketName,
        Key:         destKey,
        Body:        html,
        ContentType: 'text/html',
    }).promise();

    return(destData);
};
