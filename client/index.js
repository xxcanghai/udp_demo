"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var dgram = require("dgram");
var client = dgram.createSocket("udp4");
var CONFIG = {
    /** 最大发送数据长度 */
    MAX_SEND_LENGTH: 5000,
    /** 客户端绑定端口 */
    CLIENT_PORT: 3000,
    /** 每次发送的时间间隔，单位毫秒 */
    SEND_WAIT: 1
};
var NOOP = function () { };
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
// 端口绑定成功后触发
client.on("listening", function () {
    var address = client.address();
    console.log("UDP\u5BA2\u6237\u7AEF\u5DF2\u542F\u52A8\u76D1\u542C " + address.address + ":" + address.port);
});
client.on("message", function (msg, rinfo) { return __awaiter(_this, void 0, void 0, function () {
    function sendCb(error, bytes) {
        if (error) {
            console.error("发送失败！原因：", error);
        }
        else {
            console.log("发送成功，数据长度：", bytes);
        }
    }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("\u5BA2\u6237\u7AEF\u63A5\u6536\u5230\u6765\u81EA " + rinfo.address + ":" + rinfo.port + " \u7684 " + msg);
                return [4 /*yield*/, UDPSend("1".repeat(100), rinfo, sendCb)];
            case 1:
                _a.sent();
                return [4 /*yield*/, UDPSend("1".repeat(2000), rinfo, sendCb)];
            case 2:
                _a.sent();
                return [4 /*yield*/, UDPSend("1".repeat(30000), rinfo, sendCb)];
            case 3:
                _a.sent();
                return [4 /*yield*/, UDPSend("1".repeat(400000), rinfo, sendCb)];
            case 4:
                _a.sent();
                return [4 /*yield*/, UDPSend("1".repeat(5000000), rinfo, sendCb)];
            case 5:
                _a.sent();
                return [4 /*yield*/, UDPSend("1".repeat(60000000), rinfo, sendCb)];
            case 6:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
client.on("error", function (err) {
    console.log("\u8FDE\u63A5\u5F02\u5E38\uFF1A\n" + err.stack);
    client.close();
});
client.on("close", function () {
    console.log("\u8FDE\u63A5\u5DF2\u5173\u95ED");
});
client.bind(CONFIG.CLIENT_PORT);
function UDPSend(data, rinfo, callback) {
    if (callback === void 0) { callback = NOOP; }
    return __awaiter(this, void 0, void 0, function () {
        var dataArr, _loop_1, index, fullData;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(data.length > CONFIG.MAX_SEND_LENGTH)) return [3 /*break*/, 5];
                    dataArr = splitByLength(data, CONFIG.MAX_SEND_LENGTH);
                    _loop_1 = function () {
                        var d, type;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    d = dataArr[index];
                                    if (index == 0) {
                                        // 添加“分割包头包”标志位
                                        type = packType.start;
                                    }
                                    else if (index == dataArr.length - 1) {
                                        // 添加“分割包尾包”标志位
                                        type = packType.end;
                                    }
                                    else {
                                        // 添加“分割包中间包”标志位
                                        type = packType.middle;
                                    }
                                    d = type + d;
                                    return [4 /*yield*/, sendWait(d, rinfo, function (error, bytes) {
                                            if (error) {
                                                throw error;
                                            }
                                            if (type == packType.end) {
                                                return callback.call(_this, error, data.length);
                                            }
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < dataArr.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    index++;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    fullData = packType.full + data;
                    return [4 /*yield*/, sendWait(fullData, rinfo, function (error, bytes) {
                            if (error) {
                                throw error;
                            }
                            return callback.call(_this, error, data.length);
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
/** 延迟发送，解决UDP发送过快导致丢包问题 */
function sendWait(sendData, rinfo, callback) {
    if (callback === void 0) { callback = NOOP; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    setTimeout(function () {
                        client.send(sendData, rinfo.port, rinfo.address, callback);
                        res(sendData);
                    }, CONFIG.SEND_WAIT);
                })];
        });
    });
}
/**
 * 将字符串按指定长度分割成数组
 *
 * @param {string} str 原字符串
 * @param {number} length 要按照多长来分割
 * @returns {string[]}
 */
function splitByLength(str, length) {
    var result = [];
    if (typeof str != "string") {
        throw new Error();
    }
    if (str.length == 0) {
        return [str];
    }
    if (typeof length != "number" || length <= 0 || isNaN(length)) {
        length = str.length;
    }
    while (str.length > length) {
        result.push(str.substr(0, length));
        str = str.substr(length);
    }
    if (str.length > 0) {
        result.push(str);
    }
    return result;
}
//# sourceMappingURL=index.js.map