# S3 Upload Action

This is a GitHub Action to upload files to Amazon S3.

## Usage

```yaml
- uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-northeast-1
- uses: hkusu/s3-upload-action@v1
  id: upload
  with:
    s3-bucket: my-bucket
    source-path: ./sample.txt
    destination-path: my-dir/sample.txt
    download-base-url: http://my-bucket.s3-website-ap-northeast-1.amazonaws.com # option
    download-qr-path: my-dir/qr.png # option. If specified, it will be created on S3
    download-qr-width: 180 # option(default: 120). Specify 100 to 1000
- name: Show download URL
  run: |
    echo '${{ steps.upload.outputs.download-url }}' # if 'download-base-url' is specified
    echo '${{ steps.upload.outputs.download-qr-url }}' # if 'download-base-url' and `download-qr-path` is specified
```

### Result of action

Use `result` outputs.

```yaml
- uses: hkusu/s3-upload-action@v1
  id: upload
  with:
    s3-bucket: my-bucket
    source-path: ./sample.txt
    destination-path: my-dir/sample.txt
- name: Show result
  if: always()
  run: echo '${{ steps.upload.outputs.result }}' # success or failure
```

## License

MIT
