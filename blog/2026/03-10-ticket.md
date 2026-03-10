---
title: 购票 App 网络协议交互分析与合规自动化测试实现
description: 仅供学习交流
tags: [python, other]
passwordHash: "499c80fbd9616238cebd40305d80591e4b568970ca6afa67e144603a9ea149b0"
passwordSalt: "111c7b618618b423d7eb16ffe76c9864"
passwordIterations: 120000
passwordHint: "VX"
---


# app抢票脚本编写教程（协议层实现）

## 前言

仅供学习交流，协议层比自动化框架快10-100倍。不依赖UI渲染，直接与服务器对话

<!-- truncate -->

## 第一步：环境搭建

**工具准备：**
- Charles / Fiddler（抓包工具）
- Python 3.8+
- VS Code 或任意IDE
- 手机（已root更佳，非root可用HttpCanary）

**Python依赖：**
```
pip install requests pycryptodome protobuf
```

---

## 第二步：抓取购票协议

**操作流程：**

1. 手机配置代理指向电脑IP:8888
2. Charles安装证书到手机
3. 打开购票APP，正常走一遍购票流程（选票 → 下单 → 支付前停止）
4. Charles中筛选目标域名，找到关键接口

**需要识别的核心接口：**
- 查询余票接口
- 创建订单接口
- 获取token/签名接口

**记录每个接口的：**
- URL完整路径
- 请求方法（POST/GET）
- Headers（特别是User-Agent、证书固定相关的头）
- 请求体格式和内容
- 响应体格式

---

## 第三步：分析请求签名机制

大多数票务平台有签名防护，需要逆向分析。

**常见签名位置：**
- URL参数中的`sign`、`token`
- Header中的`X-Sign`、`Authorization`
- Body中的加密字段

**逆向方法：**

1. **APK反编译**
```
jadx-gui ticket_app.apk
```
搜索关键词：`sign`、`encrypt`、`md5`、`hmac`

2. **定位签名函数**
```java
// 常见模式
public static String getSign(Map<String, String> params) {
    String sorted = sortParams(params);
    return MD5(sorted + SECRET_KEY);
}
```

3. **用Python复现签名逻辑**
```python
import hashlib
import hmac

def generate_sign(params: dict, secret: str) -> str:
    sorted_params = ''.join(f'{k}{v}' for k, v in sorted(params.items()))
    sign = hmac.new(secret.encode(), sorted_params.encode(), hashlib.sha256).hexdigest()
    return sign
```

---

## 第四步：编写请求封装类

```python
import requests
import time
import json
from typing import Optional

class TicketClient:
    def __init__(self):
        self.session = requests.Session()
        self.base_url = "https://api.ticket-platform.com"
        self.headers = {
            "User-Agent": "TicketApp/5.2.1 (Android 12; Pixel 6)",
            "Content-Type": "application/json",
            "Accept": "application/json",
            # 从抓包获取
            "X-Device-Id": "your_device_id_here",
            "X-Version": "5.2.1"
        }
        
    def _request(self, method: str, endpoint: str, 
                 params: dict = None, data: dict = None) -> dict:
        url = f"{self.base_url}{endpoint}"
        
        # 添加签名
        sign_data = {**(params or {}), **(data or {}), "timestamp": int(time.time()*1000)}
        self.headers["X-Sign"] = generate_sign(sign_data, self.secret_key)
        
        resp = self.session.request(
            method=method,
            url=url,
            params=params,
            json=data,
            headers=self.headers,
            timeout=10
        )
        return resp.json()
    
    def query_tickets(self, event_id: str, seat_type: str) -> dict:
        """查询余票"""
        return self._request("GET", "/api/ticket/query", params={
            "eventId": event_id,
            "seatType": seat_type
        })
    
    def create_order(self, event_id: str, seat_id: str, 
                     ticket_num: int, user_token: str) -> dict:
        """创建订单"""
        self.headers["Authorization"] = f"Bearer {user_token}"
        return self._request("POST", "/api/order/create", data={
            "eventId": event_id,
            "seatId": seat_id,
            "ticketNum": ticket_num,
            "payType": 1
        })
```

