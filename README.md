# lambda

Amazon CloudFront Edge Scripts

## viewer-request

Transform URL `/<path>?lambda=style/<style>` to `/lambda!<style>/<path>` in viewer request function.

BTW, Invalidation path should be transformed URLs, like `/lambda!webp/*`.

## origin-response

Parse the URL with `/lambda!<style>/` prefix and convert source image to specified style image (save to Amazon S3 for future access directly).

### Style

- `avatar` (180x180, webp format)
- `avatar_jpg` (180x180, jpeg format)
- `webp` (webp format)

### MozJPEG support

Build mozjpeg on CentOS 7:

```sh
scl enable devtoolset-7 bash
cd /path/to/build
git clone https://github.com/mozilla/mozjpeg.git
cd mozjpeg
cmake -DPNG_SUPPORTED=0 -DWITH_JPEG8=1 -DCMAKE_INSTALL_PREFIX=/usr -DCMAKE_INSTALL_LIBDIR=/usr/lib64 .
make

# copy library
cp libjpeg.so.8.2.2 /path/to/lambda/lib/
```
