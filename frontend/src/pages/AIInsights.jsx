import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/Cards'
import { getCurrentUser } from '../lib/session'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export default function AIInsights() {
	const user = getCurrentUser()
	const userId = user?.id || 'demo-user-1'
	const [insights, setInsights] = useState([])
	const [messages, setMessages] = useState([])
	const [input, setInput] = useState('How should I adjust my SIP this year?')
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		axios.post(`${API_BASE}/api/ai/predict`, { user_id: userId })
			.then(res => setInsights(res.data?.recommendations || []))
			.catch(() => setInsights([]))
	}, [])

	const send = async (e, overrideText) => {
		if (e) e.preventDefault()
		const content = (overrideText ?? input).trim()
		if (!content) return
		const newMsg = { role: 'user', content }
		setMessages(prev => [...prev, newMsg])
		setInput('')
		setLoading(true)
		try {
			const [portfolioRes, goalsRes] = await Promise.all([
				axios.get(`${API_BASE}/api/portfolio/${userId}`).catch(() => ({ data: { assets: [] } })),
				axios.get(`${API_BASE}/api/goals/${userId}`).catch(() => ({ data: [] })),
			])
			const payload = {
				user_id: userId,
				portfolio: portfolioRes.data || { assets: [] },
				goals: goalsRes.data || [],
				message: content,
			}
			const contextHint = `Risk: ${user?.risk_profile || 'moderate'}; Monthly income: ${user?.monthly_income || 'n/a'}`
			const res = await axios.post(`${API_BASE}/api/ai/predict`, payload)
			const recs = res.data?.recommendations || []
			const answer = recs.length > 0
				? recs.map(r => `${r.title}: ${r.detail}`).join('\n')
				: 'No new recommendations right now.'
			const contentReply = [`Context -> ${contextHint}`, answer].join('\n')
			setMessages(prev => [...prev, { role: 'assistant', content: contentReply }])
		} catch {
			setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not fetch insights right now.' }])
		} finally {
			setLoading(false)
		}
	}

	const recentQueries = messages.filter(m => m.role === 'user').slice(-5).reverse()

	return (
		<div className="space-y-6">
			<Card title="AI Insights (Initial)">
				<ul className="list-disc pl-6 space-y-2">
					{insights.map((i, idx) => (
						<li key={idx}>
							<span className="font-semibold">{i.title}:</span> {i.detail}
						</li>
					))}
				</ul>
			</Card>

			<Card title="Ask AI">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="md:col-span-2 space-y-3">
						<div className="border rounded p-3 h-56 overflow-auto bg-white">
							{messages.length === 0 && (
								<div className="text-sm text-gray-500">Start a conversation or use a quick suggestion below.</div>
							)}
							{messages.map((m, idx) => (
								<div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
									<span className={m.role === 'user' ? 'inline-block bg-blue-600 text-white rounded px-3 py-1 my-1' : 'inline-block bg-gray-100 rounded px-3 py-1 my-1 whitespace-pre-line'}>
										{m.content}
									</span>
								</div>
							))}
						</div>
						<form className="flex gap-2" onSubmit={send}>
							<input className="flex-1 border rounded px-3 py-2" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about SIPs, risk, allocations..." />
							<button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
								{loading ? 'Sending…' : 'Send'}
							</button>
						</form>
						<div className="flex flex-wrap gap-2 text-sm">
							<button disabled={loading} onClick={() => send(null, 'Check Portfolio Health')} className="px-3 py-1 border rounded">Check Portfolio Health</button>
							<button disabled={loading} onClick={() => send(null, 'Goal Progress')} className="px-3 py-1 border rounded">Goal Progress</button>
							<button disabled={loading} onClick={() => send(null, 'SIP Advice')} className="px-3 py-1 border rounded">SIP Advice</button>
						</div>
					</div>
					<div className="space-y-2">
						<div className="text-sm font-medium">Recent Queries</div>
						<div className="border rounded bg-white p-2 h-56 overflow-auto">
							{recentQueries.length === 0 ? (
								<div className="text-xs text-gray-500">No recent queries yet.</div>
							) : (
								<ul className="text-xs space-y-2">
									{recentQueries.map((q, idx) => (
										<li key={idx}>
											<button disabled={loading} onClick={() => setInput(q.content)} className="underline text-blue-600">
												{q.content}
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</div>
			</Card>
		</div>
	)
}