---

## 第五步：实现抢票逻辑

```python
import threading
import random
from datetime import datetime

class TicketBot:
    def __init__(self, client: TicketClient):
        self.client = client
        self.running = False
        self.event_id = None
        self.seat_type = None
        self.ticket_num = 1
        self.user_token = None
        
    def set_target(self, event_id: str, seat_type: str, 
                   ticket_num: int, user_token: str):
        self.event_id = event_id
        self.seat_type = seat_type
        self.ticket_num = ticket_num
        self.user_token = user_token
    
    def check_availability(self) -> Optional[dict]:
        """检查余票，返回可用座位"""
        try:
            result = self.client.query_tickets(self.event_id, self.seat_type)
            if result.get("code") == 200:
                seats = result.get("data", {}).get("seats", [])
                available = [s for s in seats if s.get("status") == 1 and s.get("stock", 0) > 0]
                return available[0] if available else None
        except Exception as e:
            print(f"[错误] 查询失败: {e}")
        return None
    
    def try_purchase(self, seat: dict) -> bool:
        """尝试下单"""
        try:
            result = self.client.create_order(
                event_id=self.event_id,
                seat_id=seat["id"],
                ticket_num=self.ticket_num,
                user_token=self.user_token
            )
            if result.get("code") == 200:
                print(f"[成功] 订单创建成功! 订单号: {result['data']['orderId']}")
                return True
            else:
                print(f"[失败] {result.get('msg', '未知错误')}")
        except Exception as e:
            print(f"[异常] 下单失败: {e}")
        return False
    
    def run_single_thread(self):
        """单线程抢票"""
        self.running = True
        attempt = 0
        
        while self.running:
            attempt += 1
            print(f"\r[尝试 #{attempt}] 查询中...", end="", flush=True)
            
            seat = self.check_availability()
            if seat:
                print(f"\n[发现] 检测到余票: {seat.get('name')}")
                if self.try_purchase(seat):
                    self.running = False
                    break
            
            # 随机延迟，避免触发风控
            time.sleep(random.uniform(0.5, 1.5))
    
    def run_multi_thread(self, thread_count: int = 5):
        """多线程抢票"""
        self.running = True
        threads = []
        
        for i in range(thread_count):
            t = threading.Thread(target=self.run_single_thread, name=f"Worker-{i+1}")
            t.daemon = True
            t.start()
            threads.append(t)
        
        for t in threads:
            t.join()

# 使用示例
if __name__ == "__main__":
    client = TicketClient()
    client.secret_key = "从逆向得到的密钥"
    
    bot = TicketBot(client)
    bot.set_target(
        event_id="EVENT123456",
        seat_type="VIP",
        ticket_num=2,
        user_token="你的登录token"
    )
    
    # 设置开抢时间（可选）
    start_time = datetime(2024, 12, 25, 10, 0, 0)
    
    print(f"等待开抢时间: {start_time}")
    while datetime.now() < start_time:
        time.sleep(0.1)
    
    print("开始抢票!")
    bot.run_multi_thread(5)
```

---

## 第六步：处理Protobuf协议（如适用）

部分APP使用Protobuf传输数据，需要额外处理。

**获取.proto文件：**
```
# 从APK中提取
unzip -p app.apk assets/*.proto > extracted.proto
```

**或手动逆向生成：**
```protobuf
syntax = "proto3";

message TicketQuery {
    string event_id = 1;
    string seat_type = 2;
    int64 timestamp = 3;
}

message TicketResponse {
    int32 code = 1;
    string msg = 2;
    repeated Seat seats = 3;
}

message Seat {
    string id = 1;
    string name = 2;
    int32 stock = 3;
    int32 status = 4;
}
```

