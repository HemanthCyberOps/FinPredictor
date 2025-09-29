import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/Cards'
import { GoalProgressBarChart } from '../components/Charts'
import { getCurrentUser } from '../lib/session'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export default function Goals() {
	const user = getCurrentUser()
	const userId = user?.id || 'demo-user-1'
	const [title, setTitle] = useState('Buy Car')
	const [targetAmount, setTargetAmount] = useState(800000)
	const [targetDate, setTargetDate] = useState('2027-12-31')
	const [strategy, setStrategy] = useState('moderate')
	const [goals, setGoals] = useState([])
	const [assets, setAssets] = useState([])
	const [showAdv, setShowAdv] = useState(false)
	// advanced
	const [riskProfile, setRiskProfile] = useState(user?.risk_profile || 'moderate')
	const [goalCategory, setGoalCategory] = useState('')
	const [linkedAssets, setLinkedAssets] = useState([])
	const [priorityLevel, setPriorityLevel] = useState('medium')
	const [inflation, setInflation] = useState(0.05)

	const strategyToReturn = (s) => s === 'conservative' ? 0.08 : s === 'aggressive' ? 0.15 : 0.12
	const riskToStrategy = (r) => r === 'low' ? 'conservative' : r === 'high' ? 'aggressive' : 'moderate'

	const load = async () => {
		const [gRes, pRes] = await Promise.all([
			axios.get(`${API_BASE}/api/goals/${userId}`).catch(() => ({ data: [] })),
			axios.get(`${API_BASE}/api/portfolio/${userId}`).catch(() => ({ data: { assets: [] } })),
		])
		setGoals(gRes.data || [])
		setAssets(pRes.data?.assets || [])
	}

	useEffect(() => {
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
			// advanced
			risk_profile: riskProfile,
			goal_category: goalCategory || undefined,
			linked_assets: linkedAssets,
			priority_level: priorityLevel,
			expected_inflation_rate: Number(inflation),
		}).catch(() => {})
		await load()
	}

	const progressData = goals.map(g => ({ goal: g.title, progress: Math.min(100, Math.round(((g.current_progress || 0) / Math.max(g.target_amount || 1, 1)) * 100)) }))

	return (
		<div className="space-y-6">
			<Card title="Goal Progress">
				<GoalProgressBarChart data={progressData} />
			</Card>
			<Card title="Add Goal">
				<form className="grid grid-cols-1 md:grid-cols-6 gap-3" onSubmit={addGoal}>
					<input className="border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal Name" />
					<input className="border rounded px-3 py-2" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Target Amount" />
					<input className="border rounded px-3 py-2" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
					<select className="border rounded px-3 py-2" value={strategy} onChange={e => setStrategy(e.target.value)}>
						<option value="conservative">Conservative</option>
						<option value="moderate">Moderate</option>
						<option value="aggressive">Aggressive</option>
					</select>
					<button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
					<div className="md:col-span-6">
						<button type="button" onClick={() => setShowAdv(!showAdv)} className="text-blue-600 text-sm">{showAdv ? '− Hide Advanced Options' : '+ Advanced Options'}</button>
					</div>
					{showAdv && (
						<>
							<select className="border rounded px-3 py-2" value={riskProfile} onChange={e => setRiskProfile(e.target.value)}>
								<option value="conservative">Conservative</option>
								<option value="moderate">Moderate</option>
								<option value="aggressive">Aggressive</option>
							</select>
							<select className="border rounded px-3 py-2" value={goalCategory} onChange={e => setGoalCategory(e.target.value)}>
								<option value="">Category</option>
								<option>Education</option>
								<option>House</option>
								<option>Car</option>
								<option>Retirement</option>
								<option>Vacation</option>
								<option>Wealth</option>
							</select>
							<select className="border rounded px-3 py-2" value={priorityLevel} onChange={e => setPriorityLevel(e.target.value)}>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
							<input className="border rounded px-3 py-2" type="number" step="0.01" value={inflation} onChange={e => setInflation(e.target.value)} placeholder="Expected Inflation (e.g. 0.05)" />
							<div className="md:col-span-6">
								<label className="text-sm text-gray-600 block mb-1">Linked Assets</label>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
									{assets.map(a => (
										<label key={a.id} className="flex items-center gap-2 text-sm">
											<input type="checkbox" checked={linkedAssets.includes(a.id)} onChange={(e) => {
												if (e.target.checked) setLinkedAssets(prev => [...prev, a.id])
												else setLinkedAssets(prev => prev.filter(x => x !== a.id))
											}} /> {a.name}
										</label>
									))}
								</div>
							</div>
						</>
					)}
				</form>
			</Card>
			<Card title="Your Goals">
				<ul className="space-y-3">
					{goals.map(g => (
						<li key={g.id} className="border rounded bg-white p-3">
							<div className="flex items-center justify-between">
								<div>
									<div className="font-medium">{g.title}</div>
									<div className="text-xs text-gray-600">Target: ₹{g.target_amount} by {g.target_date} • Risk: {g.risk_profile}</div>
								</div>
								<div className="text-right text-sm">
									<div>Progress: ₹{(g.current_progress || 0).toLocaleString()} / ₹{g.target_amount.toLocaleString()}</div>
									<div>Recommended SIP: ₹{(g.recommended_sip || 0).toLocaleString()}</div>
								</div>
							</div>
							{Array.isArray(g.projections) && g.projections.length > 0 && (
								<div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
									{g.projections.map(p => (
										<div key={p.name} className="border rounded p-2 bg-gray-50">
											<div className="text-sm font-medium capitalize">{p.name}</div>
											<div className="text-xs text-gray-600">Exp. Return: {Math.round((p.expected_return_rate || 0) * 100)}%</div>
											<div className="text-sm">Required SIP: ₹{Math.round(p.recommended_sip || 0).toLocaleString()}</div>
											<div className="text-xs text-gray-700 mt-1">Tip: {p.recommended_sip > (g.current_sip || 0) ? `Increase SIP by ₹${Math.round(p.recommended_sip - (g.current_sip || 0)).toLocaleString()}` : 'You are on track.'}</div>
										</div>
									))}
								</div>
							)}
							<div className="mt-2 text-xs">
								<Link to="/portfolio" className="underline text-blue-600">View contributing assets →</Link>
							</div>
						</li>
					))}
				</ul>
			</Card>
		</div>
	)
}
