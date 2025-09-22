# 🎙️ WebRTC Voice Call Integration

## 🎯 Mô Tả Tính Năng

Tích hợp WebRTC để cho phép **voice call thật sự** giữa Softphone (customer) và CRM Agent. Không chỉ là signaling, mà là audio streaming thực tế để hai bên có thể nói chuyện trực tiếp.

### Flow Hoạt Động:
1. **Softphone gọi Agent** → Backend tìm available agent
2. **Call connected** → Cả 2 bên khởi tạo WebRTC
3. **WebRTC signaling** → Exchange offer/answer/ICE candidates  
4. **Audio stream established** → Nói chuyện trực tiếp!
5. **Call controls** → Mute/unmute, end call

## 🏗️ Kiến Trúc Hệ Thống

### WebRTC Signaling Flow
```
Customer (Softphone)                    Agent (CRM)
        ↓                                    ↓
   [WebRTC Init]                       [WebRTC Init]
        ↓                                    ↓
   [Get UserMedia]                     [Get UserMedia]  
        ↓                                    ↓
   [Create Offer] ────→ Backend ────→ [Receive Offer]
                                           ↓
   [Receive Answer] ←─── Backend ←─── [Create Answer]
        ↓                                    ↓
   [ICE Exchange] ←──→ Backend ←──→ [ICE Exchange]
        ↓                                    ↓
   [Audio Stream] ←──→ P2P ←──→ [Audio Stream]
```

## 📁 File Structure

### Core WebRTC Service
```
src/services/webrtcService.js
├── WebRTCService class (singleton)
├── RTCPeerConnection management
├── Media stream handling
├── Signaling event listeners
└── Audio controls (mute/unmute)
```

### Integration Points
```
src/components/softphone/SoftphonePage.jsx
├── Customer-side WebRTC initialization
├── Voice call controls UI
└── Event handling

src/App.jsx (CRM)
├── Agent-side WebRTC initialization  
├── Call management integration
└── Notification system

src/components/CustomerCallPopup.jsx
├── Voice call status indicator
├── Mute/unmute controls
└── Call quality display
```

## 🔧 Technical Implementation

### 1. WebRTC Service (webrtcService.js)

#### Core Features:
- **RTCPeerConnection** management với STUN servers
- **getUserMedia** cho microphone access
- **Signaling** qua Socket.IO với backend
- **Event system** cho UI updates
- **Error handling** và reconnection logic

#### Key Methods:
```javascript
// Initialize WebRTC for a call
await webrtcService.initialize(socket, callId, peerType)

// Media controls
webrtcService.mute()
webrtcService.unmute()
webrtcService.endCall()

// Event listeners
webrtcService.on('voiceCallConnected', callback)
webrtcService.on('error', callback)
```

### 2. Softphone Integration (Customer Side)

#### WebRTC Initialization:
```javascript
voiceBotService.on('callConnected', async (data) => {
  // Initialize WebRTC when call connects
  if (data.callId) {
    await initializeVoiceCall(data.callId);
  }
});
```

#### Voice Call Controls:
- **Mute/Unmute button** trong call controls
- **Voice call status** indicators
- **Automatic cleanup** khi call ends

### 3. CRM Integration (Agent Side)

#### WebRTC Initialization:
```javascript
callService.on('callConnected', async (callData) => {
  // Initialize WebRTC for agent
  if (callData.callId) {
    await initializeAgentVoiceCall(callData.callId);
  }
});
```

#### Agent Voice Controls:
- **Mute button** trong CustomerCallPopup
- **Voice status indicator** (connected/connecting)
- **Success notifications** khi voice call ready

## 🎮 UI Controls

### Softphone Voice Controls
```jsx
{voiceCallActive && (
  <button
    onClick={toggleMute}
    className={isMuted ? "bg-red-600" : "bg-green-600"}
    title={isMuted ? "Unmute" : "Mute"}
  >
    {isMuted ? <MutedIcon /> : <UnmutedIcon />}
  </button>
)}
```

### CRM Voice Controls
```jsx
{/* Voice Call Status Indicator */}
{voiceCallActive && (
  <div className="flex items-center space-x-2">
    <div className={`w-2 h-2 rounded-full ${
      voiceCallConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
    }`}></div>
    <span className="text-xs">
      {voiceCallConnected ? 'Voice Connected' : 'Connecting...'}
    </span>
  </div>
)}

{/* Mute/Unmute Button */}
{voiceCallActive && (
  <button onClick={onToggleMute}>
    {isMuted ? <MutedIcon /> : <UnmutedIcon />}
  </button>
)}
```

## 🔌 Backend WebRTC Events

### WebSocket Events Sử Dụng:
```javascript
// Room management
socket.emit('join_call_room', { callId, peerType })
socket.emit('leave_call_room', { callId, peerType })

// WebRTC signaling
socket.emit('webrtc_offer', { callId, offer, fromPeer })
socket.emit('webrtc_answer', { callId, answer, fromPeer })
socket.emit('webrtc_ice_candidate', { callId, candidate, fromPeer })

// Media state
socket.emit('webrtc_media_state', { callId, peerType, audioEnabled })

// Response events
socket.on('webrtc_offer_received', callback)
socket.on('webrtc_answer_received', callback)
socket.on('webrtc_ice_candidate_received', callback)
socket.on('peer_joined', callback)
socket.on('peer_left', callback)
```

### Backend API Endpoints:
```javascript
// WebRTC configuration
GET /api/webrtc/config
// Response: { iceServers, mediaConstraints }

// Call WebRTC info  
GET /api/webrtc/call/{callId}/info
// Response: { callId, roomName, signalingUrl, events }
```