**Python集成：**
```python
import ticket_pb2  # 编译后的protobuf文件

def query_protobuf(client: TicketClient, event_id: str) -> dict:
    query = ticket_pb2.TicketQuery()
    query.event_id = event_id
    query.seat_type = "VIP"
    query.timestamp = int(time.time() * 1000)
    
    resp = client.session.post(
        f"{client.base_url}/api/ticket/query",
        data=query.SerializeToString(),
        headers={**client.headers, "Content-Type": "application/x-protobuf"}
    )
    
    result = ticket_pb2.TicketResponse()
    result.ParseFromString(resp.content)
    return {
        "code": result.code,
        "msg": result.msg,
        "seats": [{"id": s.id, "name": s.name, "stock": s.stock} for s in result.seats]
    }
```

---

## 第七步：绕过风控检测

**常见风控点及对策：**

| 检测项 | 绕过方法 |
|--------|----------|
| IP频率限制 | 代理池轮换 |
| 设备指纹 | 随机化Device-ID |
| 行为检测 | 随机化请求间隔 |
| 证书固定 | Frida Hook / 反编译修改 |
| 时间戳校验 | 同步服务器时间 |

**代理池集成：**
```python
class ProxyManager:
    def __init__(self, proxy_file: str):
        with open(proxy_file) as f:
            self.proxies = [line.strip() for line in f if line.strip()]
        self.index = 0
    
    def get_proxy(self) -> dict:
        proxy = self.proxies[self.index % len(self.proxies)]
        self.index += 1
        return {"http": f"http://{proxy}", "https": f"http://{proxy}"}
    
    def rotate_proxy(self, session: requests.Session):
        session.proxies.update(self.get_proxy())

# 使用
proxy_mgr = ProxyManager("proxies.txt")
client.session.proxies = proxy_mgr.get_proxy()
```

---

## 第八步：登录态维护

```python
class AuthManager:
    def __init__(self, client: TicketClient):
        self.client = client
        self.token = None
        self.refresh_token = None
        self.expire_time = None
    
    def login_with_password(self, phone: str, password: str) -> bool:
        # 登录逻辑，可能需要验证码处理
        # 根据具体平台实现
        pass
    
    def login_with_token(self, token: str, refresh_token: str):
        """从本地文件恢复登录态"""
        self.token = token
        self.refresh_token = refresh_token
        self.client.headers["Authorization"] = f"Bearer {token}"
    
    def auto_refresh(self):
        """后台线程自动刷新token"""
        while True:
            if self.expire_time and time.time() > self.expire_time - 300:
                # 刷新token
                resp = self.client._request("POST", "/api/auth/refresh", data={
                    "refreshToken": self.refresh_token
                })
                if resp.get("code") == 200:
                    self.token = resp["data"]["token"]
                    self.expire_time = resp["data"]["expireTime"]
            time.sleep(60)
```

---

## 完整运行流程

```python
def main():
    # 1. 初始化客户端
    client = TicketClient()
    client.secret_key = "your_secret_key"  # 逆向获取
    
    # 2. 设置代理（可选）
    proxy_mgr = ProxyManager("proxies.txt")
    client.session.proxies = proxy_mgr.get_proxy()
    
    # 3. 加载登录态
    auth = AuthManager(client)
    auth.login_with_token(
        token="saved_token",
        refresh_token="saved_refresh_token"
    )
    
    # 4. 配置抢票参数
    bot = TicketBot(client)
    bot.set_target(
        event_id="CONCERT_2024_001",
        seat_type="VIP",
        ticket_num=2,
        user_token=auth.token
    )
    
    # 5. 设置定时抢票
    start_time = datetime(2024, 12, 25, 10, 0, 0)
    
    print(f"目标演出: CONCERT_2024_001")
    print(f"座位类型: VIP")
    print(f"开抢时间: {start_time}")
    print("等待中...")
    
    while datetime.now() < start_time:
        time.sleep(0.1)
    
    print("\n开抢!")
    bot.run_multi_thread(thread_count=10)

if __name__ == "__main__":
    main()
```

---

## 调试技巧

**开启详细日志：**
```python
import logging
import http.client as http_client

http_client.HTTPConnection.debuglevel = 1
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
```

