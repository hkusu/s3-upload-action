# S3 Upload Action

This is a GitHub Action to upload files to Amazon S3.

## Usage

```yaml
- uses: aws-actions/configure-aws-credentials@v0.1.0
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-northeast-1
- uses: hkusu/s3-upload-action@v0.1.0
  with:
    s3-bucket: my-bucket
    source-path: ./sample.txt
    destination-path: abcde/sample.txt
    download-base-url: http://my-bucket.s3-website-ap-northeast-1.amazonaws.com
    download-qr-image-path: abcde/qr.png
```

## License

MIT
