var crypto = require("crypto");
module.exports = function(mima) {
		var md5 = crypto.createHash("md5");
		var password = md5.update(mima).digest("base64");
		return password;
}
