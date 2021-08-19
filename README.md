# S3 Upload Action

This is a GitHub Action that uploads a file to Amazon S3.
Uploaded files can be accessed via HTTP (Use [presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) for private s3 buckets).
Currently, only single file upload is supported.

## Inputs

| Name | Description | Default |
| --- | --- | --- |
| `aws-access-key-id` | (Required) Your AWS access key ID. | |
| `aws-secret-access-key` | (Required) Your AWS secret access key. | |
| `aws-region` | (Required) Region where the bucket is located. | |
| `aws-bucket` | (Required) S3 bucket to upload files. | |
| `file-path` | (Required) Path of the file to upload, eg `./myfile.txt` | |
| `destination-dir` | Directory on the bucket to upload files. If not set, 32 random alphanumeric characters will be applied. If you don't want to apply anything, specify `/`. | 32 random characters |
| `output-url` | Add the URL of the file to the output of this action. | `false` |
| `private` | If `true` is specified, [ACL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/acl-overview.html#canned-acl) is set to 'private' and presigned URL is used. Basically should be `true` for private buckets. | `true` |
| `expire` | Expiration seconds for presigned URL. Specify `0` to `86400`(1 week). | `86400` |
| `content-type` | Specify the contents of the 'Content-type' header when downloading the file, eg `image/png`. | |
| `create-qr` | Create a QR code image for the URL of the file. Useful for mobile devices. The URL of the QR code image will be added to the output of this action. | `false` |
| `qr-width` | QR code image width pixels. Specify `100` to `1000`. | `120` |
| `bucket-root` | Root directory on the bucket to upload files. If you don't want to apply anything, specify `/`. | `artifacts` |

## Outputs

| Name | Description |
| --- | --- |
| `result` | Result of this action. `success` or `failure` is set. |
| `file-url` | URL of the uploaded file. |
| `qr-url` | URL of the created QR code image. |

## Usage

### Basic usage

```yaml
- uses: hkusu/s3-upload-action@v2
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: 'ap-northeast-1'
    aws-bucket: ${{ secrets.AWS_BUCKET }}
    file-path: './myfile.txt'
```

In this example, `myfile.txt` is stored in `artifacts/<32 random characters>/myfile.txt` on the bucket.
Specify `destination-dir` input or `bucket-root` input to change the destination.

### URL of the uploaded file

Use `file-url` output.

```yaml
- uses: hkusu/s3-upload-action@v2
  id: upload # specify some ID for use in subsequent steps
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: 'ap-northeast-1'
    aws-bucket: ${{ secrets.AWS_BUCKET }}
    file-path: './myfile.txt'
    output-url: 'true' # specify this
- name: Show URL
  run: echo '${{ steps.upload.outputs.file-url }}' # use this output
```

When uploading an image and displaying it on a browser, specify `image/png` etc. for `content-type` input.
For Android apk file, you can install it on your device by specifying `application/vnd.android.package-archive`.

### URL of the created QR code image

Use `qr-url` output.

```yaml
- uses: hkusu/s3-upload-action@v2
  id: upload
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: 'ap-northeast-1'
    aws-bucket: ${{ secrets.AWS_BUCKET }}
    file-path: './myfile.txt'
    output-url: 'true'
    create-qr: 'true' # specify this
- name: Show URL
  run: echo '${{ steps.upload.outputs.qr-url }}' # use this output
```

Specify `qr-width` input to change the size of the QR code image.

QR code image sample:

![image](doc/qr.png)

## License

[MIT](LICENSE)
