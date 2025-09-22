class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.socket = null;
    this.callId = null;
    this.peerType = null; // 'customer' or 'agent'
    this.isInitialized = false;
    this.eventListeners = new Map();
    
    // WebRTC configuration
    this.rtcConfig = {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] },
        { urls: ['stun:stun2.l.google.com:19302'] }
      ],
      iceCandidatePoolSize: 10
    };

    this.mediaConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      },
      video: false
    };
  }

  // Initialize WebRTC for a call
  async initialize(socket, callId, peerType = 'customer') {
    try {
      console.log('🎙️ Initializing WebRTC for call:', callId, 'as', peerType);
      
      this.socket = socket;
      this.callId = callId;
      this.peerType = peerType;

      // Get WebRTC config from backend if available
      await this.loadWebRTCConfig();

      // Create peer connection
      await this.createPeerConnection();

      // Setup socket event listeners
      this.setupSocketEvents();

      // Get user media (microphone)
      await this.getUserMedia();

      this.isInitialized = true;
      this.emit('initialized', { callId, peerType });

      console.log('✅ WebRTC initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize WebRTC:', error);
      this.emit('error', { type: 'initialization_failed', error: error.message });
      return false;
    }
  }

  // Load WebRTC configuration from backend
  async loadWebRTCConfig() {
    try {
      const response = await fetch('http://localhost:8000/api/webrtc/config');
      if (response.ok) {
        const config = await response.json();
        if (config.data) {
          this.rtcConfig.iceServers = config.data.iceServers || this.rtcConfig.iceServers;
          this.mediaConstraints = { ...this.mediaConstraints, ...config.data.mediaConstraints };
          console.log('✅ Loaded WebRTC config from backend');
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load WebRTC config, using defaults:', error);
    }
  }

  // Create RTCPeerConnection
  async createPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(this.rtcConfig);

      // ICE candidate event
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate');
          this.socket.emit('webrtc_ice_candidate', {
            callId: this.callId,
            candidate: event.candidate,
            fromPeer: this.peerType
          });
        }
      };

      // Remote stream event
      this.peerConnection.ontrack = (event) => {
        console.log('🎵 Received remote stream');
        this.remoteStream = event.streams[0];
        this.emit('remoteStreamReceived', this.remoteStream);
        this.playRemoteAudio();
      };

      // Connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection.connectionState;
        console.log('🔗 Connection state changed:', state);
        this.emit('connectionStateChanged', state);

        if (state === 'connected') {
          this.emit('voiceCallConnected');
        } else if (state === 'disconnected' || state === 'failed') {
          this.emit('voiceCallDisconnected');
        }
      };

      // ICE connection state
      this.peerConnection.oniceconnectionstatechange = () => {
        const state = this.peerConnection.iceConnectionState;
        console.log('🧊 ICE connection state:', state);
        this.emit('iceConnectionStateChanged', state);
      };

      console.log('✅ Peer connection created');

    } catch (error) {
      console.error('❌ Failed to create peer connection:', error);
      throw error;
    }
  }

  // Get user media (microphone)
  async getUserMedia() {
    try {
      console.log('🎤 Requesting microphone access...');
      
      this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
      
      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
        console.log('✅ Added track to peer connection:', track.kind);
      });

      this.emit('localStreamReceived', this.localStream);
      console.log('✅ Microphone access granted');

    } catch (error) {
      console.error('❌ Failed to get user media:', error);
      this.emit('error', { type: 'microphone_access_denied', error: error.message });
      throw error;
    }
  }

  // Setup socket event listeners for WebRTC signaling
  setupSocketEvents() {
    // Join WebRTC room
    this.socket.emit('join_call_room', {
      callId: this.callId,
      peerType: this.peerType
    });

    // Peer joined the call
    this.socket.on('peer_joined', (data) => {
      if (data.callId === this.callId) {
        console.log('👥 Peer joined:', data.peerType);
        this.emit('peerJoined', data);
        
        // If customer and agent just joined, customer should create offer
        if (this.peerType === 'customer' && data.peerType === 'agent') {
          setTimeout(() => this.createOffer(), 1000);
        }
      }
    });

    // Peer left the call
    this.socket.on('peer_left', (data) => {
      if (data.callId === this.callId) {
        console.log('👥 Peer left:', data.peerType);
        this.emit('peerLeft', data);
      }
    });

    // WebRTC offer received
    this.socket.on('webrtc_offer_received', (data) => {
      if (data.callId === this.callId) {
        console.log('📞 Received WebRTC offer');
        this.handleOffer(data.offer);
      }
    });

    // WebRTC answer received
    this.socket.on('webrtc_answer_received', (data) => {
      if (data.callId === this.callId) {
        console.log('✅ Received WebRTC answer');
        this.handleAnswer(data.answer);
      }
    });

    // ICE candidate received
    this.socket.on('webrtc_ice_candidate_received', (data) => {
      if (data.callId === this.callId) {
        console.log('🧊 Received ICE candidate');
        this.handleIceCandidate(data.candidate);
      }
    });

    // Peer media state (mute/unmute)
    this.socket.on('peer_media_state', (data) => {
      if (data.callId === this.callId) {
        console.log('🔊 Peer media state changed:', data);
        this.emit('peerMediaStateChanged', data);
      }
    });
  }

  // Create and send WebRTC offer (usually done by customer)
  async createOffer() {
    try {
      console.log('📞 Creating WebRTC offer...');
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });

      await this.peerConnection.setLocalDescription(offer);

      // Send offer through signaling server
      this.socket.emit('webrtc_offer', {
        callId: this.callId,
        offer: offer,
        fromPeer: this.peerType
      });

      console.log('✅ WebRTC offer sent');
      this.emit('offerSent', offer);

    } catch (error) {
      console.error('❌ Failed to create offer:', error);
      this.emit('error', { type: 'offer_creation_failed', error: error.message });
    }
  }

  // Handle received WebRTC offer (usually by agent)
  async handleOffer(offer) {
    try {
      console.log('📞 Handling WebRTC offer...');
      
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      // Agent creates answer
      if (this.peerType === 'agent') {
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Send answer
        this.socket.emit('webrtc_answer', {
          callId: this.callId,
          answer: answer,
          fromPeer: this.peerType
        });

        console.log('✅ WebRTC answer sent');
        this.emit('answerSent', answer);
      }

    } catch (error) {
      console.error('❌ Failed to handle offer:', error);
      this.emit('error', { type: 'offer_handling_failed', error: error.message });
    }
  }

  // Handle received WebRTC answer (by customer)
  async handleAnswer(answer) {
    try {
      console.log('✅ Handling WebRTC answer...');
      
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      
      console.log('✅ WebRTC answer processed');
      this.emit('answerReceived', answer);

    } catch (error) {
      console.error('❌ Failed to handle answer:', error);
      this.emit('error', { type: 'answer_handling_failed', error: error.message });
    }
  }

  // Handle received ICE candidate
  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ ICE candidate added');
    } catch (error) {
      console.error('❌ Failed to handle ICE candidate:', error);
    }
  }

  // Play remote audio
  playRemoteAudio() {
    try {
      let audioElement = document.getElementById('remoteAudio');
      
      if (!audioElement) {
        // Create audio element if it doesn't exist
        audioElement = document.createElement('audio');
        audioElement.id = 'remoteAudio';
        audioElement.autoplay = true;
        audioElement.controls = false;
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);
      }

      if (this.remoteStream) {
        audioElement.srcObject = this.remoteStream;
        audioElement.play().catch(error => {
          console.warn('⚠️ Failed to play remote audio (user interaction required):', error);
        });
        
        console.log('🎵 Remote audio started');
      }
    } catch (error) {
      console.error('❌ Failed to play remote audio:', error);
    }
  }

  // Mute local microphone
  mute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      
      // Notify peer
      this.socket.emit('webrtc_media_state', {
        callId: this.callId,
        peerType: this.peerType,
        audioEnabled: false
      });

      this.emit('localMuted', true);
      console.log('🔇 Microphone muted');
    }
  }

  // Unmute local microphone
  unmute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
      
      // Notify peer
      this.socket.emit('webrtc_media_state', {
        callId: this.callId,
        peerType: this.peerType,
        audioEnabled: true
      });

      this.emit('localMuted', false);
      console.log('🔊 Microphone unmuted');
    }
  }

  // Check if muted
  isMuted() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      return audioTrack ? !audioTrack.enabled : true;
    }
    return true;
  }

  // End voice call and cleanup
  endCall() {
    try {
      console.log('📴 Ending voice call...');

      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Stopped track:', track.kind);
        });
        this.localStream = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Leave WebRTC room
      if (this.socket && this.callId) {
        this.socket.emit('leave_call_room', {
          callId: this.callId,
          peerType: this.peerType
        });
      }

      // Remove audio element
      const audioElement = document.getElementById('remoteAudio');
      if (audioElement) {
        audioElement.remove();
      }

      // Reset state
      this.remoteStream = null;
      this.callId = null;
      this.peerType = null;
      this.isInitialized = false;

      this.emit('callEnded');
      console.log('✅ Voice call ended and cleaned up');

    } catch (error) {
      console.error('❌ Error ending call:', error);
    }
  }

  // Get call statistics
  async getStats() {
    if (this.peerConnection) {
      try {
        const stats = await this.peerConnection.getStats();
        return stats;
      } catch (error) {
        console.error('❌ Failed to get stats:', error);
        return null;
      }
    }
    return null;
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebRTC event listener for ${event}:`, error);
      }
    });
  }

  // Get current state
  getState() {
    return {
      isInitialized: this.isInitialized,
      callId: this.callId,
      peerType: this.peerType,
      hasLocalStream: !!this.localStream,
      hasRemoteStream: !!this.remoteStream,
      connectionState: this.peerConnection?.connectionState,
      iceConnectionState: this.peerConnection?.iceConnectionState,
      isMuted: this.isMuted()
    };
  }
}

// Export singleton instance
export default new WebRTCService();