**模拟请求验证：**
```python
# 先手动操作一次，对比脚本请求和APP请求的差异
def compare_requests(script_req: dict, app_req: dict):
    for key in app_req:
        if key not in script_req:
            print(f"缺少字段: {key}")
        elif script_req[key] != app_req[key]:
            print(f"字段不一致 [{key}]: 脚本={script_req[key]}, APP={app_req[key]}")
```

---

## 注意事项

- 每个平台接口结构不同，需要针对性分析
- 签名算法可能定期更新，需要持续维护
- 高频请求可能导致账号风控，控制请求频率
- 代理IP质量直接影响成功率

按此流程完成的脚本，响应时间通常在50-200ms，远快于UI自动化方案。


# 大麦APP协议逆向分析

大麦是阿里系票务平台，风控较严。需要分层拆解。

---

## 第一阶段：抓包准备

### 工具配置

**推荐方案：HttpCanary（手机端）+ PC Charles配合**

```
优势：无需root即可抓大部分接口
劣势：部分SSL Pinning接口无法抓取
```

**完整方案（需要root）：**

1. 手机已root，安装Magisk + LSPosed
2. 安装TrustMeAlready模块（绕过SSL Pinning）
3. 安装HttpCanary或配置Charles代理

### 大麦APP版本选择

```
推荐版本：5.85.x - 5.90.x
原因：新版本风控更强，旧版本签名算法相对简单

下载地址：豌豆荚、APKMirror历史版本
```

---

## 第二阶段：核心接口识别

### 抓包流程

1. 打开HttpCanary，目标应用选大麦
2. 进入演出详情页 → 选择场次 → 选座 → 提交订单（支付前停止）
3. 筛选域名：`damai.cn`、`damaiapp.com`

### 关键接口列表

| 接口功能 | URL路径 | 方法 |
|----------|---------|------|
| 演出详情 | `/mtop.alibaba.damai.wireless.mtop.alibaba.damai.wireless.detail` | GET |
| 场次查询 | `/mtop.alibaba.damai.wirelessperformanceschedule.query` | GET |
| 座位图 | `/mtop.alibaba.damai.wirelessarena.seatchart` | GET |
| 创建订单 | `/mtop.alibaba.damai.wirelessorder.create` | POST |
| 支付准备 | `/mtop.alibaba.damai.wirelesspay.prepare` | POST |

### 请求结构分析

**典型请求URL：**
```
https://h5api.m.taobao.com/h5/mtop.alibaba.damai.wirelessperformanceschedule.query/1.0/?
    jsv=2.7.2&
    appKey=12574478&
    t=1703123456789&
    sign=abc123def456...&
    api=mtop.alibaba.damai.wirelessperformanceschedule.query&
    v=1.0&
    type=originaljson&
    dataType=json&
    timeout=20000&
    AntiCreep=true&
    AntiFlood=true&
    H5Request=true&
    data=%7B%22performId%22%3A%222123456%22%7D
```

**Headers关键参数：**
```
User-Agent: MTOPSDK%2F3.1.1.7+%28Android%3B10%3BPOCOPOCO+F1%29
x-sgext: Bq0...（设备指纹扩展）
x-sign: AwF...（请求签名）
x-sid: 19xxx（会话ID）
x-uid: 22xxx（用户ID）
x-t: 1703123456789（时间戳）
x-app-ver: 5.90.0
x-c-traceid: xxx（追踪ID）
```

---

## 第三阶段：签名算法逆向

### 签名参数识别

大麦有**三层签名**：
1. `sign` 参数（URL中）
2. `x-sign` Header
3. `x-sgext` Header（设备指纹相关）

### APK反编译

```bash
# 使用jadx-gui反编译
jadx-gui damai_5.90.0.apk

# 搜索关键词定位签名逻辑
# 搜索: "x-sign", "sign=", "getSign", "SecurityGuard"
```

### 签名逻辑追踪

大麦使用阿里SecurityGuard SDK进行签名，核心逻辑：

```
1. 收集请求参数
2. 拼接: method + version + appKey + timestamp + data + secret
3. 调用SecurityGuard签名函数
4. 生成最终签名
```

