import { useMemo, useState } from 'react'
import { Card, Stat } from '../components/Cards'
import { PortfolioLineChart } from '../components/Charts'

function computeProjection({ startingAmount, monthlySIP, annualReturn, inflation, years }) {
	const months = years * 12
	const r = annualReturn / 12
	let value = startingAmount
	const points = []
	for (let m = 0; m <= months; m++) {
		if (m > 0) {
			value = value * (1 + r) + monthlySIP
		}
		// inflation-adjusted value in today's terms
		const adj = value / Math.pow(1 + inflation, m / 12)
		points.push({ date: `M${m}`, value: Math.round(adj) })
	}
	return points
}

export default function Home() {
	const [monthlySIP, setMonthlySIP] = useState(8000)
	const [annualReturn, setAnnualReturn] = useState(0.12)
	const [inflation, setInflation] = useState(0.05)
	const [years, setYears] = useState(5)

	const data = useMemo(() => computeProjection({ startingAmount: 0, monthlySIP, annualReturn, inflation, years }), [monthlySIP, annualReturn, inflation, years])
	const finalValue = data[data.length - 1]?.value || 0

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Stat label="Adj. Final Value" value={`₹${finalValue.toLocaleString()}`} />
				<Stat label="Monthly SIP" value={`₹${monthlySIP.toLocaleString()}`} />
				<Stat label="Return (p.a.)" value={`${Math.round(annualReturn * 100)}%`} />
				<Stat label="Inflation (p.a.)" value={`${Math.round(inflation * 100)}%`} />
			</div>
			<Card title="Projection Settings">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
					<div>
						<label className="text-sm text-gray-600">Monthly SIP (₹)</label>
						<input type="number" className="w-full border rounded px-3 py-2" value={monthlySIP} onChange={e => setMonthlySIP(Number(e.target.value))} />
					</div>
					<div>
						<label className="text-sm text-gray-600">Return p.a.</label>
						<input type="number" step="0.01" className="w-full border rounded px-3 py-2" value={annualReturn} onChange={e => setAnnualReturn(Number(e.target.value))} />
					</div>
					<div>
						<label className="text-sm text-gray-600">Inflation p.a.</label>
						<input type="number" step="0.01" className="w-full border rounded px-3 py-2" value={inflation} onChange={e => setInflation(Number(e.target.value))} />
					</div>
					<div>
						<label className="text-sm text-gray-600">Years</label>
						<input type="number" className="w-full border rounded px-3 py-2" value={years} onChange={e => setYears(Number(e.target.value))} />
					</div>
				</div>
			</Card>
			<Card title="Projected Growth (Inflation-adjusted)">
				<PortfolioLineChart data={data} />
			</Card>
		</div>
	)
}
