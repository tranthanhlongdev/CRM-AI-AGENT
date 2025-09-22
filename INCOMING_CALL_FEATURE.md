# 📞 Tính Năng Cuộc Gọi Đến CRM

## 🎯 Mô Tả Tính Năng

Khi Softphone gọi đến Agent CRM, hệ thống sẽ:
1. **Hiển thị thông báo cuộc gọi đến** trên CRM với thông tin caller
2. **Cho phép Agent bắt máy/từ chối** cuộc gọi  
3. **Khi bắt máy**: Popup hiển thị thông tin chi tiết khách hàng và ticket history
4. **Tạo ticket mới** trực tiếp từ cuộc gọi với thông tin được prefill

## 🏗️ Kiến Trúc Hệ Thống

### 1. Softphone → Agent Call Flow
```
Softphone (http://localhost:5173/softphone)
    ↓ [WebSocket + API]
VoiceBot Backend (http://localhost:8000)  
    ↓ [WebSocket Events]
CRM Agent (http://localhost:5173)
```

### 2. Components Mới

#### 📱 **IncomingCallNotification.jsx**
- Modal hiển thị thông báo cuộc gọi đến
- Thông tin caller: tên, số điện thoại, CIF (nếu có)
- Buttons: "Bắt máy" / "Từ chối"
- Auto-decline sau 30 giây
- Animation ringing effect

#### 🎯 **CustomerCallPopup.jsx**
- Popup chính khi cuộc gọi được kết nối
- **Left Panel**: Thông tin khách hàng (tìm theo SĐT)
- **Right Panel**: 2 tabs
  - **Tickets**: Lịch sử tickets của khách hàng
  - **Ghi chú cuộc gọi**: Textarea để ghi chú
- Actions: "Tạo Ticket", "Kết thúc cuộc gọi"
- Minimize mode (thu nhỏ về góc màn hình)

#### 🔌 **callService.js**
- WebSocket service cho CRM agent
- Kết nối đến VoiceBot backend
- Event handlers: incoming call, connected, ended, failed
- Methods: acceptCall(), declineCall(), endCall()

### 3. Tích Hợp Vào App.jsx

#### State Management
```javascript
// Call management states
const [incomingCallData, setIncomingCallData] = useState(null);
const [activeCall, setActiveCall] = useState(null);
const [callServiceConnected, setCallServiceConnected] = useState(false);
```

#### WebSocket Events
```javascript
callService.on('incomingCall', (callData) => {
  setIncomingCallData(callData);
});

callService.on('callConnected', (callData) => {
  setActiveCall(callData);
  setIncomingCallData(null);
});
```

## 🛠️ Cài Đặt & Sử Dụng

### 1. Dependencies
```json
{
  "socket.io-client": "^4.7.5"
}
```

### 2. Khởi Động Hệ Thống

#### Backend VoiceBot (Port 8000)
```bash
# Đảm bảo backend chạy với đầy đủ API endpoints:
# /api/agents/available
# /api/agents/status  
# /api/call/demo/initiate
# WebSocket support
```

#### CRM Frontend (Port 5173)
```bash
npm run dev
# http://localhost:5173 - CRM login
# http://localhost:5173/softphone - Softphone (no login)
```

### 3. Test Flow

#### Scenario 1: Call từ Softphone đến Agent
1. Mở `http://localhost:5173/softphone`
2. Login với Agent Name + Phone Number
3. Click nút "Agent" → chọn available agent → "Call"
4. **CRM sẽ hiển thị IncomingCallNotification**
5. Agent click "Bắt máy"
6. **CRM hiển thị CustomerCallPopup** với thông tin khách hàng
7. Agent có thể ghi chú và tạo ticket
8. Kết thúc cuộc gọi

#### Scenario 2: Tạo Ticket từ Cuộc Gọi  
1. Trong CustomerCallPopup, click "Tạo Ticket"
2. **CRM tự động chuyển sang form tạo ticket**
3. **Thông tin được prefill**:
   - Tên khách hàng (từ Softphone)
   - Số điện thoại (caller number)
   - Channel: "Inbound"
   - Ghi chú cuộc gọi tự động thêm vào

## 🔧 API Endpoints Sử Dụng

### Customer Lookup
```javascript
// Tìm khách hàng theo SĐT
customerService.searchCustomers({ 
  search: phoneNumber,
  searchField: 'soDienThoai' 
})

// Lấy tickets của khách hàng
ticketService.getTicketsByCif(cifNumber)
```

### Agent Management  
```javascript
// Kiểm tra agents available
realtimeService.getAvailableAgents()

// Gọi agent trực tiếp với customer info
realtimeService.initiateDemoCall(callerNumber, {
  ...targetAgent,
  customerInfo: customerInfo,
  callMetadata: metadata
})
```

### WebSocket Events
```javascript
// Incoming call với customer info
{
  callId: "call_123",
  callerNumber: "0912345678", 
  callerName: "Nguyen Van A",
  customerInfo: {
    hoTen: "Nguyen Van A",
    soDienThoai: "0912345678",
    cifNumber: "CIF123456",
    chiNhanh: "HCM",
    // ...
  },
  source: "softphone",
  timestamp: "2025-09-18T..."
}
```

## 🎨 UX/UI Features

### Thông Báo Cuộc Gọi Đến
- ✅ Modal overlay với animation ringing
- ✅ Avatar placeholder với gradient background  
- ✅ Countdown timer (30s auto-decline)
- ✅ Sound effect simulation với pulsing dot

### Popup Thông Tin Khách Hàng
- ✅ 2-panel layout (customer info + tickets/notes)
- ✅ Customer avatar với first letter
- ✅ Tab navigation (Tickets / Notes)
- ✅ Minimize mode với floating button
- ✅ Call duration timer

### Notifications
- ✅ Toast notifications cho call events
- ✅ Success/Error/Info messages
- ✅ Auto-dismiss với animation

## 🔍 Debug & Troubleshooting

### Logging
Mọi events được log với prefix:
```
🔌 Connection events
📞 Call events  
✅ Success events
❌ Error events
```

### Test Connectivity
```javascript
// Trong Softphone, click "🧪 Test Server Connection"
// Check console logs cho detailed connection info
```

### Common Issues

#### 1. WebSocket Connection Failed
```
❌ Lỗi: WebSocket connection failed
✅ Fix: Đảm bảo backend VoiceBot chạy trên localhost:8000
```

#### 2. No Available Agents
```  
❌ Lỗi: Không có agent nào khả dụng
✅ Fix: Kiểm tra agents trong backend có status 'available'
```

#### 3. Customer Info Not Found
```
❌ Lỗi: Không tìm thấy thông tin khách hàng  
✅ Behavior: Vẫn cho phép tạo ticket với "Khách hàng mới"
```

## 🚀 Các Tính Năng Có Thể Mở Rộng

### 1. Advanced Customer Lookup
- Tìm kiếm theo nhiều field (email, CMND, CIF)
- Integration với external CRM databases
- Real-time customer data sync

### 2. Call Recording & Analytics
- Record cuộc gọi với permissions
- Call duration statistics
- Agent performance metrics

### 3. Smart Call Routing
- Skill-based routing (product expertise)
- Load balancing between agents  
- Priority queuing (VIP customers)

### 4. Multi-channel Support
- Video calls integration
- Screen sharing capability
- Chat/messaging during calls

---

**🎉 Feature hoàn tất! Softphone giờ có thể gọi trực tiếp đến CRM agents với đầy đủ customer context và ticket management.**
