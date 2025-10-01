import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/Cards'
import { AllocationPieChart } from '../components/Charts'
import { getCurrentUser } from '../lib/session'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

function Field({ children }) {
	return <div className="flex flex-col gap-1">{children}</div>
}

function Input({ label, ...props }) {
	return (
		<Field>
			<label className="text-sm text-gray-600">{label}</label>
			<input className="border rounded px-3 py-2" {...props} />
		</Field>
	)
}

function Select({ label, children, ...props }) {
	return (
		<Field>
			<label className="text-sm text-gray-600">{label}</label>
			<select className="border rounded px-3 py-2" {...props}>{children}</select>
		</Field>
	)
}

function AdvancedToggle({ show, setShow }) {
	return (
		<button type="button" onClick={() => setShow(!show)} className="text-blue-600 text-sm">
			{show ? '− Hide Advanced Options' : '+ Advanced Options'}
		</button>
	)
}

function MutualFundForm({ form, setForm, goals }) {
	const [showAdv, setShowAdv] = useState(false)
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
			<Input label="Fund Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
			<Select label="Investment Type" value={form.investment_type || 'sip'} onChange={e => setForm({ ...form, investment_type: e.target.value })}>
				<option value="sip">SIP</option>
				<option value="lumpsum">Lump Sum</option>
			</Select>
			<Input label="Purchase Date" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
			<Input label="Units / Invested Amount" type="number" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} />
			<Input label="Current Value (₹)" type="number" value={form.current_price} onChange={e => setForm({ ...form, current_price: Number(e.target.value || 0) })} />
			<Select label="Goal Linked" value={form.goal_id || ''} onChange={e => setForm({ ...form, goal_id: e.target.value })}>
				<option value="">None</option>
				{goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
			</Select>
			<div className="md:col-span-3"><AdvancedToggle show={showAdv} setShow={setShowAdv} /></div>
			{showAdv && (
				<>
					<Input label="ISIN Code" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
					<Input label="Expense Ratio (p.a.)" type="number" step="0.01" value={form.expense_ratio} onChange={e => setForm({ ...form, expense_ratio: e.target.value })} />
					<Input label="Expected Return (p.a.)" type="number" step="0.01" value={form.expected_return} onChange={e => setForm({ ...form, expected_return: e.target.value })} />
					<Input label="Lock-in (months)" type="number" value={form.lock_in_period} onChange={e => setForm({ ...form, lock_in_period: e.target.value })} />
					<Input label="Exit Load (text)" value={form.exit_load} onChange={e => setForm({ ...form, exit_load: e.target.value })} />
					<Input label="SIP Amount (₹/mo)" type="number" value={form.sip_amount} onChange={e => setForm({ ...form, sip_amount: e.target.value })} />
					<Input label="CAGR Years" type="number" value={form.cagr_years} onChange={e => setForm({ ...form, cagr_years: e.target.value })} />
				</>
			)}
		</div>
	)
}

function StockForm({ form, setForm, goals }) {
	const [showAdv, setShowAdv] = useState(false)
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
			<Input label="Stock Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
			<Input label="Ticker Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
			<Input label="Purchase Date" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
			<Input label="Quantity" type="number" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} />
			<Input label="Purchase Price" type="number" value={form.buy_price} onChange={e => setForm({ ...form, buy_price: e.target.value })} />
			<Input label="Current Price" type="number" value={form.current_price} onChange={e => setForm({ ...form, current_price: Number(e.target.value || 0) })} />
			<Select label="Goal Linked" value={form.goal_id || ''} onChange={e => setForm({ ...form, goal_id: e.target.value })}>
				<option value="">None</option>
				{goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
			</Select>
			<div className="md:col-span-3"><AdvancedToggle show={showAdv} setShow={setShowAdv} /></div>
			{showAdv && (
				<>
					<Input label="Exchange" value={form.exchange || ''} onChange={e => setForm({ ...form, exchange: e.target.value })} />
					<Input label="Sector" value={form.sector || ''} onChange={e => setForm({ ...form, sector: e.target.value })} />
					<Input label="Average Buy Price" type="number" value={form.avg_buy || ''} onChange={e => setForm({ ...form, avg_buy: e.target.value })} />
				</>
			)}
		</div>
	)
}

