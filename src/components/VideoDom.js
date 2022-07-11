/** @format */

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react"
import "./videobox.less"
import * as utils from "../util"

const VideoDom = (props, ref) => {
	const videoRef = useRef(null)
	const [stream, setStream] = useState()
	useEffect(() => {
		const updateStream = (stream) => {
			const dom = videoRef.current
			if (!dom) return
			// 自己则mute
			dom.muted = !props.peer
			console.log(dom, "domdomdomdomdom")
			setStream(stream)
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
			props.peer.on("stream", updateStream)
			return
		}
		utils.getMediaStream().then(updateStream)
	}, [props.peer])

	useImperativeHandle(ref, () => ({
		getStream: () => {
			return stream
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
