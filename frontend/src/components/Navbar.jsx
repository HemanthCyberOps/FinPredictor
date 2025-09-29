import { NavLink } from 'react-router-dom'
import { getCurrentUser, clearCurrentUser } from '../lib/session'

const linkClass = ({ isActive }) =>
	`px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}`

export default function Navbar() {
	const user = getCurrentUser()
	return (
		<header className="bg-white border-b">
			<div className="container mx-auto px-4 h-14 flex items-center justify-between">
				<div className="font-semibold">FinPredictor</div>
				<nav className="flex gap-2 items-center">
					<NavLink to="/" className={linkClass} end>
						Home
					</NavLink>
					<NavLink to="/portfolio" className={linkClass}>Portfolio</NavLink>
					<NavLink to="/goals" className={linkClass}>Goals</NavLink>
					<NavLink to="/ai" className={linkClass}>AI Insights</NavLink>
					{user ? (
						<>
							<NavLink to="/profile" className={linkClass}>Profile</NavLink>
							<span className="text-sm text-gray-600 ml-2">{user.name}</span>
							<button onClick={() => { clearCurrentUser(); window.location.reload(); }} className="ml-2 px-3 py-2 text-sm border rounded">
								Logout
							</button>
						</>
					) : (
						<>
							<NavLink to="/login" className={linkClass}>Login</NavLink>
							<NavLink to="/signup" className={linkClass}>Sign up</NavLink>
						</>
					)}
				</nav>
			</div>
		</header>
	)
}
