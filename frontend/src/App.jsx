import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

export default function App() {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="container mx-auto px-4 py-6 flex-1">
				<Outlet />
			</main>
		</div>
	)
}
