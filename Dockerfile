FROM centos:latest

COPY ./server /usr/local/server
COPY ./front /usr/local/front
# centos安装必备的环境
RUN rpm --rebuilddb;yum install nc make wget tar gzip passwd openssh-server gcc pcre-devel openssl-devel net-tools vim -y
# 安装mongodb
COPY ./mongodb-org-4.0.repo /etc/yum.repos.d/mongodb-org-4.0.repo
RUN mkdir -p /data/db && \
    mkdir -p /data/data && \
    mkdir -p /data/log && \
    yum install -y mongodb-org
# 在线获取nginx压缩包
RUN wget http://nginx.org/download/nginx-1.19.6.tar.gz
# 解压到当前目录
RUN tar -zxvf nginx-1.19.6.tar.gz
# 设置环境
WORKDIR nginx-1.19.6
# 配置nginx
# 设置软连接 直接nginx即可启动
RUN ./configure --prefix=/usr/local/nginx && make && make install && ln -s /usr/local/nginx/sbin/nginx /usr/sbin/
# 替换默认配置文件
COPY ./nginx.conf /usr/local/nginx/conf
# 安装nodejs
RUN curl --silent --location https://rpm.nodesource.com/setup_14.x | bash -
RUN yum -y install nodejs
# 安装yarn
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN yum -y install yarn && \
    yarn config set registry https://registry.npm.taobao.org
# front
WORKDIR /usr/local/front
RUN yarn && yarn run build
WORKDIR /usr/local/front/dist
RUN mv -f * /usr/local/nginx/html/
# server
WORKDIR /usr/local/server
RUN yarn
CMD nginx && mongod --dbpath=/data/db --fork --logpath=/data/log/mongodb.log && yarn start 
# 删除yum的缓存源码包
RUN yum clean all && \
    rm -rf /var/cache/yum/*
EXPOSE 7001 7000
