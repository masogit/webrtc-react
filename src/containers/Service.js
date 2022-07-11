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

const Service = (props) => {
	const [callAccepted, setCallAccepted] = useState(false)
	const [callEnded, setCallEnded] = useState(false)
	const [name, setName] = useState("客服一号")
	const [call, setCall] = useState({})
	const [clients, setclients] = useState(null)
	const [callList, setCallList] = useState([])
	const [callIng, setCallIng] = useState(false)

	const me = useRef("")
	const userVideo = useRef(null)
	const connectionRef = useRef()
	const cusVideo = useRef()
	const callUserSound = new buzz.sound(callSound, {
			formats: [],
		}),
		answerUserSound = new buzz.sound(answerSound, {
			formats: [],
		})

	useEffect(() => {
		//接通后返回当前客户端socket id
		socket.on("me", (myId) => {
			me.current = myId
			socket.emit("setInfo", { id: myId, name: name, type: "service" })
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
			answerUserSound.play().fadeIn()
		}
	}, [call, callAccepted])

	//过滤能呼叫的房间list
	const getCallList = (data) => {
		let callList = data.filter((item) => item.id != me.current && item.type != "service")
		setCallList(callList)
	}

	const answerCall = (state) => {
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
			userVideo.current = currentStream
			answerUserSound.pause()
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
	const callUser = (id) => {
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
			callid = id
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
			userVideo.current = currentStream
			setCallIng(false)
			callUserSound.pause().fadeOut(1000)
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
			<Header className="header">Service</Header>
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
						<VideoDom ref={cusVideo} />
						{callAccepted && !callEnded && <VideoDom title={call.name} peer={connectionRef.current} />}
					</div>
					{callAccepted && !callEnded ? (
						<Button onClick={leaveCall}>挂断</Button>
					) : (
						<Button block={true} type="primary" icon={<PhoneOutlined />}>
							{callIng ? "呼叫中……" : "呼叫用户"}
						</Button>
					)}
				</Content>
				<Sider className="sider" breakpoint="sm">
					<h2>
						<MessageOutlined style={{ fontSize: "16px", color: "#08c" }} />
						在线用户
					</h2>
					{callList &&
						callList.map((item) => {
							return (
								<div
									key={item.id}
									onClick={() => {
										callUser(item.id)
									}}>
									{item.id}
								</div>
							)
						})}
				</Sider>
			</Layout>
		</Layout>
	)
}
export default Service
