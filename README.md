# crawler_keywords
百度/搜狗关键字爬虫

### 普通方式运行 ###
#### 数据库 ####
1. 安装MongoDB

```
yum install mongodb mongodb-server
```

2. 运行MongoDB

```
service mongod start
```

#### 运行服务端 ####
1. 目录下config -> db 配置对应的mongodb链接

2. 安装依赖
```
cd server
yarn
yarn run dev
```

#### 运行前端 ####

```
cd front
yarn
yarn run start
```

### Docker方式运行 ###

```
docker build -t crawler .
docker run -d -p 7001:7001 -p 7000:80 crawler
```


### 注意事项 ###

1. 如果配置不够高，请谨慎开启一个关键字一个进程