function BondForm({ form, setForm, goals }) {
	const [showAdv, setShowAdv] = useState(false)
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
			<Input label="Bond Name / Issuer" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
			<Select label="Bond Type" value={form.bond_type || ''} onChange={e => setForm({ ...form, bond_type: e.target.value })}>
				<option value="">Select</option>
				<option value="government">Government</option>
				<option value="corporate">Corporate</option>
			</Select>
			<Input label="Purchase Date" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
			<Input label="Purchase Price" type="number" value={form.buy_price} onChange={e => setForm({ ...form, buy_price: e.target.value })} />
			<Input label="Face Value" type="number" value={form.face_value || ''} onChange={e => setForm({ ...form, face_value: e.target.value })} />
			<Input label="Coupon Rate (%)" type="number" step="0.01" value={form.coupon_rate || ''} onChange={e => setForm({ ...form, coupon_rate: e.target.value })} />
			<Input label="Maturity Date" type="date" value={form.maturity_date || ''} onChange={e => setForm({ ...form, maturity_date: e.target.value })} />
			<Input label="Quantity Held" type="number" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} />
			<Select label="Goal Linked" value={form.goal_id || ''} onChange={e => setForm({ ...form, goal_id: e.target.value })}>
				<option value="">None</option>
				{goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
			</Select>
			<div className="md:col-span-3"><AdvancedToggle show={showAdv} setShow={setShowAdv} /></div>
			{showAdv && (
				<>
					<Input label="ISIN" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
					<Input label="Credit Rating" value={form.credit_rating || ''} onChange={e => setForm({ ...form, credit_rating: e.target.value })} />
					<Input label="Issue Date" type="date" value={form.issue_date || ''} onChange={e => setForm({ ...form, issue_date: e.target.value })} />
					<Input label="Interest Frequency" value={form.interest_frequency || ''} onChange={e => setForm({ ...form, interest_frequency: e.target.value })} />
					<Input label="Current Market Price" type="number" value={form.current_price} onChange={e => setForm({ ...form, current_price: Number(e.target.value || 0) })} />
					<Input label="YTM (%)" type="number" step="0.01" value={form.ytm || ''} onChange={e => setForm({ ...form, ytm: e.target.value })} />
					<Select label="Duration" value={form.duration_bucket || ''} onChange={e => setForm({ ...form, duration_bucket: e.target.value })}>
						<option value="">Select</option>
						<option value="short">Short</option>
						<option value="mid">Mid</option>
						<option value="long">Long</option>
					</Select>
					<Select label="Inflation-Protected" value={(form.inflation_protected ?? '') === '' ? '' : (form.inflation_protected ? 'yes' : 'no')} onChange={e => setForm({ ...form, inflation_protected: e.target.value === 'yes' })}>
						<option value="">Select</option>
						<option value="yes">Yes</option>
						<option value="no">No</option>
					</Select>
				</>
			)}
		</div>
	)
}

function CryptoForm({ form, setForm, goals }) {
	const [showAdv, setShowAdv] = useState(false)
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
			<Input label="Token Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
			<Input label="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} />
			<Input label="Purchase Date" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
			<Input label="Purchase Price" type="number" value={form.buy_price} onChange={e => setForm({ ...form, buy_price: e.target.value })} />
			<Input label="Quantity Held" type="number" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} />
			<Input label="Current Price" type="number" value={form.current_price} onChange={e => setForm({ ...form, current_price: Number(e.target.value || 0) })} />
			<Input label="Exchange / Wallet" value={form.exchange_wallet || ''} onChange={e => setForm({ ...form, exchange_wallet: e.target.value })} />
			<Select label="Goal Linked" value={form.goal_id || ''} onChange={e => setForm({ ...form, goal_id: e.target.value })}>
				<option value="">None</option>
				{goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
			</Select>
			<div className="md:col-span-3"><AdvancedToggle show={showAdv} setShow={setShowAdv} /></div>
			{showAdv && (
				<>
					<Input label="Blockchain Network" value={form.blockchain || ''} onChange={e => setForm({ ...form, blockchain: e.target.value })} />
					<Input label="Token Type" value={form.token_type || ''} onChange={e => setForm({ ...form, token_type: e.target.value })} />
					<Input label="Transaction Hash" value={form.transaction_hash || ''} onChange={e => setForm({ ...form, transaction_hash: e.target.value })} />
					<Input label="Market Cap" type="number" value={form.market_cap || ''} onChange={e => setForm({ ...form, market_cap: e.target.value })} />
					<Input label="Volatility 24H (%)" type="number" step="0.01" value={form.volatility_24h || ''} onChange={e => setForm({ ...form, volatility_24h: e.target.value })} />
					<Input label="Volatility 7D (%)" type="number" step="0.01" value={form.volatility_7d || ''} onChange={e => setForm({ ...form, volatility_7d: e.target.value })} />
					<Input label="Circulating Supply" type="number" value={form.circulating_supply || ''} onChange={e => setForm({ ...form, circulating_supply: e.target.value })} />
					<Input label="Staking Yield (%)" type="number" step="0.01" value={form.staking_yield || ''} onChange={e => setForm({ ...form, staking_yield: e.target.value })} />
					<Input label="Regulatory Status" value={form.regulatory_status || ''} onChange={e => setForm({ ...form, regulatory_status: e.target.value })} />
				</>
			)}
		</div>
	)
}

