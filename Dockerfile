#FROM node:buster
FROM ubuntu:20.04
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \ 
        gnupg wget git build-essential cmake pkg-config unzip libgtk2.0-dev \
        curl ca-certificates libcurl4-openssl-dev libssl-dev \
        libavcodec-dev libavformat-dev libswscale-dev libtbb2 libtbb-dev \
        libjpeg-dev libpng-dev libtiff-dev libdc1394-22-dev \
        libprotobuf-dev protobuf-compiler libvulkan-dev vulkan-utils && \
        rm -rf /var/lib/apt/lists/*

######### opencv
ARG OPENCV_VERSION="4.8.0"
ENV OPENCV_VERSION $OPENCV_VERSION

RUN curl -Lo opencv.zip https://github.com/opencv/opencv/archive/${OPENCV_VERSION}.zip && \
            unzip -q opencv.zip && \
            curl -Lo opencv_contrib.zip https://github.com/opencv/opencv_contrib/archive/${OPENCV_VERSION}.zip && \
            unzip -q opencv_contrib.zip && \
            rm opencv.zip opencv_contrib.zip && \
            cd opencv-${OPENCV_VERSION} && \
            mkdir build && cd build && \
            cmake -D CMAKE_BUILD_TYPE=RELEASE \
                  -D WITH_IPP=OFF \
                  -D WITH_OPENGL=ON \
                  -D WITH_QT=OFF \
                  -D CMAKE_INSTALL_PREFIX=/usr/local \
                  -D OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib-${OPENCV_VERSION}/modules \
                  -D OPENCV_ENABLE_NONFREE=ON \
                  -D WITH_JASPER=OFF \
                  -D WITH_TBB=ON \
                  -D BUILD_DOCS=OFF \
                  -D BUILD_EXAMPLES=OFF \
                  -D BUILD_TESTS=OFF \
                  -D BUILD_PERF_TESTS=OFF \
                  -D BUILD_opencv_java=NO \
                  -D BUILD_opencv_python=NO \
                  -D BUILD_opencv_python2=NO \
                  -D BUILD_opencv_python3=NO \
                  -D OPENCV_GENERATE_PKGCONFIG=ON .. 
RUN cd opencv-${OPENCV_VERSION} && \
        cd build && \
        make -j $(nproc --all) && \
        make preinstall && make install && ldconfig && \
        cd / && rm -rf opencv*

############ nodejs
RUN mkdir /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg 
ENV NODE_MAJOR=20

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install nodejs -y


# Build the project.
WORKDIR /usr/src/app
ENV NODE_ENV=development
#RUN go build main.go
RUN git clone https://github.com/GhostNet-Dev/ghoststudio.git 

ARG DISABLE_CACHE
RUN cd ghoststudio && \
        git pull && \
        npm i -D typescript && npm install -g && \
        npx tsc -p tsconfig-web.json


WORKDIR /usr/src/app/ghoststudio
ENV NODE_ENV=production
CMD ["npx", "babel-node", "./dist/server.js"]