### 关键代码定位

**在jadx中搜索：**

```java
// 位置: com/alibaba/wireless/security/open/SecurityGuard
public interface SecurityGuard {
    String sign(String data, String appKey);
}

// 实际调用点
public class MtopSign {
    public static String getSign(String api, String version, 
                                  String data, String timestamp) {
        // 拼接签名字符串
        String signStr = api + "&" + version + "&" + timestamp + "&" + data;
        
        // 调用SecurityGuard
        String sign = SecurityGuardManager.getInstance()
            .getSecurityGuard()
            .sign(signStr, "12574478");
        
        return sign;
    }
}
```

### 使用Frida Hook获取签名

**Hook脚本：**

```javascript
// damai_sign_hook.js
Java.perform(function() {
    // Hook SecurityGuard签名函数
    var SecurityGuard = Java.use("com.alibaba.wireless.security.open.SecurityGuard");
    
    SecurityGuard.sign.implementation = function(data, appKey) {
        console.log("[+] sign() called");
        console.log("    data: " + data);
        console.log("    appKey: " + appKey);
        
        var result = this.sign(data, appKey);
        console.log("    result: " + result);
        
        return result;
    };
    
    // Hook x-sgext生成
    var SgextGenerator = Java.use("com.taobao.android.sgext.SgextGenerator");
    
    SgextGenerator.generate.overload('java.util.Map').implementation = function(params) {
        console.log("[+] sgext generate()");
        var keys = params.keySet().toArray();
        for (var i = 0; i < keys.length; i++) {
            console.log("    " + keys[i] + ": " + params.get(keys[i]));
        }
        
        var result = this.generate(params);
        console.log("    sgext: " + result);
        return result;
    };
});
```

**执行Hook：**

```bash
# 启动frida-server（手机端）
adb shell su -c "./frida-server -D"

# Hook大麦进程
frida -U -f cn.damay -l damai_sign_hook.js --no-pause
```

---

## 第四阶段：Python复现签名

### 基础签名复现

**大麦签名格式：**
```python
import hashlib
import time
import urllib.parse

class DamaiSigner:
    def __init__(self):
        self.app_key = "12574478"
        # 这个secret需要从APP中提取或Hook获取
        # 不同版本可能不同
        self.secret = "YOUR_EXTRACTED_SECRET"
    
    def generate_sign(self, api: str, version: str, 
                      timestamp: str, data: str) -> str:
        """
        sign格式: api&version&timestamp&data
        然后用secret进行加密
        """
        sign_str = f"{api}&{version}&{timestamp}&{data}"
        
        # 大麦使用hmac-sha256
        import hmac
        sign = hmac.new(
            self.secret.encode(),
            sign_str.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return sign
    
    def build_url(self, api: str, version: str, data: dict) -> str:
        timestamp = str(int(time.time() * 1000))
        data_str = urllib.parse.quote(json.dumps(data))
        
        sign = self.generate_sign(api, version, timestamp, data_str)
        
        return (
            f"https://h5api.m.taobao.com/h5/{api}/{version}/?"
            f"jsv=2.7.2&"
            f"appKey={self.app_key}&"
            f"t={timestamp}&"
            f"sign={sign}&"
            f"api={api}&"
            f"v={version}&"
            f"type=originaljson&"
            f"dataType=json&"
            f"data={data_str}"
        )
```

### x-sgext 设备指纹生成

