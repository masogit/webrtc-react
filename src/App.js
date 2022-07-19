/** @format */

import React, { lazy } from "react"
import "./App.less"
import { Link, useRoutes } from "react-router-dom"

const Customer = lazy(() => import("./containers/ib/Customer"))
const Service = lazy(() => import("./containers/ib/Service"))
const RJCustomer = lazy(() => import("./containers/ruijin/Customer"))
const RJService = lazy(() => import("./containers/ruijin/Service"))

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
	{ path: "linkUp-ib/customer/:hospitalUid", element: <Customer /> },
	{ path: "linkUp-ib/service/:hospitalUid", element: <Service /> },
	{ path: "linkUp-ruijin/customer/:hospitalUid", element: <RJCustomer /> },
	{ path: "linkUp-ruijin/service/:hospitalUid", element: <RJService /> },
]
function App() {
	return useRoutes(routes)
}

function Homepage() {
	return (
		<ul>
			<li>
				<Link to="/linkUp-ib/customer/123">customer</Link>
			</li>
			<li>
				<Link to="/linkUp-ib/service/456">service</Link>
			</li>
			<li>
				<Link to="/linkUp-ruijin/customer/123">瑞金-customer</Link>
			</li>
			<li>
				<Link to="/linkUp-ruijin/service/456">瑞金-service</Link>
			</li>
		</ul>
	)
}
export default App
