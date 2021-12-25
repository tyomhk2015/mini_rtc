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

