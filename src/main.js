const core = require('@actions/core');
const aws = require('aws-sdk');
const s3 = new aws.S3();

const NODE_ENV = process.env['NODE_ENV'];

let input;
if (NODE_ENV != 'local') {
  input = {
    s3Bucket: core.getInput('s3-bucket', { required: true }),
    downloadBaseUrl: core.getInput('download-base-url', { required: true }),
    downloadDir: core.getInput('download-dir'),
    path: core.getInput('path', { required: true }),
    uploadQrCodeImage: core.getInput('upload-qr-code-image'),
  };
} else {
  input = {
    s3Bucket: '',
    downloadBaseUrl: '',
    downloadDir: 'abcdefg',
    path: './sample.txt',
    uploadQrCodeImage: 'true',
  };
}

async function run(input) {
  console.log(input.s3Bucket);
  console.log(input.downloadBaseUrl);
  console.log(input.downloadDir);
  console.log(input.path);
  console.log(input.uploadQrCodeImage);

  core.setOutput('download-url', 'hoge');
  core.setOutput('download-qr-url', 'fuga');
}

run(input)
  .then(result => {
    core.setOutput('result', 'success');
  })
  .catch(error => {
    core.setOutput('result', 'failure');
    core.setFailed(error.message);
  });