```python
import base64
import json

class SgextGenerator:
    """
    x-sgext是设备指纹签名
    收集设备信息后加密生成
    """
    
    def __init__(self):
        self.device_info = {
            "brand": "Xiaomi",
            "model": "POCO F1",
            "os": "Android",
            "osVersion": "10",
            "screenWidth": 1080,
            "screenHeight": 2246,
            "density": 2.75,
            "timezone": "Asia/Shanghai",
            "language": "zh_CN",
            "deviceId": self.generate_device_id(),
        }
    
    def generate_device_id(self) -> str:
        """生成或加载持久化设备ID"""
        import uuid
        return uuid.uuid4().hex
    
    def generate_sgext(self, extra_params: dict = None) -> str:
        """
        实际算法更复杂，需要Hook逆向
        这里是简化版本
        """
        data = {**self.device_info}
        if extra_params:
            data.update(extra_params)
        
        # 按特定规则排序
        sorted_str = self._sort_and_concat(data)
        
        # 加密（实际为更复杂的自定义算法）
        encrypted = self._encrypt(sorted_str)
        
        return base64.b64encode(encrypted).decode()
    
    def _sort_and_concat(self, data: dict) -> str:
        items = sorted(data.items(), key=lambda x: x[0])
        return "&".join(f"{k}={v}" for k, v in items)
    
    def _encrypt(self, data: str) -> bytes:
        # 实际需要逆向SecurityGuard的sgext模块
        # 这里用简单hash代替示意
        return hashlib.md5(data.encode()).digest()
```

---

## 第五阶段：完整请求客户端

```python
import requests
import json
import time
import random
from typing import Optional

class DamaiClient:
    def __init__(self):
        self.session = requests.Session()
        self.base_url = "https://h5api.m.taobao.com/h5"
        self.app_key = "12574478"
        self.app_ver = "5.90.0"
        
        self.signer = DamaiSigner()
        self.sgext_gen = SgextGenerator()
        
        # 用户登录态
        self.sid = None
        self.uid = None
        self.token = None
        
        self._init_headers()
    
    def _init_headers(self):
        self.headers = {
            "User-Agent": f"MTOPSDK/3.1.1.7 (Android;10;POCOPOCO F1)",
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "x-app-ver": self.app_ver,
            "x-c-traceid": self._generate_trace_id(),
        }
    
    def _generate_trace_id(self) -> str:
        import uuid
        return uuid.uuid4().hex + str(int(time.time() * 1000))
    
    def set_login_state(self, sid: str, uid: str, token: str):
        """从抓包数据设置登录态"""
        self.sid = sid
        self.uid = uid
        self.token = token
        self.headers.update({
            "x-sid": sid,
            "x-uid": uid,
            "Authorization": f"Bearer {token}",
        })
    
    def request(self, api: str, version: str, 
                data: dict, method: str = "GET") -> dict:
        timestamp = str(int(time.time() * 1000))
        data_json = json.dumps(data, separators=(',', ':'))
        
        # 生成签名
        sign = self.signer.generate_sign(api, version, timestamp, data_json)
        sgext = self.sgext_gen.generate_sgext({"api": api, "t": timestamp})
        
        # 更新headers
        headers = {
            **self.headers,
            "x-t": timestamp,
            "x-sign": sign,
            "x-sgext": sgext,
        }
        
        # 构建URL
        url = f"{self.base_url}/{api}/{version}/"
        
        params = {
            "jsv": "2.7.2",
            "appKey": self.app_key,
            "t": timestamp,
            "sign": sign,
            "api": api,
            "v": version,
            "type": "originaljson",
            "dataType": "json",
            "AntiCreep": "true",
            "AntiFlood": "true",
            "data": data_json,
        }
        
        try:
            if method == "GET":
                resp = self.session.get(url, params=params, 
                                        headers=headers, timeout=15)
            else:
                resp = self.session.post(url, data=params,
                                        headers=headers, timeout=15)
            
            result = resp.json()
            
            # 检查风控
            if result.get("ret") and "FAIL_SYS_TOKEN_EMPTY" in str(result.get("ret")):
                print("[!] 登录态失效，需要重新登录")
                return {"error": "token_expired"}
            
            return result
            
        except Exception as e:
            print(f"[错误] 请求失败: {e}")
            return {"error": str(e)}
    
    # === 业务接口 ===
    
    def get_perform_detail(self, perform_id: str) -> dict:
        """获取演出详情"""
        api = "mtop.alibaba.damai.wireless.detail"
        data = {"performId": perform_id}
        return self.request(api, "1.0", data)
    
    def get_schedule(self, perform_id: str) -> dict:
        """获取场次列表"""
        api = "mtop.alibaba.damai.wirelessperformanceschedule.query"
        data = {"performId": perform_id}
        return self.request(api, "1.0", data)
    
    def get_seat_chart(self, perform_id: str, venue_id: str) -> dict:
        """获取座位图"""
        api = "mtop.alibaba.damai.wirelessarena.seatchart"
        data = {
            "performId": perform_id,
            "venueId": venue_id,
        }
        return self.request(api, "1.0", data)
    
    def create_order(self, perform_id: str, sku_id: str, 
                     ticket_num: int = 1) -> dict:
        """创建订单"""
        api = "mtop.alibaba.damai.wirelessorder.create"
        data = {
            "performId": perform_id,
            "skuId": sku_id,
            "ticketNum": ticket_num,
            "buyerInfo": json.dumps([]),  # 购票人信息
        }
        return self.request(api, "1.0", data, method="POST")
```

