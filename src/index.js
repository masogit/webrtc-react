/** @format */

import React from "react"
import ReactDOM from "react-dom"
import { createRoot } from "react-dom/client"
import "lib-flexible"
import "./index.less"
// import "antd/dist/antd.css" // or 'antd/dist/antd.less'
import App from "./App"
import { BrowserRouter } from "react-router-dom"

const container = document.getElementById("root")
const root = createRoot(container) // createRoot(container!) if you use TypeScript

function AppWrap() {
	return (
		<BrowserRouter>
			<React.Suspense fallback={<div>Loading...</div>}>
				<App />
			</React.Suspense>
		</BrowserRouter>
	)
}

root.render(<AppWrap />)
