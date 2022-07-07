/** @format */

import React, { useState, useRef, useEffect } from "react"
import { io } from "socket.io-client"
import Peer from "simple-peer"
import { Button, Layout, message, Modal } from "antd"
import { PhoneOutlined, MessageOutlined, UserOutlined } from "@ant-design/icons"
import VideoDom from "../components/VideoDom"
import "./index.less"
import buzz from "buzz"

import callSound from "../assets/sound1.mp3"
import answerSound from "../assets/sound5.mp3"

const { Header, Sider, Content } = Layout

const socket = io()

const Customer = (props) => {
	const [callAccepted, setCallAccepted] = useState(false)
	const [callEnded, setCallEnded] = useState(false)
	const [name, setName] = useState("userName")
	const [call, setCall] = useState({})
	const [clients, setclients] = useState(null)
	const [callList, setCallList] = useState([])
	const [callIng, setCallIng] = useState(false)

	const me = useRef("")
	const userVideo = useRef()
	const connectionRef = useRef()
	const cusVideo = useRef()
	const callUserSound = new buzz.sound(callSound, {
			formats: [],
		}),
		answerUserSound = new buzz.sound(answerSound, {
			formats: [],
		})

	useEffect(() => {
		// utils.getMediaStream().then((currentStream) => {
		// 	console.log(currentStream, "currentStreamcurrentStreamcurrentStreamcurrentStream")
		// 	setStream(currentStream)
		// 	myVideo.current && currentStream ? (myVideo.current.srcObject = currentStream) : ""
		// })
		//接通后返回当前客户端socket id
		socket.on("me", (myId) => {
			me.current = myId
			socket.emit("setInfo", { id: myId, name: name, type: "customer" })
			console.log("myid:", myId)
		})

		//监听客户端clients更新
		socket.on("clients", (data) => {
			setclients(data)
			getCallList(data)
		})

		//被呼叫
		socket.on("callUser", ({ from, name: callerName, signal }) => {
			setCall({ isReceivingCall: true, from, name: callerName, signal })
		})
	}, [])

	useEffect(() => {
		if (call.isReceivingCall && !callAccepted) {
			answerUserSound
				.play()
				.fadeIn()
				.bind("timeupdate", function () {
					var timer = buzz.toTimer(this.getTime())
					document.getElementById("timer").innerHTML = timer
				})
			console.log("play")
		}
	}, [call, callAccepted])

	//过滤能呼叫的房间list
	const getCallList = (data) => {
		let callList = data.filter((item) => item.id != me.current && item.type == "service")
		setCallList(callList)
	}

	const answerCall = (state) => {
		console.log("answerCall")
		if (state == "cancel") {
			socket.emit("cancelCall", { signal: null, to: call.from })
			setCallAccepted(false)
			setCall({ isReceivingCall: false })
			answerUserSound.pause()
			return
		}
		let stream = cusVideo.current.getStream()
		setCallAccepted(true)
		const peer = new Peer({ initiator: false, config: { iceServers: [{ urls: "stun:stun.qq.com:3478" }] }, trickle: false, stream })

		connectionRef.current = peer
		//得到回复
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: call.from })
		})

		//应答后接收对方信号流
		peer.on("stream", (currentStream) => {
			answerUserSound.pause()
			userVideo.current.srcObject = currentStream
		})

		peer.on("close", () => {
			console.log("close-peer")
			setCallEnded(true)
			connectionRef.current.destroy()
			window.location.reload()
		})

		peer.signal(call.signal)
	}

	//呼叫
	const callUser = () => {
		let stream = cusVideo.current.getStream()

		console.log("my-id:", me)
		console.log("all-clients:", clients)
		console.log("callListcallList:", callList)
		let callid = null

		callUserSound.play().fadeIn().loop()
		// .bind("timeupdate", function () {
		// 	var timer = buzz.toTimer(this.getTime())
		// 	document.getElementById("timer").innerHTML = timer
		// })

		if (callList.length == 0) {
			message.info("坐席忙,请稍后再联系")
			return
		} else {
			callid = callList[0]["id"]
			//后续更新还能被call的客服list
		}
		setCallIng(true)
		// 发起节点的initiator 需要设置为true
		const peer = new Peer({ initiator: true, config: { iceServers: [{ urls: "stun:stun.qq.com:3478" }] }, trickle: false, stream })

		connectionRef.current = peer
		//得到回复
		peer.on("signal", (data) => {
			console.log({ userToCall: callid, signalData: data, from: me.current, name }, "peersignalpeersignalpeersignal")
			socket.emit("callUser", { userToCall: callid, signalData: data, from: me.current, name })
		})
		//应答后接收对方信号流
		peer.on("stream", (currentStream) => {
			console.log(currentStream, "streamstreamstreamstream")
			setCallIng(false)
			callUserSound.pause().fadeOut(1000)
			userVideo.current.srcObject = currentStream
		})

		peer.on("close", () => {
			console.log("close-peer")
			setCallEnded(true)
			connectionRef.current.destroy()
			window.location.reload()
		})

		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		socket.on("cancelCall", (signal) => {
			console.log("cancelCall")
			callUserSound.pause().fadeOut(1000)
			message.info("坐席忙,请稍后再联系")
			setCallAccepted(false)
			setCallIng(false)
		})
	}

	//挂断
	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
		window.location.reload()
	}

	return (
		<Layout>
			<Header className="header">客户Customer</Header>
			<div id="timer"></div>
			<Layout>
				<Content>
					{call.isReceivingCall && !callAccepted && (
						<Modal
							title={`${call.name} is calling`}
							visible={true}
							onOk={answerCall}
							onCancel={() => {
								answerCall("cancel")
							}}>
							<p>来之xxx用户的呼叫...</p>
						</Modal>
					)}
					<div className="videoBox">
						{/* {stream && <video autoPlay muted ref={myVideo}></video>} */}
						<VideoDom ref={cusVideo} />
						{callAccepted && !callEnded && <video autoPlay ref={userVideo}></video>}
					</div>
					{callAccepted && !callEnded ? (
						<Button onClick={leaveCall}>挂断</Button>
					) : (
						<Button block={true} type="primary" icon={<PhoneOutlined />} onClick={callUser}>
							{callIng ? "呼叫中……" : "呼叫客服"}
						</Button>
					)}
				</Content>
				<Sider className="sider">
					<h2>
						<MessageOutlined style={{ fontSize: "16px", color: "#08c" }} />
						在线客服
					</h2>

					{callList &&
						callList.map((item, index) => {
							return (
								<p key={item.id}>
									<UserOutlined />
									客服{index + 1}
									{/* {item.id} */}
								</p>
							)
						})}
				</Sider>
			</Layout>
		</Layout>
	)
}
export default Customer
