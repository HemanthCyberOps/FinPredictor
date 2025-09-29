import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/Cards'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function AIInsights() {
	const [insights, setInsights] = useState([])

	useEffect(() => {
		axios.post(`${API_BASE}/api/ai/predict`, { user_id: 'demo' })
			.then(res => setInsights(res.data?.recommendations || []))
			.catch(() => setInsights([]))
	}, [])

	return (
		<div className="space-y-6">
			<Card title="AI Insights (Demo)">
				<ul className="list-disc pl-6 space-y-2">
					{insights.map((i, idx) => (
						<li key={idx}>
							<span className="font-semibold">{i.title}:</span> {i.detail}
						</li>
					))}
				</ul>
			</Card>
		</div>
	)
}