function CashForm({ form, setForm, goals }) {
	const [showAdv, setShowAdv] = useState(false)
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
			<Input label="Bank / Wallet Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
			<Select label="Account Type" value={form.account_type || ''} onChange={e => setForm({ ...form, account_type: e.target.value })}>
				<option value="">Select</option>
				<option value="savings">Savings</option>
				<option value="fd">Fixed Deposit</option>
				<option value="rd">Recurring Deposit</option>
				<option value="wallet">Wallet</option>
			</Select>
			<Input label="Current Balance" type="number" value={form.current_price} onChange={e => setForm({ ...form, current_price: Number(e.target.value || 0) })} />
			<Input label="Currency" value={form.currency || 'INR'} onChange={e => setForm({ ...form, currency: e.target.value })} />
			<Select label="Goal Linked" value={form.goal_id || ''} onChange={e => setForm({ ...form, goal_id: e.target.value })}>
				<option value="">None</option>
				{goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
			</Select>
			<div className="md:col-span-3"><AdvancedToggle show={showAdv} setShow={setShowAdv} /></div>
			{showAdv && (
				<>
					<Input label="Interest Rate (%)" type="number" step="0.01" value={form.interest_rate || ''} onChange={e => setForm({ ...form, interest_rate: e.target.value })} />
					<Input label="Deposit Start Date" type="date" value={form.deposit_start_date || ''} onChange={e => setForm({ ...form, deposit_start_date: e.target.value })} />
					<Input label="Maturity Date" type="date" value={form.deposit_maturity_date || ''} onChange={e => setForm({ ...form, deposit_maturity_date: e.target.value })} />
					<Select label="Liquidity" value={form.liquidity || ''} onChange={e => setForm({ ...form, liquidity: e.target.value })}>
						<option value="">Select</option>
						<option value="instant">Instant</option>
						<option value="locked">Locked</option>
					</Select>
				</>
			)}
		</div>
	)
}

