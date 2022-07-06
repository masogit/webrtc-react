import React, { lazy } from 'react'
import './App.css';
import { Link, useRoutes } from "react-router-dom";
import Service from './Service'

const Customer = lazy(() => import('./Customer'));
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
  { path: "customer", element: <Customer/> },
  { path: "service", element: <Service /> },
]
function App() {
  return useRoutes(routes)
}

function Homepage() {
  return <ul>
    <li>
      <Link to="/customer">customer</Link>
    </li>
    <li>
      <Link to="/service">service</Link>
    </li>
  </ul>
}
export default App;
