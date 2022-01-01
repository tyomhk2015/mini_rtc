# mini_rtc

WebRTC w/ Web Sockets

---

**HTTP**
* HTTP is `stateless` protocol, meaning the server do not know who the current user is once it finishes handling the client's request.
* The server only reacts when there is a request, otherwise in idle. (1:1 communication)

**Web Socket**
* One of protocols for communicating between a server and clients.
<pre>
  For connection, wss://domain.blah or ws://domain.blah
</pre>
* Once connected w/ WSS, the server remembers the connected user, and can send messages prior to the client's request. (No more 1:1 of req and res!)
* The connection is two-way direction, server can send many signals and at any point, arbitrarily. So do the client. (N:N communication)

<br>
<img src="https://blog.scaleway.com/content/images/2021/02/websockets-bigger-4.png" />

* Implementing WebSocket is more similar to adding events at the frontEnd, not like HTTPs.

**Glossary**
* Implementation
<br>
Following some rules for building something and turn it into code.

**Socket IO**

Homepage : https://socket.io/

* Not an implementation of WebSocket.
* This is a framework/library supporting `real-time`, `bidirectional`, and `event-driven` communication for Front-end and Back-end.
* If there are browsers that do not support `WebSocket`, this framework will help those browsers to achieive real-time communication by other methods.
* Pros: You do not need to implement all the technial features, you need, from scratch.
<br>E.g) Reconnect to the server when the connection is disconnected.

💡 Adapter

* Resource: https://socket.io/docs/v4/glossary/#adapter
* Synchronize you RTC applications among the other servers.

<br>
<img src="https://socket.io/assets/images/mongo-adapter-88a4451b9d19d21c8d92d9a7586df15b.png" />
<br>


**WebRTC**

* Prequisite
1. Get video/camera from user to show it on the screen.
2. Mute/Unmute, Camera On/Off, Rear/Front camera mode triggers.
3. Permission for using media devices must be allowed.

📝 Note
* If one browser is using the media of the device, camera, the other browser cannot get the information about the device because it is already occupied.
<pre>
An Error
In Chrome & Edge:
  DOMException: Could not start video source

In FireFox:
  DOMException: Failed to allocate videosource
</pre>

* Stream give different tracks, like audio,video, subtitle etc.
* MediaDevices: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices

💡 Peer-to-Peer (P2P)
* A system that do not need a central DB, for transmitting audios / videos / text.
* Your computer, or node, will be a client and a server at the same time.
* WebRTC allows us to make P2P connections.

<img src="https://www.informatique-mania.com/wp-content/uploads/2020/12/Diferencias-servidor-y-red-P2P.jpg">

<img src="https://melavi.de/wp-content/uploads/2015/08/WebRTC_SimpleP2P.png ">

* The need of a server on P2P system; signaling.
<br>To enable clients to find connection settings for communicating with other clients. (Eg. Browser, Port, IP, Location, OS ... etc)

💡 Steps for building webRTC

<img src="https://miro.medium.com/max/1600/1*hQHzaT-JB1Wx3y0qtQX8Kw.png" style="background: white;">

* Negotiating the mean of communcating with ICEcandidate, between peers, is mandatory.

💡 WebRTC lifecycle
<br> https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Session_lifetime


🛠 **Troubleshooting**
<br>
❌ Problem

* Safari browser was not showing peer's camera in the video tag.

<br>
🔎 Reason

* 'addstream' event of `RTCPeerConnection` was deprecated.

<br>
✅ Solution

* Added the event listener `track`, instead of `addstream`, on the `RTCPeerConnection` object.
* In the `srcObject` of video tag DOM, put `Mediastream`.


💡 **STUN server**

<br>📝 Resource : <a href="https://help.singlecomm.com/hc/en-us/articles/115007993947-STUN-servers-A-Quick-Start-Guide">What is a STUN Server?</a>

* (Over simplified) A server telling other clients what the other clients' public IP addresses are, for the purpose of connecting the clients together.

* The webRTC, that worked on local network, will not work on the internet unless you setup or use a STUN server.

🔥 **Cons of WebRTC**

* As the number of peers increase, the burden that the computer or node has to tolerate gets heavier.

<img src="https://thenewdialtone.com/wp-content/uploads/2016/04/Complex-Full-Mesh-Video-Conferencing.jpg">

* To relieve the problem, there are other architectures that other services are using.

<img src="https://chrisuehlinger.com/static/9ad7bc3ad96c8e36d8e958d6511e131d/38aa5/mesh-vs-sfu.png">

* Sending other than video and audio tracks, which is expensive process, using <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels">Data Channels</a> can reduce the burden of sending data between peers.