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
const delClient = (socket) => {
	clients = clients.filter((item) => item.id != socket.id)
	io.sockets.emit("clients", clients)
	return clients
}
const setInfo = (data) => {
	if (!clients.some((item) => item.id == data.id)) {
		clients.push(data)
	}
	io.sockets.emit("clients", clients)
}

const disconnect = (socket) => {
	delClient(socket)
}
const p2pServer = (server) => {
	io = require("socket.io")(server)
	io.on("connection", (socket) => {
		socket.emit("me", socket.id)

		socket.on("disconnect", () => {
			disconnect(socket)
			socket.broadcast.emit("callEnded")
		})

		socket.on("callUser", ({ userToCall, signalData, from, name }) => {
			io.to(userToCall).emit("callUser", { signal: signalData, from, name })
		})

		socket.on("answerCall", (data) => {
			io.to(data.to).emit("callAccepted", data.signal)
		})
		socket.on("cancelCall", (data) => {
			io.to(data.to).emit("cancelCall", data.signal)
		})

		socket.on("setInfo", (data) => setInfo(data))
	})
}
exports.clients = clients
module.exports = p2pServer
