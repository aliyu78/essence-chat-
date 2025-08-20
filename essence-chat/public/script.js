// Chat & Messages
const messageForm = document.getElementById('messageForm');
const messagesDiv = document.getElementById('messages');
if(messageForm){
  messageForm.addEventListener('submit', e=>{
    e.preventDefault();
    const input = document.getElementById('messageInput');
    const msg = input.value.trim();
    if(msg){
      const div = document.createElement('div');
      div.textContent = `${localStorage.getItem('username')||'User'}: ${msg}`;
      div.style.opacity=0; div.style.transform='translateX(-20px)';
      messagesDiv.appendChild(div);
      setTimeout(()=>{ div.style.opacity=1; div.style.transform='translateX(0)'; div.style.transition='all 0.4s ease'; },50);
      input.value=''; messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  });
}

// Login
const loginBtn = document.getElementById('loginBtn');
if(loginBtn){
  loginBtn.addEventListener('click', ()=>{
    const username = document.getElementById('username').value.trim();
    if(username){ localStorage.setItem('username',username); window.location.href='chat.html'; }
  });
}

// Video / Audio Call
const socket = io();
const joinBtn = document.getElementById('joinCall');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream, peerConnection;
const config = { iceServers:[{urls:'stun:stun.l.google.com:19302'}] };

if(joinBtn){
  joinBtn.addEventListener('click', async()=>{
    const roomId=document.getElementById('roomInput').value.trim();
    if(!roomId) return alert('Enter room ID');
    localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    localVideo.srcObject=localStream;
    socket.emit('join-room',roomId,socket.id);
    peerConnection=new RTCPeerConnection(config);
    localStream.getTracks().forEach(track=>peerConnection.addTrack(track,localStream));
    peerConnection.ontrack=e=>{ remoteVideo.srcObject=e.streams[0]; }
    socket.on('offer',async(offer,userId)=>{ await peerConnection.setRemoteDescription(offer); const answer=await peerConnection.createAnswer(); await peerConnection.setLocalDescription(answer); socket.emit('answer',answer,userId); });
    socket.on('answer',async answer=>{ await peerConnection.setRemoteDescription(answer); });
    socket.on('ice-candidate',async candidate=>{ try{ await peerConnection.addIceCandidate(candidate); }catch(err){console.error(err);} });
    peerConnection.onicecandidate=e=>{ if(e.candidate){ socket.emit('ice-candidate',e.candidate,null); } };
  });
}

// Optional: draggable local video on mobile
if(localVideo){
  let isDragging=false, offsetX, offsetY;
  localVideo.addEventListener('touchstart',e=>{ isDragging=true; const t=e.touches[0]; offsetX=t.clientX-localVideo.getBoundingClientRect().left; offsetY=t.clientY-localVideo.getBoundingClientRect().top; });
  localVideo.addEventListener('touchmove',e=>{ if(!isDragging) return; const t=e.touches[0]; localVideo.style.left=(t.clientX-offsetX)+'px'; localVideo.style.top=(t.clientY-offsetY)+'px'; localVideo.style.position='fixed'; });
  localVideo.addEventListener('touchend',()=>isDragging=false);
}