export default function Portfolio() {
	const user = getCurrentUser()
	const userId = user?.id || 'demo-user-1'
	const [assets, setAssets] = useState([])
	const [assetType, setAssetType] = useState('mutual_fund')
	const [form, setForm] = useState({ type: 'mutual_fund', symbol: '', name: '', units: '', buy_price: '', current_price: 0, goal_id: '', start_date: '' })
	const [loading, setLoading] = useState(false)
	const [editId, setEditId] = useState(null)
	const [goals, setGoals] = useState([])

	const load = async () => {
		try {
			const [p, g] = await Promise.all([
				axios.get(`${API_BASE}/api/portfolio/${userId}`),
				axios.get(`${API_BASE}/api/goals/${userId}`).catch(() => ({ data: [] })),
			])
			setAssets(p.data?.assets || [])
			setGoals(g.data || [])
		} catch {
			setAssets([])
		}
	}

	useEffect(() => { load() }, [])

	useEffect(() => {
		setForm({ type: assetType, symbol: '', name: '', units: '', buy_price: '', current_price: 0, goal_id: '', start_date: '' })
		setEditId(null)
	}, [assetType])

	const onSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		try {
			if (editId) await axios.delete(`${API_BASE}/api/portfolio/${userId}/assets/${editId}`).catch(() => {})
			await axios.post(`${API_BASE}/api/portfolio/${userId}/assets`, {
				type: form.type,
				symbol: form.symbol,
				name: form.name,
				units: Number(form.units || 0),
				buy_price: Number(form.buy_price || 0),
				current_price: Number(form.current_price || 0),
				goal_id: form.goal_id || undefined,
				start_date: form.start_date || undefined,
				// Optional MF/Bond/Crypto/Cash additions pass-through
				...(['sip_amount','expected_return','expense_ratio','exit_load','lock_in_period','cagr_years','bond_type','face_value','coupon_rate','maturity_date','credit_rating','issue_date','interest_frequency','ytm','duration_bucket','inflation_protected','exchange_wallet','blockchain','token_type','transaction_hash','market_cap','volatility_24h','volatility_7d','circulating_supply','staking_yield','regulatory_status','account_type','currency','interest_rate','deposit_start_date','deposit_maturity_date','liquidity']
					.reduce((acc, key) => { if (form[key] !== undefined && form[key] !== '') { acc[key] = ['inflation_protected'].includes(key) ? !!form[key] : (isNaN(form[key]) ? form[key] : Number(form[key])); } return acc }, {})),
			})
			await load()
			setForm({ type: assetType, symbol: '', name: '', units: '', buy_price: '', current_price: 0, goal_id: '', start_date: '' })
			setEditId(null)
		} finally {
			setLoading(false)
		}
	}

	const onEdit = (a) => {
		setAssetType(a.type)
		setForm({ ...a })
		setEditId(a.id)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const onDelete = async (assetId) => {
		setLoading(true)
		try {
			await axios.delete(`${API_BASE}/api/portfolio/${userId}/assets/${assetId}`)
			await load()
		} finally { setLoading(false) }
	}

	const allocation = useMemo(() => {
		// Aggregate total value by asset type using current holdings
		const totalsByType = assets.reduce((acc, a) => {
			const type = (a.type || 'other')
			const units = Number(a.units || 0)
			const current = Number(a.current_price || 0)
			const value = units > 0 ? units * current : current
			acc[type] = (acc[type] || 0) + (isNaN(value) ? 0 : value)
			return acc
		}, {})
		// Transform into chart-friendly array, capitalizing labels
		const toTitle = (t) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
		const data = Object.entries(totalsByType)
			.filter(([, v]) => v > 0)
			.map(([k, v]) => ({ name: toTitle(k), value: Math.round(v) }))
		// Fallback to an empty state if no assets
		return data.length > 0 ? data : [{ name: 'No Assets', value: 1 }]
	}, [assets])

	return (
		<div className="space-y-6">
			<Card title="Add Asset">
				<form onSubmit={onSubmit} className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<button type="button" className={`px-3 py-1 rounded ${assetType === 'mutual_fund' ? 'bg-blue-600 text-white' : 'border'}`} onClick={() => setAssetType('mutual_fund')}>Mutual Fund</button>
						<button type="button" className={`px-3 py-1 rounded ${assetType === 'stock' ? 'bg-blue-600 text-white' : 'border'}`} onClick={() => setAssetType('stock')}>Stock</button>
						<button type="button" className={`px-3 py-1 rounded ${assetType === 'bond' ? 'bg-blue-600 text-white' : 'border'}`} onClick={() => setAssetType('bond')}>Bond</button>
						<button type="button" className={`px-3 py-1 rounded ${assetType === 'crypto' ? 'bg-blue-600 text-white' : 'border'}`} onClick={() => setAssetType('crypto')}>Crypto</button>
						<button type="button" className={`px-3 py-1 rounded ${assetType === 'cash' ? 'bg-blue-600 text-white' : 'border'}`} onClick={() => setAssetType('cash')}>Cash</button>
					</div>
					{assetType === 'mutual_fund' && <MutualFundForm form={form} setForm={setForm} goals={goals} />}
					{assetType === 'stock' && <StockForm form={form} setForm={setForm} goals={goals} />}
					{assetType === 'bond' && <BondForm form={form} setForm={setForm} goals={goals} />}
					{assetType === 'crypto' && <CryptoForm form={form} setForm={setForm} goals={goals} />}
					{assetType === 'cash' && <CashForm form={form} setForm={setForm} goals={goals} />}
					<div>
						<button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded shadow">{editId ? 'Save' : 'Add'}</button>
					</div>
				</form>
			</Card>

			<Card title="Asset Allocation">
				<AllocationPieChart data={allocation} />
			</Card>

			<Card title="Holdings">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-left border-b">
								<th className="py-2">Name</th>
								<th>Type</th>
								<th>Units</th>
								<th>Buy</th>
								<th>Current</th>
								<th>Goal</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{assets.map(a => (
								<tr key={a.id} className="border-b">
									<td className="py-2">{a.name}</td>
									<td>{a.type}</td>
									<td>{a.units}</td>
									<td>{a.buy_price}</td>
									<td>{a.current_price}</td>
									<td>{(() => { const g = goals.find(g => g.id === a.goal_id); return g ? <Link to="/goals" className="underline text-blue-600">{g.title}</Link> : '-' })()}</td>
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
