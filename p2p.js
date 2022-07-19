/** @format */
let io
// let clients = [{ id: 0, name: "0", type: "customer|service", customer: null, service: null }]

const p2pServer = (server) => {
	io = require("socket.io")(server)
	const userNamespace = io.of(/^\/linkUp-\w{1,}/)

	let allClients = {}

	const delClient = (id, workspace) => {
		console.log(id, "delClientdelClientdelClientdelClientdelClientdelClient")
		let spaceName = workspace.name
		allClients[spaceName] = allClients[spaceName].filter((item) => item.id != id)
		workspace.emit("clients", allClients[spaceName])
		console.log(allClients[spaceName], "clients")
		return allClients
	}
	const setInfo = (data, workspace) => {
		let spaceName = workspace.name
		if (allClients[spaceName]) {
			if (!allClients[spaceName].some((item) => item.id == data.id)) {
				allClients[spaceName].push(data)
			}
		} else {
			allClients[spaceName] = [data]
		}
		console.log(allClients, "allClients")
		workspace.emit("clients", allClients[spaceName])
	}

	// userNamespace.use((socket, next) => {
	// 	console.log(socket, "socketsocketsocketsocket")
	// 	next()
	// })

	userNamespace.on("connection", (socket) => {
		const workspace = socket.nsp
		socket.emit("me", socket.id)
		socket.on("setInfo", (data) => setInfo(data, workspace))

		socket.on("disconnect", () => {
			console.log(socket.id, "disconnect")
			delClient(socket.id, workspace)
			// socket.broadcast.emit("callEnded")
		})

		socket.on("callUser", ({ userToCall, signalData, from, name }) => {
			// console.log("server-callUser")
			userNamespace.to(userToCall).emit("callUser", { signal: signalData, from, name })
			delClient(userToCall, workspace) // 删掉被呼叫的人
		})

		socket.on("answerCall", (data) => {
			userNamespace.to(data.to).emit("callAccepted", data.signal)
			delClient(data.to, workspace) // 删掉向外呼的人
		})

		socket.on("cancelCall", (data) => {
			userNamespace.to(data.to).emit("cancelCall", data.signal)
		})
	})
}
// exports.clients = clients
module.exports = p2pServer
