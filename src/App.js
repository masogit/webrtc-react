/** @format */

import React, { lazy } from "react"
import "./App.less"
import { Link, useRoutes } from "react-router-dom"

const Customer = lazy(() => import("./containers/Customer"))
const Service = lazy(() => import("./containers/Service"))

const routes = [
	{
		path: "/",
		element: <Homepage />,
		// children: [
		//   {
		//     path: "messages",
		//     element: <DashboardMessages />,
		//   },
		//   { path: "tasks", element: <DashboardTasks /> },
		// ],
	},
	{ path: "customer", element: <Customer /> },
	{ path: "service", element: <Service /> },
]
function App() {
	return useRoutes(routes)
}

function Homepage() {
	return (
		<ul>
			<li>
				<Link to="/customer">customer</Link>
			</li>
			<li>
				<Link to="/service">service</Link>
			</li>
		</ul>
	)
}
export default App
