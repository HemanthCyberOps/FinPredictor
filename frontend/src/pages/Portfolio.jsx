import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/Cards'
import { AllocationPieChart } from '../components/Charts'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
const DEMO_USER = 'demo-user-1'

const demoAssets = [
	{ id: '1', type: 'stock', symbol: 'AAPL', name: 'Apple', units: 10, buy_price: 150, current_price: 190 },
	{ id: '2', type: 'mutual_fund', symbol: 'NIFTY50', name: 'Nifty 50 Index', units: 25, buy_price: 200, current_price: 230 },
	{ id: '3', type: 'crypto', symbol: 'BTC', name: 'Bitcoin', units: 0.1, buy_price: 30000, current_price: 60000 },
]

export default function Portfolio() {
	const [assets, setAssets] = useState(demoAssets)

	useEffect(() => {
		axios.get(`${API_BASE}/api/portfolio/${DEMO_USER}`).then((res) => {
			if (res.data?.assets?.length) setAssets(res.data.assets)
		}).catch(() => {})
	}, [])

	const allocation = [
		{ name: 'Equity', value: 60 },
		{ name: 'Debt', value: 30 },
		{ name: 'Cash', value: 10 },
	]

	return (
		<div className="space-y-6">
			<Card title="Asset Allocation (Demo)">
				<AllocationPieChart data={allocation} />
			</Card>
			<Card title="Holdings">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-left border-b">
								<th className="py-2">Name</th>
								<th>Symbol</th>
								<th>Units</th>
								<th>Buy</th>
								<th>Current</th>
							</tr>
						</thead>
						<tbody>
							{assets.map(a => (
								<tr key={a.id} className="border-b">
									<td className="py-2">{a.name}</td>
									<td>{a.symbol}</td>
									<td>{a.units}</td>
									<td>{a.buy_price}</td>
									<td>{a.current_price}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	)
}
