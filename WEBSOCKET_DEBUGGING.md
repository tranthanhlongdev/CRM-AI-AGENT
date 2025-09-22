# 🔧 WEBSOCKET DEBUGGING GUIDE

## 📋 **Lỗi Hiện Tại**

### **1. Backend Error:**
```
Lỗi khởi tạo cuộc gọi: 'position'
```

### **2. State Error:**
```
Cannot make call: Another call in progress
```

---

## 🔍 **Nguyên Nhân & Giải Pháp**

### **❌ Lỗi 1: Backend Server**

**Nguyên nhân:**
- Backend VoiceBot server chưa chạy trên `localhost:8000`
- Server không xử lý event `make_call` đúng cách
- WebSocket connection bị lỗi

**Giải pháp:**

#### **Option A: Mock Backend Server**
Tạo mock server để test:

```bash
npm install -g socket.io
```

Tạo file `mock-voicebot-server.js`:
```javascript
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Handle make_call
  socket.on('make_call', (data) => {
    console.log('📞 Make call:', data);
    
    // Simulate call initiated
    socket.emit('call_initiated', {
      callId: 'CALL_' + Date.now(),
      callerNumber: data.callerNumber,
      calledNumber: data.calledNumber,
      status: 'ringing'
    });

    // Simulate queue after 2s
    setTimeout(() => {
      socket.emit('call_queued', {
        queuePosition: 1,
        estimatedWaitTime: 30
      });
    }, 2000);

    // Simulate connected after 5s
    setTimeout(() => {
      socket.emit('call_connected', {
        agentInfo: { fullName: 'Agent Demo' }
      });
    }, 5000);
  });

  // Handle end_call
  socket.on('end_call', (data) => {
    console.log('📴 End call:', data);
    socket.emit('call_ended', {
      duration: 120,
      endReason: 'caller_hangup'
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

server.listen(8000, () => {
  console.log('🎧 Mock VoiceBot server running on localhost:8000');
});
```

Chạy server:
```bash
node mock-voicebot-server.js
```

#### **Option B: Check Real Backend**
Nếu có backend thật:
1. Kiểm tra server có chạy trên `localhost:8000`
2. Check CORS configuration
3. Verify event handlers cho `make_call`

---

### **❌ Lỗi 2: State Management**

**Nguyên nhân:**
- `callStatus` bị stuck ở trạng thái khác `"ready"`
- Lỗi đầu tiên khiến state không reset

**Giải pháp:**
- ✅ **Đã thêm**: Force reset state trong `handleCall`
- ✅ **Đã thêm**: Reset state on error
- ✅ **Đã thêm**: Debug buttons để check và reset state

---

## 🛠️ **Debugging Steps**

### **1. Check WebSocket Connection**
```javascript
// Trong browser console
console.log('WebSocket connected:', wsConnected);
console.log('VoiceBot status:', voiceBotService.getStatus());
```

### **2. Use Debug Buttons**
- **🔧 Debug & Reset State**: Check current state và reset về ready
- **🔄 Reconnect WebSocket**: Reconnect WebSocket connection

### **3. Check Network**
- Mở **Developer Tools** → **Network** → **WS**
- Kiểm tra WebSocket connection có thành công không
- Check messages được gửi/nhận

### **4. Check Backend Response**
```javascript
// Trong browser console
customerSocket.on('error', (error) => {
  console.error('WebSocket Error:', error);
});

customerSocket.on('connect_error', (error) => {
  console.error('Connection Error:', error);
});
```

---

## 🔧 **Quick Fixes**

### **1. Force Reset State**
```javascript
// Trong browser console
setCallStatus("ready");
setCurrentCall(null);
setQueueInfo(null);
setCallDuration(0);
```

### **2. Manual WebSocket Connect**
```javascript
// Trong browser console
voiceBotService.disconnect();
await voiceBotService.connect();
```

### **3. Check Service Status**
```javascript
// Trong browser console
console.log(voiceBotService.getStatus());
```

---

## 📞 **Test Sequence**

### **1. Test với Mock Server:**
1. Chạy mock server: `node mock-voicebot-server.js`
2. Reload softphone page
3. Check connection indicator → green
4. Try make call
5. Watch console logs

### **2. Test Real Backend:**
1. Ensure backend server running on `localhost:8000`
2. Check CORS settings allow `http://localhost:5173`
3. Verify event handlers exist
4. Test with demo HTML file

### **3. Test State Management:**
1. Click **🔧 Debug & Reset State**
2. Check console output
3. Try make call after reset
4. Monitor state changes

---

## 🚨 **Common Issues**

### **Backend Not Running**
- **Error**: `connection_error` or `disconnected`
- **Fix**: Start backend server on `localhost:8000`

### **CORS Issues**  
- **Error**: CORS policy blocked
- **Fix**: Add CORS headers in backend

### **Event Handler Missing**
- **Error**: `Lỗi khởi tạo cuộc gọi: 'position'`
- **Fix**: Implement `make_call` handler in backend

### **State Stuck**
- **Error**: `Another call in progress`
- **Fix**: Use **🔧 Debug & Reset State** button

---

## 📋 **Checklist**

- [ ] Backend server chạy trên `localhost:8000`
- [ ] WebSocket connection indicator màu xanh
- [ ] Console không có lỗi connection
- [ ] `callStatus` ở trạng thái `"ready"`
- [ ] Số điện thoại đã nhập
- [ ] CORS được cấu hình đúng
- [ ] Event handlers đã implement

---

## 🔗 **Useful Commands**

```bash
# Check port 8000
lsof -i :8000

# Test WebSocket connection
curl -X GET http://localhost:8000

# Install Socket.IO for mock server
npm install socket.io

# Run mock server
node mock-voicebot-server.js
```

---

## 💡 **Tips**

1. **Always check connection status** trước khi make call
2. **Use debug buttons** để kiểm tra state
3. **Check browser console** cho detailed logs
4. **Test với mock server** trước khi dùng real backend
5. **Reset state manually** nếu bị stuck

---

**🎯 Current Status:** WebSocket integration hoàn tất, chỉ cần backend server để test đầy đủ!
