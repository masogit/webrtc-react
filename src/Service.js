/** @format */

import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import style from "./index.css"

let socket
const config = { video: true, audio: true }
const configuration = { iceServers: [{ urls: "stun:stun.qq.com:3478" }] }
let peerConnection
const connect = async (setClients) => {
	// await fetch('/api/socket')
	socket = io()
	socket.on("connect", () => {
		console.log("connected to server, my id: ", socket.id)
		socket.emit("setInfo", { id: socket.id, type: "service" })
	})
	socket.on("calling", answering)
	socket.on("clients", setClients)
}
const answering = async (offer) => {
    peerConnection = new RTCPeerConnection(configuration)
    setMedia()
	console.log("answering", offer)
	await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
	const answer = await peerConnection.createAnswer()
	await peerConnection.setLocalDescription(new RTCSessionDescription(answer))
	// socket.emit("setInfo", { id: socket.id, answer, offer: customer.offer })
	socket.emit("answering", { id: socket.id, answer })
    console.log('answering peerConnection', peerConnection)
}
const setMedia = (props) => {
	// peerConnection = new RTCPeerConnection(configuration)

    // navigator.getUserMedia = (
    //     navigator.getUserMedia ||
    //     navigator.webkitGetUserMedia ||
    //     navigator.mozGetUserMedia ||
    //     navigator.msGetUserMedia
    // );
    
	navigator.getUserMedia(
		config,
		(stream) => {
            const localVideo = document.getElementById('localVideo')
            const remoteVideo = document.getElementById('remoteVideo')
            const remoteAudio = document.getElementById('remoteAudio')
			// const { remoteAudio, remoteVideo, localVideo } = props
			const audioTracks = stream.getAudioTracks()
			if (config.video && localVideo) {
				localVideo.srcObject = stream
			}
			stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream))

			peerConnection.addStream(stream)
			peerConnection.ontrack = (e) => {
				config.audio && !config.video && remoteAudio && (remoteAudio.srcObject = e.streams[0])
				config.video && remoteVideo && (remoteVideo.srcObject = e.streams[0])
			}
		},
		(error) => {
			console.warn(error.message)
		}
	)
}

const Service = (props) => {
	const [state, setState] = useState("idle")
	const [action, setAction] = useState("Online")
	const remoteVideo = useRef()
	const remoteAudio = useRef()
	const localVideo = useRef()
	const [clients, setClients] = useState([])
	useEffect(() => {
		// connect()
		// useMedia({ remoteAudio: remoteAudio.current, remoteAudio: remoteAudio.current, localVideo: localVideo.current })
		// return () => ssClose()
	}, [])

	const online = () => {
		setAction("Offline")
		// setMedia({ remoteAudio: remoteAudio.current, remoteAudio: remoteAudio.current, localVideo: localVideo.current })
		connect(setClients)
	}
	const onClick = () => {
		if (action === "Online") online()
	}

	return (
		<div>
			<h1>客服Service</h1>
			<ul>
				{clients.map((client, index) => (
					<li key={index}>{JSON.stringify(client)}</li>
				))}
			</ul>
			<button onClick={onClick}>{action}</button>
			<div className={style.medias}>
				<video id="localVideo" className={style.local} autoPlay muted playsInline ref={localVideo}></video>
				<video id="remotelVideo" className={style.remote} autoPlay muted playsInline ref={remoteVideo}></video>
				<audio autoPlay ref={remoteAudio}></audio>
			</div>
		</div>
	)
}

export default Service
