/** @format */
let io
let clients = [{ id: 0, name: "0", type: "customer|service", offer: null, answer: null, customer: null, service: null }]

const addClient = (id) => {
	if (clients.indexOf((item) => item.id == id) < 0) {
		clients.push({ id, name: null })
	}
	return clients
}
const delClient = (socket) => {
	clients = clients.filter((item) => item.id != socket.id)
	console.log("delClient-clients", clients)
	console.log("delClient-id", socket.id)
    socket.emit("clients", clients)
	return clients
}
const setInfo = (socket, data) => {
	console.log("setInfo-data", data)
	const client = clients.find((item) => item.id == data.id)
	if (client) {
		Object.assign(client, data)
	}
	io.emit("clients", clients)
}
const calling = (socket, data) => {
	console.log("calling", data)
	const customer = clients.find((item) => item.id == socket.id)
	const service = clients.find((item) => item.type == "service")
	if (customer && service) {
		socket.to(service.id).emit("calling", data.offer)
		service.customerId = customer.id
        customer.serviceId = service.id
	}
    io.emit("clients", clients)
}
const answering = (socket, data) => {
	const service = clients.find((item) => item.id == socket.id)
	if (service && service.customerId) {
		socket.to(service.customerId).emit("answer", data.answer)
	}
	console.log("answering", service)
}
const disconnect = (socket) => {
    delClient(socket)
    io.emit("clients", clients)
    console.log("disconnectdisconnectdisconnectdisconnect", socket.id)
}
const p2pServer = (server) => {
    io = require("socket.io")(server)
	io.on("connection", (socket) => {
		console.log(`Client with ID of ${socket.id} connected! `)
		addClient(socket.id)
		console.log(clients, "clientsclientsclientsclients")
		io.sockets.emit("clients", clients)
		socket.on("setInfo", (data) => setInfo(socket, data))
		socket.on("calling", (data) => calling(socket, data))
		socket.on("answering", (data) => answering(socket, data))
		socket.on("disconnect", () => disconnect(socket))
	})
}
exports.clients = clients
module.exports = p2pServer
