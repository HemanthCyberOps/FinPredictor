import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/Cards'
import { GoalProgressBarChart } from '../components/Charts'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
const DEMO_USER = 'demo-user-1'

export default function Goals() {
	const [title, setTitle] = useState('Buy Car')
	const [targetAmount, setTargetAmount] = useState(800000)
	const [targetDate, setTargetDate] = useState('2027-12-31')
	const [goals, setGoals] = useState([
		{ id: 'g1', user_id: DEMO_USER, title: 'Emergency Fund', progress: 45 },
		{ id: 'g2', user_id: DEMO_USER, title: 'Car', progress: 10 },
	])

	useEffect(() => {
		axios.get(`${API_BASE}/api/goals/${DEMO_USER}`).then(res => {
			if (Array.isArray(res.data) && res.data.length) {
				const transformed = res.data.map(g => ({ id: g.id, user_id: g.user_id, title: g.title, progress: Math.min(100, Math.round((g.current_sip / 10000) * 100)) }))
				setGoals(transformed)
			}
		}).catch(() => {})
	}, [])

	const addGoal = async (e) => {
		e.preventDefault()
		try {
			await axios.post(`${API_BASE}/api/goals/${DEMO_USER}`, {
				title,
				target_amount: Number(targetAmount),
				target_date: targetDate,
				starting_amount: 0,
				current_sip: 0,
				expected_return_rate: 0.12,
				inflation_rate: 0.05,
				salary_growth_rate: 0.05,
			})
			const res = await axios.get(`${API_BASE}/api/goals/${DEMO_USER}`)
			const transformed = res.data.map(g => ({ id: g.id, user_id: g.user_id, title: g.title, progress: Math.min(100, Math.round((g.current_sip / 10000) * 100)) }))
			setGoals(transformed)
		} catch {}
	}

	return (
		<div className="space-y-6">
			<Card title="Goal Progress (Demo)">
				<GoalProgressBarChart data={goals.map(g => ({ goal: g.title, progress: g.progress }))} />
			</Card>
			<Card title="Add Goal">
				<form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={addGoal}>
					<input className="border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
					<input className="border rounded px-3 py-2" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Target Amount" />
					<input className="border rounded px-3 py-2" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
					<button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
				</form>
			</Card>
		</div>
	)
}
