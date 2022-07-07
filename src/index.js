/** @format */

import React from "react"
import ReactDOM from "react-dom"
import "lib-flexible"
import "./index.less"
// import "antd/dist/antd.css" // or 'antd/dist/antd.less'
import App from "./App"
import { BrowserRouter } from "react-router-dom"

function AppWrap() {
	return (
		<BrowserRouter>
			<React.Suspense fallback={<div>Loading...</div>}>
				<App />
			</React.Suspense>
		</BrowserRouter>
	)
}

ReactDOM.render(<AppWrap />, document.getElementById("root"))

// const root = ReactDOM.createRoot(document.getElementById("root"))
// root.render(
// 	<BrowserRouter>
// 		<React.Suspense fallback={<div>Loading...</div>}>
// 			<App />
// 		</React.Suspense>
// 	</BrowserRouter>
// )
