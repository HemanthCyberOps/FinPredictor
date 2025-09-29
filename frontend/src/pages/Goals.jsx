import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/Cards'
import { GoalProgressBarChart } from '../components/Charts'
import { getCurrentUser } from '../lib/session'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export default function Goals() {
	const user = getCurrentUser()
	const userId = user?.id || 'demo-user-1'
	const [title, setTitle] = useState('Buy Car')
	const [targetAmount, setTargetAmount] = useState(800000)
	const [targetDate, setTargetDate] = useState('2027-12-31')
	const [strategy, setStrategy] = useState('moderate')
	const [goals, setGoals] = useState([])

	const strategyToReturn = (s) => s === 'conservative' ? 0.08 : s === 'aggressive' ? 0.15 : 0.12
	const riskToStrategy = (r) => r === 'low' ? 'conservative' : r === 'high' ? 'aggressive' : 'moderate'

	const load = async () => {
		const res = await axios.get(`${API_BASE}/api/goals/${userId}`).catch(() => ({ data: [] }))
		setGoals(res.data || [])
	}

	useEffect(() => {
		// default strategy from user risk
		if (user?.risk_profile) setStrategy(riskToStrategy(user.risk_profile))
		load()
	}, [])

	const addGoal = async (e) => {
		e.preventDefault()
		await axios.post(`${API_BASE}/api/goals/${userId}`, {
			title,
			target_amount: Number(targetAmount),
			target_date: targetDate,
			starting_amount: 0,
			current_sip: 0,
			expected_return_rate: strategyToReturn(strategy),
			inflation_rate: 0.05,
			salary_growth_rate: 0.05,
		}).catch(() => {})
		await load()
	}

	const progressData = goals.map(g => ({ goal: g.title, progress: Math.min(100, Math.round((g.current_sip / 10000) * 100)) }))

	return (
		<div className="space-y-6">
			<Card title="Goal Progress">
				<GoalProgressBarChart data={progressData} />
			</Card>
			<Card title="Add Goal">
				<form className="grid grid-cols-1 md:grid-cols-6 gap-3" onSubmit={addGoal}>
					<input className="border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
					<input className="border rounded px-3 py-2" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Target Amount" />
					<input className="border rounded px-3 py-2" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
					<select className="border rounded px-3 py-2" value={strategy} onChange={e => setStrategy(e.target.value)}>
						<option value="conservative">Conservative</option>
						<option value="moderate">Moderate</option>
						<option value="aggressive">Aggressive</option>
					</select>
					<button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
				</form>
				<div className="text-sm text-gray-600 mt-2">Strategy sets expected return: conservative 8%, moderate 12%, aggressive 15%.</div>
			</Card>
			<Card title="Your Goals">
				<ul className="space-y-2">
					{goals.map(g => {
						const requiredSip = Math.round((g.current_sip) || 0)
						const currentSip = g.current_sip || 0
						const delta = Math.max(requiredSip - currentSip, 0)
						return (
							<li key={g.id} className="flex items-center justify-between border rounded px-3 py-2 bg-white">
								<div>
									<div className="font-medium">{g.title}</div>
									<div className="text-xs text-gray-600">Target: ₹{g.target_amount} by {g.target_date}</div>
								</div>
								<div className="text-right text-sm">
									<div>Required SIP: ₹{requiredSip.toLocaleString()}</div>
									<div>Current SIP: ₹{currentSip.toLocaleString()}</div>
									<div className={delta > 0 ? 'text-red-600' : 'text-green-600'}>Adjustment: ₹{delta.toLocaleString()}</div>
								</div>
							</li>
						)
					})}
				</ul>
			</Card>
		</div>
	)
}
