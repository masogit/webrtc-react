/** @format */

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react"
import "./videobox.less"
import * as utils from "../util"

const VideoDom = (props, ref) => {
	const videoRef = useRef(null)
	const streams = useRef(null)
	const [videoTracks, setVideoTracks] = useState([])
	useEffect(() => {
		const updateStream = (stream) => {
			console.log("updateStream")
			const dom = videoRef.current
			if (!dom) return
			// 自己则mute
			dom.muted = !props.peer
			let getAudioTracks = stream.getAudioTracks()
			let getVideoTracks = stream.getVideoTracks()
			console.log(getAudioTracks, "getAudioTracks")
			console.log(getVideoTracks, "getVideoTracks")
			setVideoTracks(getVideoTracks)
			// setStream(stream)
			streams.current = stream
			if ("srcObject" in dom) {
				dom.srcObject = stream
				dom.onloadedmetadata = function () {
					dom.play()
				}
				return
			}
			dom.src = URL.createObjectURL(stream)
			dom.play()
		}
		if (props.peer) {
			console.log("props.peer")
			props.peer.on("stream", updateStream)
			return
		}
		utils.getMediaStream().then(updateStream)

		return () => {
			utils.revokeMediaStream(streams.current)
		}
	}, [props.peer])

	useImperativeHandle(ref, () => ({
		getStream: () => {
			return streams.current
		},
	}))

	return (
		<div className="video-wrap">
			{props.title && <h4>{props.title}</h4>}
			<video ref={videoRef} autoPlay></video>
		</div>
	)
}

export default forwardRef(VideoDom)
