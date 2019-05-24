
var express = require("express");
var db = require("./models/db.js");
var ObjectId = require("mongodb").ObjectId;
var session = require("express-session");
var md = require("./models/md5.js");
var app = express();
var path = require("path");
var fs=require("fs");
var formidable = require("formidable");
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(session({
	secret: "keyboard cat",
	resave: false,
	saveUninitialized: true
}));
app.get("/", function(req, res, next) { //登录后进入留言页面
	req.session.name = "";
	req.session.password = "";
	req.session.login = false;
	res.render("login");
	next();
})
app.get("/liu", function(req, res, next) { //渲染留言页面
	res.render("index");
	next();
})
app.post("/tijiao", function(req, res, next) { //提交留言
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fileds) {
		db.insert("test", "liuyan", {
			"name": fileds.name,
			"text": fileds.text,
			"shijian": new Date(),
			"username": req.session.name
		}, function(err, result) {
			if(err) {
				res.json("-1");
				return;
			}
			res.json("1");
			next();
		})
	})
});
app.post("/du", function(req, res) { //显示默认页留言
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fileds) {
		db.find("test", "liuyan", {
			"name": req.session.name
		}, function(err, result, num) {
			res.render("chakan", {
				"result": result,
				"num": Math.ceil(num / 3),
				"username":req.session.name
			});
		}, {
			"a": 3,
			"b": 0
		})
	})
});
app.get("/du", function(req, res) { //显示默认页留言
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fileds) {
		db.find("test", "liuyan", {
			"name": req.session.name
		}, function(err, result, num) {
			res.render("chakan", {
				"result": result,
				"num": Math.ceil(num / 3),
				"username":req.session.name
			});
		}, {
			"a": 3,
			"b": 0
		})
	})
});
app.get("/liuyan", function(req, res) { //显示默认页留言
	res.render("index");
});
app.post("/judu", function(req, res, next) { //显示分页留言
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fileds) {
		var page = parseInt(fileds.page);
		db.find("test", "liuyan", {
			"name": req.session.name
		}, function(err, result, num) {
			var num = result.length;
			//			res.render("chakan", {
			//				"result": result,
			//				"num":Math.ceil(num/3)
			//			});
			res.json(result);
		}, {
			"a": 3,
			"b": page - 1
		})
	})
});
app.get("/shan", function(req, res, next) { //删除留言
	var id = req.query.id;
	db.delete("test", "liuyan", {
		"_id": ObjectId(id)
	}, function(err, result) {
		res.render("shan", {
			"str": "数据删除成功",
			"name":req.session.username
		})
	})
});
app.get("/zhuce", function(req, res) { //渲染注册页面
	res.render("zhuce");
});
app.post("/zhuce", function(req, res) { //验证注册
	var form = new formidable.IncomingForm();
	form.uploadDir = "public/images";
	form.parse(req, function(err, fileds, files) {
		db.find("test", "user", {
			"name": fileds.name
		}, function(err, result) {
			if(result.length == 0) {
				var oldpath = files.tupian.path;
				var newpath = path.normalize("public/images/" + fileds.name+".jpg");
				fs.rename(oldpath, newpath, function(err) {
					if(err) {
						res.send("改名失败");
						return;
					}
				})
				db.insert("test", "user", {
					"name": fileds.name,
					"password": md(fileds.mima),
					"tupian": newpath
				}, function(err, result) {
					if(err) {
						res.send("注册失败");
						return;
					}
					res.render("login");
				})
			} else {
				res.send("用户已存在，注册失败");
			}
		});
	})
});
app.get("/zhuce", function(req, res, next) { //渲染注册页面
	res.render("zhuce");
	next();
});
app.post("/checklogin", function(req, res) { //验证登录
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fileds) {
		db.find("test", "user", {
			"name": fileds.name
		}, function(err, result) {
			if(result.length == 0) {
				res.json("用户名不存在");
				return;
			}
			var password = result[0].password;
			if(md(fileds.password) == password) {
				req.session.name = fileds.name;
				req.session.login = true;
				req.session.password = fileds.password;
				res.json("1");
			} else {
				res.json("密码错误");
			}
		})
	})
});
app.listen(3000, "127.0.0.1");
