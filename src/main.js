const core = require('@actions/core');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const qr = require('qrcode');

const NODE_ENV = process.env['NODE_ENV'];

// If you want to run it locally, set the environment variables like `$ export SOME_KEY=<your token>`
const AWS_ACCESS_KEY_ID = process.env['AWS_ACCESS_KEY_ID'];
const AWS_SECRET_ACCESS_KEY = process.env['AWS_SECRET_ACCESS_KEY'];
const AWS_BUCKET = process.env['AWS_BUCKET'];

let input;
if (NODE_ENV != 'local') {
  input = {
    awsAccessKeyId: core.getInput('aws-access-key-id', { required: true }),
    awsSecretAccessKey: core.getInput('aws-secret-access-key', { required: true }),
    awsRegion: core.getInput('aws-region', { required: true }),
    awsBucket: core.getInput('aws-bucket', { required: true }),
    filePath: core.getInput('file-path', { required: true }),
    contentType: core.getInput('content-type'),
    destinationDir: core.getInput('destination-dir'),
    private: core.getInput('private'),
    outputUrl: core.getInput('output-url'),
    expire: core.getInput('expire'),
    createQr: core.getInput('create-qr'),
    qrWidth: core.getInput('qr-width'),
    bucketRoot: core.getInput('bucket-root'),
  };
} else {
  input = {
    awsAccessKeyId: AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: AWS_SECRET_ACCESS_KEY,
    awsRegion: 'ap-northeast-1',
    awsBucket: AWS_BUCKET,
    filePath: './README.md',
    contentType: '',
    destinationDir: '',
    private: 'true',
    outputUrl: 'true',
    expire: '180',
    createQr: 'true',
    qrWidth: '120',
    bucketRoot: 'artifacts',
  };
}

aws.config.update({
  accessKeyId: input.awsAccessKeyId,
  secretAccessKey: input.awsSecretAccessKey,
  region: input.awsRegion,
});

const s3 = new aws.S3({signatureVersion: 'v4'});

async function run(input) {

  const expire = parseInt(input.expire);
  if (!expire | expire < 0 | 604800 < expire) {
    throw new Error('"expire" input should be a number between 0 and 604800.');
  }

  const qrWidth = parseInt(input.qrWidth);
  if (!qrWidth | qrWidth < 100 | 1000 < qrWidth) {
    throw new Error('"qr-width" input should be a number between 100 and 1000.');
  }

  let bucketRoot = input.bucketRoot;
  if (bucketRoot) {
    if (bucketRoot.startsWith('/')) {
      bucketRoot = bucketRoot.slice(1);
    }
    if (bucketRoot && !bucketRoot.endsWith('/')) {
      bucketRoot = bucketRoot + '/'
    }
  }

  let destinationDir = input.destinationDir;
  if (destinationDir) {
    if (destinationDir.startsWith('/')) {
      destinationDir = destinationDir.slice(1);
    }
    if (destinationDir && !destinationDir.endsWith('/')) {
      destinationDir = destinationDir + '/'
    }
  } else {
    destinationDir = getRandomStr(32) + '/';
  }

  const fileKey = bucketRoot + destinationDir + path.basename(input.filePath);

  let acl;
  if (input.private == 'true') {
    acl = 'private';
  } else {
    acl = 'public-read';
  }

  let params = {
    Bucket: input.awsBucket,
    Key: fileKey,
    ContentType: input.contentType,
    Body: fs.readFileSync(input.filePath),
    ACL: acl,
  };
  await s3.putObject(params).promise();

  let fileUrl;
  if (input.outputUrl == 'true' || input.createQr == 'true') {
    if (input.private != 'false') {
      params = {
        Bucket: input.awsBucket,
        Key: fileKey,
        Expires: expire,
      };
      fileUrl = await s3.getSignedUrlPromise('getObject', params);
    } else {
      fileUrl = `https://${input.awsBucket}.s3-${input.awsRegion}.amazonaws.com/${fileKey}`;
    }
    if (input.outputUrl == 'true') {
      core.setOutput('file-url', fileUrl);
    }
  }

  if (input.createQr != 'true') return;

  const qrKey = bucketRoot + destinationDir + 'qr.png';
  const tmpQrFile = './s3-upload-action-qr.png';

  await qr.toFile(tmpQrFile, fileUrl, { width: qrWidth })

  params = {
    Bucket: input.awsBucket,
    Key: qrKey,
    ContentType: 'image/png', // Required to display as an image in the browser
    Body: fs.readFileSync(tmpQrFile),
    ACL: acl,
  };
  await s3.putObject(params).promise();
  fs.unlinkSync(tmpQrFile);

  if (input.outputUrl == 'true') {
    let qrUrl;
    if (input.private != 'false') {
      params = {
        Bucket: input.awsBucket,
        Key: qrKey,
        Expires: expire,
      };
      qrUrl = await s3.getSignedUrlPromise('getObject', params);
    } else {
      qrUrl = `https://${input.awsBucket}.s3-${input.awsRegion}.amazonaws.com/${qrKey}`;
    }
    core.setOutput('qr-url', qrUrl);
  }
}

run(input)
  .then(result => {
    core.setOutput('result', 'success');
  })
  .catch(error => {
    core.setOutput('result', 'failure');
    core.setFailed(error.message);
  });

function getRandomStr(length) {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
  let r = '';
  for(let i = 0; i < length; i++) {
    r += c[Math.floor(Math.random() * c.length)];
  }
  return r;
}
