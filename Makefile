.PHONY: all image install package rebuild-sharp dist update-zip-content clean-files remove-docker-image

all: image install package rebuild-sharp dist update-zip-content clean-files

image:
	docker build --tag lambci/lambda:build-nodejs10.10 .

origin-response:
	docker run --rm --volume ${PWD}/lambda/origin-response-function:/build lambci/lambda:build-nodejs10.10 /bin/bash -c "source ~/.bashrc; rm -rf node_modules package.json*; npm init -f -y; npm install querystring sharp --save; npm install --only=prod"
	# mozjpeg
	cp lambda/libs/libjpeg.so.8.2.2 lambda/origin-response-function/node_modules/sharp/vendor/lib/
	mkdir -p dist && cd lambda/origin-response-function && zip -FS -q -r ../../dist/origin-response-function.zip * && cd ../..

viewer-request:
	docker run --rm --volume ${PWD}/lambda/viewer-request-function:/build lambci/lambda:build-nodejs10.10 /bin/bash -c "source ~/.bashrc; rm -rf node_modules package.json*; npm init -f -y; npm install querystring --save; npm install --only=prod"
	mkdir -p dist && cd lambda/viewer-request-function && zip -FS -q -r ../../dist/viewer-request-function.zip * && cd ../..
