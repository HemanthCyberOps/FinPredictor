export function Card({ title, children }) {
	return (
		<div className="bg-white border rounded-lg p-4 shadow-sm">
			{title && <h3 className="font-semibold mb-2">{title}</h3>}
			{children}
		</div>
	)
}

export function Stat({ label, value }) {
	return (
		<div className="bg-white border rounded-lg p-4 text-center">
			<div className="text-sm text-gray-500">{label}</div>
			<div className="text-2xl font-bold">{value}</div>
		</div>
	)
}
