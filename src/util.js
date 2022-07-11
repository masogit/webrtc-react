/** @format */

//检查是否支持 WebRTC
export function isSupportRTC() {
	return !!navigator.mediaDevices
}
// 检测是否有media权限
export async function checkMediaPermission() {
	// 请求获得媒体流输入（包含声音和视频）
	const stream = await navigator.mediaDevices.getUserMedia({
		audio: true,
		video: true,
	})

	// 判断是否有视频和声音轨道输入
	const result = stream.getAudioTracks().length && stream.getVideoTracks().length

	// 终止媒体流输入
	revokeMediaStream(stream)

	return result
}

// 终止媒体流
export function revokeMediaStream(stream) {
	if (!stream) return
	const tracks = stream.getTracks()

	tracks.forEach(function (track) {
		track.stop()
	})
}

let cachedMediaStream = null
export async function getMediaStream() {
	if (cachedMediaStream) {
		return Promise.resolve(cachedMediaStream)
	}
	// 请求媒体流输入
	const stream = await navigator.mediaDevices.getUserMedia({
		audio: true,
		video: true,
	})

	revokeMediaStream(cachedMediaStream)
	cachedMediaStream = stream

	return cachedMediaStream
}
