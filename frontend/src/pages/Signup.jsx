import { useState } from 'react'
import axios from 'axios'
import { setCurrentUser } from '../lib/session'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export default function Signup() {
	const [form, setForm] = useState({ name: '', age: 25, dob: '', email: '', password: '', risk_profile: 'moderate' })
	const [error, setError] = useState('')

	const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

	const onSubmit = async (e) => {
		e.preventDefault()
		setError('')
		try {
			const res = await axios.post(`${API_BASE}/api/users/signup`, {
				name: form.name,
				age: Number(form.age),
				dob: form.dob,
				email: form.email,
				password: form.password,
				risk_profile: form.risk_profile,
			})
			setCurrentUser(res.data)
			window.location.href = '/'
		} catch (err) {
			setError('Signup failed')
		}
	}

	return (
		<div className="max-w-sm mx-auto bg-white border p-6 rounded">
			<h1 className="text-xl font-semibold mb-4">Create account</h1>
			<form className="space-y-3" onSubmit={onSubmit}>
				<input className="w-full border rounded px-3 py-2" name="name" placeholder="Full name" value={form.name} onChange={onChange} />
				<input className="w-full border rounded px-3 py-2" name="age" type="number" placeholder="Age" value={form.age} onChange={onChange} />
				<input className="w-full border rounded px-3 py-2" name="dob" type="date" placeholder="DOB" value={form.dob} onChange={onChange} />
				<input className="w-full border rounded px-3 py-2" name="email" placeholder="Email" value={form.email} onChange={onChange} />
				<input className="w-full border rounded px-3 py-2" name="password" placeholder="Password" type="password" value={form.password} onChange={onChange} />
				<select className="w-full border rounded px-3 py-2" name="risk_profile" value={form.risk_profile} onChange={onChange}>
					<option value="low">Low</option>
					<option value="moderate">Moderate</option>
					<option value="high">High</option>
				</select>
				{error && <div className="text-red-600 text-sm">{error}</div>}
				<button className="w-full bg-blue-600 text-white rounded py-2">Sign up</button>
			</form>
		</div>
	)
}
