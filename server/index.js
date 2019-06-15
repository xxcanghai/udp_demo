"use strict";
exports.__esModule = true;
var dgram = require("dgram");
var server = dgram.createSocket("udp4");
var CONFIG = {
    SERVER_PORT: 0,
    CLIENT_PORT: 3000
};
/** UDP包头标志位 */
var packType;
(function (packType) {
    /** 完整包（小于最大发送数据包长度） */
    packType["full"] = "0";
    /** 分割包，开始 */
    packType["start"] = "1";
    /** 分割包，中间包 */
    packType["middle"] = "2";
    /** 分割包，结束 */
    packType["end"] = "3";
})(packType || (packType = {}));
/** 数据接收缓存 */
var receiveCache = "";
// 端口绑定成功后触发
server.on("listening", function () {
    var address = server.address();
    server.setBroadcast(true);
    server.setTTL(10);
    console.log("UDP\u670D\u52A1\u5668\u5DF2\u542F\u52A8\u76D1\u542C " + address.address + ":" + address.port);
    server.send("我是服务器", CONFIG.CLIENT_PORT, "255.255.255.255", function (error, bytes) {
        if (error) {
            console.error("发送失败！原因：", error);
        }
        else {
            console.log("发送成功，数据长度：", bytes);
        }
    });
});
server.on("message", function (msg, rinfo) {
    // console.log(`服务器接收到来自 ${rinfo.address}:${rinfo.port} 的 ${msg}`);
    // console.log(`服务器接收到来自 ${rinfo.address}:${rinfo.port} 的 ${msg.toString().substr(0,10)}`);
    var data = msg.toString();
    var type = data.substr(0, 1);
    data = data.substr(1);
    if (type == packType.full) {
        // 无操作，继续执行
    }
    else if (type == packType.start) {
        receiveCache = data;
        return;
    }
    else if (type == packType.middle) {
        receiveCache += data;
        return;
    }
    else if (type == packType.end) {
        data = receiveCache + data;
    }
    else {
        // throw new Error("数据包标志位错误")
        console.error("收到标志位错误的数据包:", data);
        return;
    }
    console.log("完整数据。长度：", data.length);
});
server.on("error", function (err) {
    console.log("\u670D\u52A1\u5668\u5F02\u5E38\uFF1A\n" + err.stack);
    server.close();
});
server.on("close", function () {
    console.log("\u670D\u52A1\u5668\u5DF2\u5173\u95ED");
});
//服务器采用随机端口
server.bind(CONFIG.SERVER_PORT);
//# sourceMappingURL=index.js.map