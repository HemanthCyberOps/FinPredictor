import { Card, Stat } from '../components/Cards'
import { PortfolioLineChart } from '../components/Charts'

const demoGrowth = Array.from({ length: 12 }).map((_, i) => ({
	date: `M${i + 1}`,
	value: Math.round(100000 * Math.pow(1.02, i)),
}))

export default function Home() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Stat label="Total Value" value="₹1,34,200" />
				<Stat label="Monthly SIP" value="₹8,000" />
				<Stat label="YTD Return" value="12.4%" />
				<Stat label="Goals" value="3 Active" />
			</div>
			<Card title="Portfolio Growth (Demo)">
				<PortfolioLineChart data={demoGrowth} />
			</Card>
		</div>
	)
}
