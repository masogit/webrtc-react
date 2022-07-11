/** @format */
let io
// let clients = [{ id: 0, name: "0", type: "customer|service", customer: null, service: null }]
let clients = []
const addClient = (id) => {
	if (!~clients.indexOf((item) => item.id == id)) {
		clients.push({ id, name: null })
	}
	return clients
}
const delClient = (id) => {
	clients = clients.filter((item) => item.id != id)
	io.sockets.emit("clients", clients)
	return clients
}
const setInfo = (data) => {
	if (!clients.some((item) => item.id == data.id)) {
		clients.push(data)
	}
	io.sockets.emit("clients", clients)
}

const p2pServer = (server) => {
	io = require("socket.io")(server)
	io.on("connection", (socket) => {
		socket.emit("me", socket.id)

		socket.on("disconnect", () => {
			delClient(socket.id)
			socket.broadcast.emit("callEnded")
		})

		socket.on("callUser", ({ userToCall, signalData, from, name }) => {
			io.to(userToCall).emit("callUser", { signal: signalData, from, name })
			delClient(userToCall) // 删掉被呼叫的人
		})

		socket.on("answerCall", (data) => {
			io.to(data.to).emit("callAccepted", data.signal)
			delClient(data.to) // 删掉向外呼的人
		})

		socket.on("cancelCall", (data) => {
			io.to(data.to).emit("cancelCall", data.signal)
		})
		socket.on("setInfo", (data) => setInfo(data))
	})
}
exports.clients = clients
module.exports = p2pServer
