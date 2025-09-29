import { useEffect, useMemo, useState } from 'react'
import { Card, Stat } from '../components/Cards'
import { PortfolioLineChart } from '../components/Charts'
import axios from 'axios'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

function computeProjection({ startingAmount, monthlySIP, annualReturn, inflation, years }) {
	const months = years * 12
	const r = annualReturn / 12
	let value = startingAmount
	const points = []
	for (let m = 0; m <= months; m++) {
		if (m > 0) {
			value = value * (1 + r) + monthlySIP
		}
		const adj = value / Math.pow(1 + inflation, m / 12)
		points.push({ m, date: `M${m}`, value: Math.round(adj) })
	}
	return points
}

export default function Home() {
	const [monthlySIP, setMonthlySIP] = useState(8000)
	const [annualReturn, setAnnualReturn] = useState(0.12)
	const [inflation, setInflation] = useState(0.05)
	const [years, setYears] = useState(5)
	const [retAdj, setRetAdj] = useState(0.12)
	const [viewMode, setViewMode] = useState('months') // 'months' | 'years'

	const [assets, setAssets] = useState([])
	const [goals, setGoals] = useState([])
	const [aiQuote, setAiQuote] = useState('Small monthly changes compound to big results!')

	useEffect(() => {
		(async () => {
			try {
				const uid = 'demo-user-1'
				const [p, g, a] = await Promise.all([
					axios.get(`${API_BASE}/api/portfolio/${uid}`).catch(() => ({ data: { assets: [] } })),
					axios.get(`${API_BASE}/api/goals/${uid}`).catch(() => ({ data: [] })),
					axios.post(`${API_BASE}/api/ai/predict`, { user_id: uid }).catch(() => ({ data: { recommendations: [] } })),
				])
				setAssets(p.data?.assets || [])
				setGoals(g.data || [])
				const first = a.data?.recommendations?.[0]
				if (first?.detail) setAiQuote(first.detail)
			} catch {}
		})()
	}, [])

	const totalMonthlySIP = useMemo(() => assets.reduce((s, a) => s + (a.sip_amount || 0), 0), [assets])
	const nextGoal = useMemo(() => {
		return [...goals].sort((a, b) => new Date(a.target_date) - new Date(b.target_date))[0]
	}, [goals])
	const goalsCoverage = useMemo(() => {
		const target = goals.reduce((s, g) => s + (g.target_amount || 0), 0)
		const progress = goals.reduce((s, g) => s + (g.current_progress || 0), 0)
		return target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0
	}, [goals])
	const sipAdequacy = useMemo(() => {
		const required = goals.reduce((s, g) => s + (g.recommended_sip || 0), 0)
		return required > 0 ? Math.min(100, Math.round((totalMonthlySIP / required) * 100)) : 0
	}, [goals, totalMonthlySIP])
	const diversification = useMemo(() => {
		const types = new Set(assets.map(a => a.type))
		return Math.min(100, types.size * 20)
	}, [assets])
	const healthScore = useMemo(() => {
		// Simple blend: coverage 40%, sip adequacy 40%, diversification 20%
		return Math.min(100, Math.round(goalsCoverage * 0.4 + sipAdequacy * 0.4 + diversification * 0.2))
	}, [goalsCoverage, sipAdequacy, diversification])

	const monthlyData = useMemo(() => computeProjection({ startingAmount: 0, monthlySIP, annualReturn, inflation, years }), [monthlySIP, annualReturn, inflation, years])
	const chartData = useMemo(() => {
		if (viewMode === 'years') {
			return monthlyData.filter(p => p.m % 12 === 0).map(p => ({ ...p, date: `Y${p.m / 12}` }))
		}
		return monthlyData
	}, [monthlyData, viewMode])
	const simData = useMemo(() => computeProjection({ startingAmount: 0, monthlySIP, annualReturn: retAdj, inflation, years }), [monthlySIP, retAdj, inflation, years])
	const simFinal = simData[simData.length - 1]?.value || 0

	return (
		<div className="space-y-6">
			{/* Financial Health + Highlights */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card title="Financial Health">
					<div className="text-3xl font-bold">{healthScore}/100</div>
					<div className="text-sm text-gray-600 mt-1">{healthScore >= 75 ? 'Balanced; moderate risk exposure.' : healthScore >= 50 ? 'On track; improve SIPs.' : 'Increase savings; rebalance.'}</div>
				</Card>
				<Card title="Next Goal">
					{nextGoal ? (
						<div className="text-sm">
							<div className="font-medium">{nextGoal.title}</div>
							<div>{Math.min(100, Math.round(((nextGoal.current_progress || 0) / Math.max(nextGoal.target_amount || 1, 1)) * 100))}% • by {nextGoal.target_date}</div>
						</div>
					) : (
						<div className="text-sm text-gray-600">No goals yet</div>
					)}
				</Card>
				<Stat label="Monthly SIP" value={`₹${(totalMonthlySIP || 0).toLocaleString()}`} />
				<Card title="AI Tip"><div className="text-sm text-gray-700">{aiQuote}</div></Card>
			</div>

			{/* Mini Scenario Simulator */}
			<Card title="Mini Scenario Simulator">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
					<div>
						<label className="text-sm text-gray-600">Expected Return (p.a.)</label>
						<input type="range" min="0.05" max="0.15" step="0.005" value={retAdj} onChange={e => setRetAdj(Number(e.target.value))} className="w-full" />
						<div className="text-sm">{Math.round(retAdj * 100)}%</div>
					</div>
					<div className="text-sm">
						<div className="text-gray-600">Projected Value</div>
						<div className="text-xl font-semibold">₹{simFinal.toLocaleString()}</div>
					</div>
				</div>
			</Card>

			{/* Existing Projection (kept compact) */}
			<Card title="Overview Projection (demo)">
				<div className="flex items-center justify-end gap-2 mb-2">
					<label className="text-sm text-gray-600">View</label>
					<select className="border rounded px-2 py-1 text-sm" value={viewMode} onChange={e => setViewMode(e.target.value)}>
						<option value="months">Months</option>
						<option value="years">Years</option>
					</select>
				</div>
				<PortfolioLineChart data={chartData} />
			</Card>

			{/* Navigation Teasers */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Link to="/portfolio" className="block">
					<Card title="Portfolio">
						<div className="text-sm">Assets: {assets.length}</div>
						<div className="text-sm text-gray-600">Explore allocation and holdings →</div>
					</Card>
				</Link>
				<Link to="/goals" className="block">
					<Card title="Goals">
						<div className="text-sm">Coverage: {goalsCoverage}%</div>
						<div className="text-sm text-gray-600">Track goal progress →</div>
					</Card>
				</Link>
				<Link to="/ai" className="block">
					<Card title="AI Insights">
						<div className="text-sm">“{aiQuote.length > 60 ? aiQuote.slice(0, 60) + '…' : aiQuote}”</div>
						<div className="text-sm text-gray-600">Ask the assistant →</div>
					</Card>
				</Link>
			</div>
		</div>
	)
}
