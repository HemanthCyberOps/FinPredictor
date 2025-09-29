import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'

export function PortfolioLineChart({ data }) {
	return (
		<div className="h-64">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}

export function GoalProgressBarChart({ data }) {
	return (
		<div className="h-64">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="goal" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey="progress" fill="#16a34a" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6']
export function AllocationPieChart({ data }) {
	return (
		<div className="h-64">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
						{data.map((_, idx) => (
							<Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
						))}
					</Pie>
					<Tooltip />
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</div>
	)
}
