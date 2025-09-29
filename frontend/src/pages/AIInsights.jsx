import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/Cards'
import { getCurrentUser } from '../lib/session'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export default function AIInsights() {
	const user = getCurrentUser()
	const userId = user?.id || 'demo-user'
	const [insights, setInsights] = useState([])
	const [messages, setMessages] = useState([])
	const [input, setInput] = useState('How should I adjust my SIP this year?')

	useEffect(() => {
		axios.post(`${API_BASE}/api/ai/predict`, { user_id: userId })
			.then(res => setInsights(res.data?.recommendations || []))
			.catch(() => setInsights([]))
	}, [])

	const send = async (e) => {
		e.preventDefault()
		const newMsg = { role: 'user', content: input }
		setMessages(prev => [...prev, newMsg])
		setInput('')
		try {
			// Fetch minimal context
			const [portfolioRes, goalsRes] = await Promise.all([
				axios.get(`${API_BASE}/api/portfolio/${userId}`).catch(() => ({ data: { assets: [] } })),
				axios.get(`${API_BASE}/api/goals/${userId}`).catch(() => ({ data: [] })),
			])
			const payload = {
				user_id: userId,
				portfolio: portfolioRes.data || { assets: [] },
				goals: goalsRes.data || [],
			}
			const res = await axios.post(`${API_BASE}/api/ai/predict`, payload)
			const recs = res.data?.recommendations || []
			setMessages(prev => [...prev, { role: 'assistant', content: recs.map(r => `${r.title}: ${r.detail}`).join('\n') || 'No insight' }])
		} catch {
			setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not fetch insights right now.' }])
		}
	}

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
				<div className="space-y-3">
					<div className="border rounded p-3 h-48 overflow-auto bg-white">
						{messages.map((m, idx) => (
							<div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
								<span className={m.role === 'user' ? 'inline-block bg-blue-600 text-white rounded px-3 py-1 my-1' : 'inline-block bg-gray-100 rounded px-3 py-1 my-1'}>
									{m.content}
								</span>
							</div>
						))}
					</div>
					<form className="flex gap-2" onSubmit={send}>
						<input className="flex-1 border rounded px-3 py-2" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about SIPs, risk, allocations..." />
						<button className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
					</form>
				</div>
			</Card>
		</div>
	)
}