## 🎵 Audio Handling

### Media Constraints:
```javascript
const mediaConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true, 
    autoGainControl: true,
    sampleRate: 48000
  },
  video: false
};
```

### Remote Audio Playback:
```javascript
// Auto-create hidden audio element
const audioElement = document.createElement('audio');
audioElement.id = 'remoteAudio';
audioElement.autoplay = true;
audioElement.srcObject = remoteStream;
document.body.appendChild(audioElement);
```

## 🚨 Error Handling

### Common Issues & Solutions:

#### 1. Microphone Permission Denied
```javascript
webrtcService.on('error', (error) => {
  if (error.type === 'microphone_access_denied') {
    alert('Vui lòng cho phép truy cập microphone để sử dụng voice call.');
  }
});
```

#### 2. WebRTC Connection Failed
```javascript
peerConnection.onconnectionstatechange = () => {
  const state = peerConnection.connectionState;
  if (state === 'failed' || state === 'disconnected') {
    // Handle reconnection or fallback
    this.emit('voiceCallDisconnected');
  }
};
```

#### 3. ICE Connection Issues
```javascript
peerConnection.oniceconnectionstatechange = () => {
  const state = peerConnection.iceConnectionState;
  if (state === 'failed') {
    // May need TURN servers for NAT traversal
    console.error('ICE connection failed - may need TURN servers');
  }
};
```

## 📊 Debug & Monitoring

### Debug Panel Information:
```
🔧 Call Service Debug
Status: ✅ Connected
Voice Call: 🎵 Connected / 🎙️ Active / ❌ No
Agent Muted: 🔇 Yes / 🔊 No
```

### Console Logging:
```javascript
🎙️ Initializing voice call for callId: CALL_123
✅ Voice call initialized
🎵 Voice call connected
🔇 Microphone muted
📴 Ending voice call
```

### WebRTC Statistics:
```javascript
const stats = await webrtcService.getStats();
// Returns RTCStatsReport with connection quality info
```

## 🌐 Browser Compatibility

### Fully Supported:
- ✅ Chrome 80+ (Desktop & Mobile)
- ✅ Firefox 75+ (Desktop & Mobile)
- ✅ Edge 80+ (Desktop)

### Partial Support:
- ⚠️ Safari 14+ (Desktop & iOS) - có limitations
- ⚠️ Mobile browsers - có thể có audio issues

### Not Supported:
- ❌ Internet Explorer
- ❌ Old browsers không có WebRTC support

## 🚀 Production Considerations

### 1. HTTPS Requirement
```javascript
// WebRTC requires HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  throw new Error('WebRTC requires HTTPS in production');
}
```

### 2. TURN Servers
```javascript
const rtcConfig = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302'] },
    { 
      urls: ['turn:your-turn-server.com:3478'],
      username: 'username',
      credential: 'password'
    }
  ]
};
```

### 3. Audio Codecs
```javascript
// Prefer Opus codec for better quality
const offer = await peerConnection.createOffer({
  offerToReceiveAudio: true,
  offerToReceiveVideo: false
});
```

### 4. Network Quality Monitoring
```javascript
// Monitor connection quality
setInterval(async () => {
  const stats = await peerConnection.getStats();
  // Check packet loss, jitter, etc.
}, 5000);
```

## 🧪 Testing Guide

### 1. Local Testing Setup:
```bash
# Start backend with WebRTC support
node voicebot-server.js

# Start CRM frontend  
npm run dev
# http://localhost:5173

# Open Softphone
# http://localhost:5173/softphone
```

### 2. Test Flow:
1. **Login CRM** với user admin
2. **Open Softphone** trong tab khác
3. **Login Softphone** với phone number
4. **Click "Agent"** → chọn admin agent → **Call**
5. **CRM hiển thị incoming call** → **Accept**
6. **Voice call should connect** → test nói chuyện
7. **Test mute/unmute** controls
8. **End call** từ một trong hai bên

### 3. Debug Commands:
```javascript
// Check WebRTC state
console.log(webrtcService.getState());

// Check connection stats
const stats = await webrtcService.getStats();
console.log('WebRTC Stats:', stats);

// Test microphone
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('Microphone OK'))
  .catch(err => console.error('Microphone failed:', err));
```

## 📈 Performance Optimization

### 1. Audio Quality Settings:
```javascript
const mediaConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,        // High quality
    channelCount: 1,          // Mono for voice calls
    volume: 1.0
  }
};
```

### 2. Connection Optimization:
```javascript
const rtcConfig = {
  iceServers: [...],
  iceCandidatePoolSize: 10,   // Pre-gather ICE candidates
  bundlePolicy: 'balanced',   // Optimize bandwidth
  rtcpMuxPolicy: 'require'    // Reduce port usage
};
```

### 3. Cleanup & Memory Management:
```javascript
// Always cleanup on call end
webrtcService.endCall(); // Stops streams, closes connections
```

---

## 🎉 Kết Luận

WebRTC voice call integration đã hoàn tất! Softphone giờ có thể:

✅ **Gọi voice call thật sự** đến CRM agents
✅ **Audio streaming P2P** với chất lượng cao  
✅ **Mute/unmute controls** cho cả 2 bên
✅ **Real-time connection status** indicators
✅ **Error handling** và fallback mechanisms
✅ **Cross-browser compatibility** (modern browsers)

**Trải nghiệm voice call hoàn chỉnh từ Softphone đến CRM! 🎙️📞**
