const core = require('@actions/core');
const aws = require('aws-sdk');
const s3 = new aws.S3();
const fs = require('fs');
const path = require('path');
const qr = require('qrcode');

// If you want to run it locally, prepare a credential file
// ref: https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html

const NODE_ENV = process.env['NODE_ENV'];

let input;
if (NODE_ENV != 'local') {
  input = {
    s3Bucket: core.getInput('s3-bucket', { required: true }),
    sourcePath: core.getInput('source-path', { required: true }),
    destinationPath: core.getInput('destination-path', { required: true }),
    downloadBaseUrl: core.getInput('download-base-url'),
    downloadQrPath: core.getInput('download-qr-path'),
    downloadQrWidth: core.getInput('download-qr-width', { required: true }),
  };
} else {
  input = {
    s3Bucket: 'my-bucket',
    sourcePath: './sample.txt',
    destinationPath: 'abcdef/sample.txt',
    downloadBaseUrl: 'http://my-bucket.s3-website-ap-northeast-1.amazonaws.com',
    downloadQrPath: 'abcdef/qr.png',
    downloadQrWidth: '120',
  };
}

async function run(input) {

  if (path.isAbsolute(input.destinationPath)) {
    throw new Error('"destinationPath" should be a relative path.');
  }

  if (input.destinationPath.endsWith('/')) {
    throw new Error('"destinationPath" should be a file.');
  }

  if (input.downloadBaseUrl) {
    if (!input.downloadBaseUrl.startsWith('http://') && !input.downloadBaseUrl.startsWith('http://')) {
      throw new Error('"downloadBaseUrl" should be a URL.');
    }
    if (!input.downloadBaseUrl.endsWith('/')) {
      input.downloadBaseUrl = input.downloadBaseUrl + '/'
    }
  }

  if (input.downloadQrPath) {
    if (path.isAbsolute(input.downloadQrPath)) {
      throw new Error('"downloadQrPath" should be a relative path.');
    }
    if (!input.downloadQrPath.endsWith('.png')) {
      throw new Error('"downloadQrPath" should be a png file.');
    }
  }

  const downloadQrWidth = parseInt(input.downloadQrWidth);

  if (!downloadQrWidth | downloadQrWidth < 100 | 1000 < downloadQrWidth) {
    throw new Error('"downloadQrWidth" should be a number between 100 and 1000.');
  }

  const params = {
    Bucket: input.s3Bucket,
    Key: input.destinationPath,
    Body: fs.readFileSync(input.sourcePath),
  };
  await s3.putObject(params).promise();

  if (input.downloadBaseUrl) {
    core.setOutput('download-url', input.downloadBaseUrl + input.destinationPath);
    if (input.downloadQrPath) {
      await qr.toFile('./s3-upload-action-tmp.png', input.downloadBaseUrl + input.destinationPath, { width: downloadQrWidth })
      const params = {
        Bucket: input.s3Bucket,
        Key: input.downloadQrPath,
        Body: fs.readFileSync('./s3-upload-action-tmp.png'),
      };
      await s3.putObject(params).promise();
      fs.unlinkSync('./s3-upload-action-tmp.png');
      core.setOutput('download-qr-url', input.downloadBaseUrl + input.downloadQrPath);
    }
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
