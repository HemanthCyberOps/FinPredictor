import { useState } from 'react'
import { getCurrentUser, setCurrentUser } from '../lib/session'

export default function Profile() {
	const user = getCurrentUser() || { name: '', risk_profile: 'moderate', monthly_income: 0 }
	const [risk, setRisk] = useState(user.risk_profile || 'moderate')
	const [income, setIncome] = useState(user.monthly_income || 0)

	const save = () => {
		const updated = { ...user, risk_profile: risk, monthly_income: Number(income) }
		setCurrentUser(updated)
		alert('Saved!')
	}

	return (
		<div className="max-w-md mx-auto bg-white border rounded p-6">
			<h1 className="text-xl font-semibold mb-4">Profile</h1>
			<div className="space-y-3">
				<div>
					<label className="block text-sm text-gray-600">Risk Profile</label>
					<select className="border rounded px-3 py-2 w-full" value={risk} onChange={e => setRisk(e.target.value)}>
						<option value="low">Low</option>
						<option value="moderate">Moderate</option>
						<option value="high">High</option>
					</select>
				</div>
				<div>
					<label className="block text-sm text-gray-600">Monthly Income (₹)</label>
					<input className="border rounded px-3 py-2 w-full" type="number" value={income} onChange={e => setIncome(e.target.value)} />
				</div>
				<button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
			</div>
		</div>
	)
}
