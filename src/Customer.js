/** @format */

import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import style from "./index.css"

const config = { video: true, audio: true }
const configuration = { iceServers: [{ urls: "stun:stun.qq.com:3478" }] }
let peerConnection
let incall = false
let socket
const connect = async () => {
	// await fetch('/api/socket')
    socket = io()
	socket.on("connect", () => {
		console.log("connected to server, my id: ", socket.id)
		socket.emit("setInfo", { id: socket.id, type: "customer" })
        calling()
	})
	socket.on("answer", answer)
}
const calling = async () => {
    peerConnection = new RTCPeerConnection(configuration)
    setMedia()
	const offer = await peerConnection.createOffer()
	await peerConnection.setLocalDescription(new RTCSessionDescription(offer))
	socket.emit("calling", { id: socket.id, offer })
}
const answer = async (answer) => {
	console.log("answer", answer)
	await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    console.log('answer peerConnection', peerConnection)
    if (!incall) {
        await calling()
        incall = true
    }
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

const Customer = (props) => {
	const [state, setState] = useState("idle")
	const [action, setAction] = useState("Call")
	const remoteVideo = useRef()
	const remoteAudio = useRef()
	const localVideo = useRef()
	useEffect(() => {
		setAction("Call")
        return () => setAction("Call")
	}, [])

	const call = () => {
		// setMedia({ remoteAudio: remoteAudio.current, remoteVideo: remoteVideo.current, localVideo: localVideo.current })
		setAction("Ringing")
		connect()
	}
	const onClick = () => {
		if (action === "Call") call()
	}
	return (
		<div>
			<h1>客户Customer</h1>
			<button onClick={onClick}>{action}</button>
			<div className={style.medias}>
				<video id="localVideo" className={style.local} autoPlay muted playsInline ref={localVideo}></video>
				<video id="remoteVideo" className={style.remote} autoPlay muted playsInline ref={remoteVideo}></video>
				<audio autoPlay ref={remoteAudio}></audio>
			</div>
		</div>
	)
}

export default Customer
