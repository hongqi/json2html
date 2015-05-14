# json2html
parse json to html as a part of self-create site

##用途
在线把 *json* 文件转化成用户可访问的页面, *json* 是用户在自主建站时生成的结果文件。所以 *json2html* 是为自主建站提供的服务

##使用

###1. 线下部署：

	$ cd json2html
	$ npm install
	$ npm install nodemon (建议使用nodemon)
	$ nodemon bin/www

###2. 线上部署：

	$ cd json2html
	$ npm install
	$ npm install pm2 (建议使用pm2)
	$ pm2 start bin/www --name "myapp"

###3. 调用服务：
	1. 发送post请求: 详见test下的postRequest.js
	2. 添加测试数据到test目录下面以{filename}.json命名，浏览器访问:	localhost:30001/json2html/{filename}即可预览
