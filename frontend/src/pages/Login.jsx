import { useState } from 'react'
import axios from 'axios'
import { setCurrentUser } from '../lib/session'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	const onSubmit = async (e) => {
		e.preventDefault()
		setError('')
		try {
			const res = await axios.post(`${API_BASE}/api/users/login`, { email, password })
			setCurrentUser(res.data)
			window.location.href = '/'
		} catch (err) {
			setError('Invalid credentials')
		}
	}

	return (
		<div className="max-w-sm mx-auto bg-white border p-6 rounded">
			<h1 className="text-xl font-semibold mb-4">Login</h1>
			<form className="space-y-3" onSubmit={onSubmit}>
				<input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
				<input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
				{error && <div className="text-red-600 text-sm">{error}</div>}
				<button className="w-full bg-blue-600 text-white rounded py-2">Login</button>
			</form>
		</div>
	)
}
