import * as dgram from "dgram";
import * as net from "net";

const server: dgram.Socket = dgram.createSocket("udp4");

const CONFIG = {
    SERVER_PORT: 0,//设置为0则为随机端口
    CLIENT_PORT: 3000,
}

/** UDP包头标志位 */
enum packType {
    /** 完整包（小于最大发送数据包长度） */
    full = "0",
    /** 分割包，开始 */
    start = "1",
    /** 分割包，中间包 */
    middle = "2",
    /** 分割包，结束 */
    end = "3"
}

/** 数据接收缓存 */
var receiveCache: string = "";

// 端口绑定成功后触发
server.on("listening", () => {
    const address = <net.AddressInfo>server.address();
    server.setBroadcast(true);
    server.setTTL(10);
    console.log(`UDP服务器已启动监听 ${address.address}:${address.port}`);
    server.send("我是服务器", CONFIG.CLIENT_PORT, "255.255.255.255", (error: Error, bytes: number) => {
        if (error) {
            console.error("发送失败！原因：", error);
        } else {
            console.log("发送成功，数据长度：", bytes)
        }
    })
})

server.on("message", (msg: Buffer, rinfo: dgram.RemoteInfo) => {
    // console.log(`服务器接收到来自 ${rinfo.address}:${rinfo.port} 的 ${msg}`);
    // console.log(`服务器接收到来自 ${rinfo.address}:${rinfo.port} 的 ${msg.toString().substr(0,10)}`);
    var data: string = msg.toString();
    var type = data.substr(0, 1);
    data = data.substr(1);

    if (type == packType.full) {
        // 无操作，继续执行
    } else if (type == packType.start) {
        receiveCache = data;
        return;
    } else if (type == packType.middle) {
        receiveCache += data;
        return;
    } else if (type == packType.end) {
        data = receiveCache + data;
    } else {
        // throw new Error("数据包标志位错误")
        console.error("收到标志位错误的数据包:", data);
        return;
    }

    console.log("完整数据。长度：", data.length)
});

server.on("error", (err: Error) => {
    console.log(`服务器异常：\n${err.stack}`);
    server.close();
})

server.on("close", () => {
    console.log(`服务器已关闭`);
})

//服务器采用随机端口
server.bind(CONFIG.SERVER_PORT);