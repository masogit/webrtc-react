/** @format */

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react"

import * as utils from "../util"

const VideoDom = (props, ref) => {
	const videoRef = useRef(null)
	const [stream, setStream] = useState()

	useEffect(() => {
		const updateStream = (stream) => {
			if (!videoRef.current) return
			// 自己则mute
			videoRef.current.muted = !props.stream
			setStream(stream)
			videoRef.current.srcObject = stream
		}
		if (props.stream) {
			console.log(1)
			videoRef.current.muted = false
			videoRef.current.srcObject = props.stream
			return
		} else {
			console.log(2)
			utils.getMediaStream().then(updateStream)
		}

		return () => {
			if (!props.peer) return
		}
	}, [])

	useImperativeHandle(ref, () => ({
		getStream: () => {
			return stream
		},
	}))

	return <video ref={videoRef} autoPlay></video>
}

export default forwardRef(VideoDom)
