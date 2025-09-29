import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Goals from './pages/Goals'
import AIInsights from './pages/AIInsights'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{ index: true, element: <Home /> },
			{ path: 'portfolio', element: <Portfolio /> },
			{ path: 'goals', element: <Goals /> },
			{ path: 'ai', element: <AIInsights /> },
			{ path: 'login', element: <Login /> },
			{ path: 'signup', element: <Signup /> },
			{ path: 'profile', element: <Profile /> },
		],
	},
])

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
)
