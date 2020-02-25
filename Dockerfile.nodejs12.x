FROM amazonlinux

WORKDIR /tmp
#install the dependencies
RUN yum -y install gcc-c++ && yum -y install findutils

RUN touch ~/.bashrc && chmod +x ~/.bashrc

RUN curl --location --output ns.rpm https://rpm.nodesource.com/pub_12.x/el/7/x86_64/nodejs-12.10.0-1nodesource.x86_64.rpm && \
    rpm --install --force ns.rpm && \
    npm install -g npm@latest && \
    npm cache clean --force && \
    yum clean all && \
    npm i -g nw-gyp && \
    rm --force ns.rpm

WORKDIR /build