---

## 第六阶段：抢票逻辑实现

```python
from datetime import datetime
import threading
import time
import random

class DamaiBot:
    def __init__(self, client: DamaiClient):
        self.client = client
        self.running = False
        self.config = {}
        
    def configure(self, perform_id: str, sku_id: str = None,
                  ticket_num: int = 1, start_time: datetime = None):
        self.config = {
            "perform_id": perform_id,
            "sku_id": sku_id,
            "ticket_num": ticket_num,
            "start_time": start_time,
        }
    
    def monitor_stock(self) -> Optional[dict]:
        """监控库存状态"""
        try:
            result = self.client.get_schedule(self.config["perform_id"])
            
            if result.get("ret") == ["SUCCESS::调用成功"]:
                data = result.get("data", {})
                skus = data.get("skuList", [])
                
                for sku in skus:
                    if sku.get("status") == "可购买" and sku.get("stock", 0) > 0:
                        return {
                            "sku_id": sku["skuId"],
                            "price": sku.get("price"),
                            "stock": sku.get("stock"),
                            "name": sku.get("priceName"),
                        }
            return None
        except Exception as e:
            print(f"[监控错误] {e}")
            return None
    
    def try_order(self, sku_id: str) -> bool:
        """尝试下单"""
        result = self.client.create_order(
            perform_id=self.config["perform_id"],
            sku_id=sku_id,
            ticket_num=self.config["ticket_num"]
        )
        
        ret = result.get("ret", [])
        if ret and "SUCCESS" in ret[0]:
            order_data = result.get("data", {})
            print(f"\n[成功] 订单创建成功!")
            print(f"订单号: {order_data.get('orderId')}")
            print(f"支付链接: {order_data.get('payUrl')}")
            return True
        else:
            print(f"[失败] {ret}")
            return False
    
    def run(self, thread_count: int = 3):
        """启动抢票"""
        self.running = True
        attempt = 0
        
        # 如果设置了开始时间，先等待
        if self.config.get("start_time"):
            print(f"等待开始时间: {self.config['start_time']}")
            while datetime.now() < self.config["start_time"]:
                time.sleep(0.05)
            print("开始抢票!")
        
        def worker():
            nonlocal attempt
            while self.running:
                attempt += 1
                print(f"\r[尝试 {attempt}] ", end="", flush=True)
                
                # 检查库存
                stock_info = self.monitor_stock()
                
                if stock_info:
                    print(f"\n[发现] 有票! {stock_info['name']} - 剩余{stock_info['stock']}张 - ¥{stock_info['price']}")
                    
                    # 尝试下单
                    if self.try_order(stock_info["sku_id"]):
                        self.running = False
                        break
                
                # 随机延迟，避免风控
                time.sleep(random.uniform(0.3, 0.8))
        
        # 多线程
        threads = []
        for i in range(thread_count):
            t = threading.Thread(target=worker, daemon=True)
            t.start()
            threads.append(t)
            time.sleep(0.1)  # 错开启动
        
        for t in threads:
            t.join()

# === 使用示例 ===

if __name__ == "__main__":
    client = DamaiClient()
    
    # 从抓包获取登录态填入
    client.set_login_state(
        sid="你的sid",
        uid="你的uid", 
        token="你的token"
    )
    
    bot = DamaiBot(client)
    bot.configure(
        perform_id="213456789",  # 演出ID，从URL获取
        ticket_num=1,
        start_time=datetime(2024, 12, 28, 11, 0, 0)  # 开售时间
    )
    
    bot.run(thread_count=5)
```

