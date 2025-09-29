import { useState } from 'react'
import axios from 'axios'
import { setCurrentUser } from '../lib/session'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export default function Login() {
	const [mode, setMode] = useState('login') // 'login' | 'signup'
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	// signup extras
	const [name, setName] = useState('')
	const [age, setAge] = useState(25)
	const [dob, setDob] = useState('')
	const [risk, setRisk] = useState('moderate')

	const onSubmit = async (e) => {
		e.preventDefault()
		setError('')
		try {
			if (mode === 'login') {
				const res = await axios.post(`${API_BASE}/api/users/login`, { email, password })
				setCurrentUser(res.data)
				window.location.href = '/'
			} else {
				const res = await axios.post(`${API_BASE}/api/users/signup`, {
					name,
					age: Number(age),
					dob,
					email,
					password,
					risk_profile: risk,
				})
				setCurrentUser(res.data)
				window.location.href = '/'
			}
		} catch (err) {
			setError(mode === 'login' ? 'Invalid credentials' : 'Signup failed')
		}
	}

	return (
		<div className="max-w-md mx-auto bg-white border p-6 rounded space-y-4">
			<h1 className="text-xl font-semibold">{mode === 'login' ? 'Login' : 'Create account'}</h1>
			<div className="flex gap-2 text-sm">
				<button className={`px-3 py-1 rounded ${mode === 'login' ? 'bg-blue-600 text-white' : 'border'}`} onClick={() => setMode('login')}>Login</button>
				<button className={`px-3 py-1 rounded ${mode === 'signup' ? 'bg-blue-600 text-white' : 'border'}`} onClick={() => setMode('signup')}>Sign up</button>
			</div>
			<form className="space-y-3" onSubmit={onSubmit}>
				{mode === 'signup' && (
					<>
						<input className="w-full border rounded px-3 py-2" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
						<div className="grid grid-cols-2 gap-2">
							<input className="w-full border rounded px-3 py-2" type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
							<input className="w-full border rounded px-3 py-2" type="date" placeholder="DOB" value={dob} onChange={e => setDob(e.target.value)} />
						</div>
					</>
				)}
				<input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
				<input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
				{mode === 'signup' && (
					<>
						<select className="w-full border rounded px-3 py-2" value={risk} onChange={e => setRisk(e.target.value)}>
							<option value="low">Low</option>
							<option value="moderate">Moderate</option>
							<option value="high">High</option>
						</select>
						<div className="text-xs text-gray-600">Used to tailor projections and AI advice. You can change this anytime in Profile.</div>
					</>
				)}
				{error && <div className="text-red-600 text-sm">{error}</div>}
				<button className="w-full bg-blue-600 text-white rounded py-2">{mode === 'login' ? 'Login' : 'Sign up'}</button>
			</form>
			{mode === 'login' && (
				<div className="text-sm text-gray-600">
					New here?{' '}
					<button className="underline text-blue-600" onClick={() => setMode('signup')}>Create an account</button>
				</div>
			)}
		</div>
	)
}
