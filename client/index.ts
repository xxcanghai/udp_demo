import * as dgram from "dgram";
import * as net from "net";

const client: dgram.Socket = dgram.createSocket("udp4");

const CONFIG = {
    /** 最大发送数据长度 */
    MAX_SEND_LENGTH: 5000,
    /** 客户端绑定端口 */
    CLIENT_PORT: 3000,
    /** 每次发送的时间间隔，单位毫秒 */
    SEND_WAIT: 1,
}
const NOOP = () => { };

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


// 端口绑定成功后触发
client.on("listening", () => {
    const address = <net.AddressInfo>client.address();
    console.log(`UDP客户端已启动监听 ${address.address}:${address.port}`);
})

client.on("message",async (msg: Buffer, rinfo: dgram.RemoteInfo) => {
    console.log(`客户端接收到来自 ${rinfo.address}:${rinfo.port} 的 ${msg}`);
    await UDPSend("1".repeat(100), rinfo, sendCb);
    await UDPSend("1".repeat(2000), rinfo, sendCb);
    await UDPSend("1".repeat(30000), rinfo, sendCb);
    await UDPSend("1".repeat(400000), rinfo, sendCb);
    await UDPSend("1".repeat(5000000), rinfo, sendCb);
    await UDPSend("1".repeat(60000000), rinfo, sendCb);

    function sendCb(error: Error, bytes: number) {
        if (error) {
            console.error("发送失败！原因：", error);
        } else {
            console.log("发送成功，数据长度：", bytes)
        }
    }
});

client.on("error", (err: Error) => {
    console.log(`连接异常：\n${err.stack}`);
    client.close();
})

client.on("close", () => {
    console.log(`连接已关闭`);
})

client.bind(CONFIG.CLIENT_PORT);

async function UDPSend(data: string, rinfo: dgram.RemoteInfo, callback: (error: Error | null, bytes: number) => void = NOOP) {
    // 过大的UDP包进行拆包处理，分片发送
    if (data.length > CONFIG.MAX_SEND_LENGTH) {
        let dataArr: string[] = splitByLength(data, CONFIG.MAX_SEND_LENGTH);
        for (var index = 0; index < dataArr.length; index++) {
            let d = dataArr[index];
            let type: packType;
            if (index == 0) {
                // 添加“分割包头包”标志位
                type = packType.start;
            } else if (index == dataArr.length - 1) {
                // 添加“分割包尾包”标志位
                type = packType.end;
            } else {
                // 添加“分割包中间包”标志位
                type = packType.middle;
            }
            d = type + d;
            await sendWait(d, rinfo, (error: Error | null, bytes: number) => {
                if (error) {
                    throw error;
                }
                if (type == packType.end) {
                    return callback.call(this, error, data.length);
                }
            });
        }
    } else {
        // 添加 “未分割包” 标志位
        let fullData = packType.full + data;
        await sendWait(fullData, rinfo, (error: Error | null, bytes: number) => {
            if (error) {
                throw error;
            }
            return callback.call(this, error, data.length);
        });
    }
}


/** 延迟发送，解决UDP发送过快导致丢包问题 */
async function sendWait(sendData: string, rinfo: dgram.RemoteInfo, callback: (error: Error | null, bytes: number) => void = NOOP): Promise<string> {
    return new Promise((res, rej) => {
        setTimeout(function () {
            client.send(sendData, rinfo.port, rinfo.address, callback);
            res(sendData);
        }, CONFIG.SEND_WAIT);
    })
}

/**
 * 将字符串按指定长度分割成数组
 *
 * @param {string} str 原字符串
 * @param {number} length 要按照多长来分割
 * @returns {string[]}
 */
function splitByLength(str: string, length: number): string[] {
    var result: string[] = [];
    if (typeof str != "string") {
        throw new Error()
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
