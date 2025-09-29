import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/Cards'
import { AllocationPieChart } from '../components/Charts'
import { getCurrentUser } from '../lib/session'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export default function Portfolio() {
	const user = getCurrentUser()
	const userId = user?.id || 'demo-user-1'
	const [assets, setAssets] = useState([])
	const [form, setForm] = useState({ type: 'stock', symbol: '', name: '', units: 0, buy_price: 0 })
	const [loading, setLoading] = useState(false)
	const [editId, setEditId] = useState(null)

	const load = async () => {
		try {
			const res = await axios.get(`${API_BASE}/api/portfolio/${userId}`)
			setAssets(res.data?.assets || [])
		} catch {
			setAssets([])
		}
	}

	useEffect(() => { load() }, [])

	const onAddOrSave = async (e) => {
		e.preventDefault()
		setLoading(true)
		try {
			if (editId) {
				await axios.delete(`${API_BASE}/api/portfolio/${userId}/assets/${editId}`).catch(() => {})
			}
			await axios.post(`${API_BASE}/api/portfolio/${userId}/assets`, {
				type: form.type,
				symbol: form.symbol,
				name: form.name,
				units: Number(form.units),
				buy_price: Number(form.buy_price),
			})
			setForm({ type: 'stock', symbol: '', name: '', units: 0, buy_price: 0 })
			setEditId(null)
			await load()
		} finally {
			setLoading(false)
		}
	}

	const onDelete = async (assetId) => {
		setLoading(true)
		try {
			await axios.delete(`${API_BASE}/api/portfolio/${userId}/assets/${assetId}`)
			await load()
		} finally {
			setLoading(false)
		}
	}

	const onEdit = (a) => {
		setForm({ type: a.type, symbol: a.symbol, name: a.name, units: a.units, buy_price: a.buy_price })
		setEditId(a.id)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const allocation = [
		{ name: 'Equity', value: 60 },
		{ name: 'Debt', value: 30 },
		{ name: 'Cash', value: 10 },
	]

	return (
		<div className="space-y-6">
			<Card title={editId ? 'Edit Asset' : 'Add Asset'}>
				<form onSubmit={onAddOrSave} className="grid grid-cols-1 md:grid-cols-6 gap-2">
					<select className="border rounded px-3 py-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
						<option value="stock">Stock</option>
						<option value="mutual_fund">Mutual Fund</option>
						<option value="crypto">Crypto</option>
						<option value="bond">Bond</option>
						<option value="cash">Cash</option>
					</select>
					<input className="border rounded px-3 py-2" placeholder="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
					<input className="border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
					<input className="border rounded px-3 py-2" type="number" step="any" placeholder="Units" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} />
					<input className="border rounded px-3 py-2" type="number" step="any" placeholder="Buy Price" value={form.buy_price} onChange={e => setForm({ ...form, buy_price: e.target.value })} />
					<button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{editId ? 'Save' : 'Add'}</button>
				</form>
			</Card>

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
								<th></th>
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
									<td className="space-x-3">
										<button disabled={loading} onClick={() => onEdit(a)} className="text-blue-600">Edit</button>
										<button disabled={loading} onClick={() => onDelete(a.id)} className="text-red-600">Delete</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	)
}