---

## 第七阶段：风控对抗

### 常见风控错误码

| 错误码 | 含义 | 对策 |
|--------|------|------|
| FAIL_SYS_TOKEN_EMPTY | 登录态失效 | 重新获取token |
| FAIL_SYS_ILLEGAL_ACCESS | 非法访问 | 检查User-Agent |
| FAIL_SYS_FREQUENCY | 频率限制 | 降低请求频率/换IP |
| FAIL_SYS_SIGNATURE | 签名错误 | 检查签名算法 |
| FAIL_BIZ_TICKET_SOLD_OUT | 售罄 | 正常情况，继续重试 |
| FAIL_BIZ_USER_FREQUENCY | 用户级限流 | 更换账号 |

### 代理集成

```python
class ProxyPool:
    def __init__(self, proxy_file: str):
        with open(proxy_file) as f:
            self.proxies = [line.strip() for line in f if line.strip()]
        self.index = 0
    
    def get(self) -> dict:
        if not self.proxies:
            return {}
        proxy = self.proxies[self.index % len(self.proxies)]
        self.index += 1
        return {
            "http": f"http://{proxy}",
            "https": f"http://{proxy}"
        }
    
    def rotate(self, session: requests.Session):
        session.proxies.update(self.get())

# 使用
proxy_pool = ProxyPool("proxies.txt")
client.session.proxies = proxy_pool.get()

# 每次失败后轮换
if "FAIL_SYS_FREQUENCY" in str(result):
    proxy_pool.rotate(client.session)
```

---

## 第八阶段：实战提取签名Secret

### 使用Frida完整提取

```javascript
// extract_secret.js
Java.perform(function() {
    console.log("[*] 开始Hook大麦签名模块...");
    
    // Hook所有可能的签名入口
    var classes = [
        "com.alibaba.wireless.security.open.SecurityGuard",
        "com.taobao.android.security.SecurityGuard",
        "mtopsdk.mtop.common.model.SecurityGuard"
    ];
    
    classes.forEach(function(className) {
        try {
            var clazz = Java.use(className);
            var methods = clazz.class.getDeclaredMethods();
            
            methods.forEach(function(method) {
                var methodName = method.getName();
                if (methodName.toLowerCase().indexOf("sign") >= 0) {
                    console.log("[+] Found: " + className + "." + methodName);
                }
            });
        } catch(e) {}
    });
    
    // Hook具体方法
    var SignUtil = Java.use("mtopsdk.security.util.SignUtil");
    SignUtil.sign.overload('java.lang.String', 'java.lang.String').implementation = function(data, key) {
        console.log("\n[Sign] Input:");
        console.log("  data: " + data);
        console.log("  key: " + key);
        
        var result = this.sign(data, key);
        console.log("  result: " + result);
        console.log("  len: " + result.length);
        
        return result;
    };
});
```

### 运行脚本

```bash
frida -U -f cn.damay -l extract_secret.js -o damai_log.txt
```

然后在APP中正常操作，观察输出的签名参数，用于Python复现。

---

## 关键提示

1. **签名算法稳定性**：大麦每次大版本更新可能改变签名逻辑，需要重新逆向

2. **登录态有效期**：token通常有效几小时到几天，需要定期刷新

3. **设备绑定**：频繁更换设备指纹会触发风控

4. **账号安全**：使用小号测试，避免主号被封

5. **真实成功率**：热门演出靠网速和运气，脚本能提升响应速度但不能保证必中

---

要继续深入某个具体环节吗？比如用Frida实时Hook分析某个特定接口的完整请求参数？
