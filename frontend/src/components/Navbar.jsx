import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
	`px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}`

export default function Navbar() {
	return (
		<header className="bg-white border-b">
			<div className="container mx-auto px-4 h-14 flex items-center justify-between">
				<div className="font-semibold">FinPredictor</div>
				<nav className="flex gap-2">
					<NavLink to="/" className={linkClass} end>
						Home
					</NavLink>
					<NavLink to="/portfolio" className={linkClass}>Portfolio</NavLink>
					<NavLink to="/goals" className={linkClass}>Goals</NavLink>
					<NavLink to="/ai" className={linkClass}>AI Insights</NavLink>
				</nav>
			</div>
		</header>
	)
}
