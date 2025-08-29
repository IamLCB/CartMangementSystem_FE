import { useEffect, useMemo, useState } from 'react'
import { Card, Form, Select, Space, Typography, message, Button } from 'antd'
import { listCarts, transferCart } from '../api/carts'
import type { Cart } from '../types'
import { RETURN_POINT_OPTIONS } from '../config'

export function TransferCartPage() {
	const [loading, setLoading] = useState(false)
	const [carts, setCarts] = useState<Cart[]>([])
	const [selectedCartId, setSelectedCartId] = useState<number | null>(null)
	const [targetPoint, setTargetPoint] = useState<string | null>(null)

	useEffect(() => {
		const fetch = async () => {
			setLoading(true)
			try {
				const data = await listCarts()
				setCarts(Array.isArray(data) ? data : [])
			} catch (e: any) {
				message.error(e?.message || '加载小推车失败')
			} finally {
				setLoading(false)
			}
		}
		fetch()
	}, [])

	const availableCarts = useMemo(() => (Array.isArray(carts) ? carts : []).filter(c => c.status === 'available'), [carts])
	const selectedCart = useMemo(() => availableCarts.find(c => c.id === selectedCartId) || null, [availableCarts, selectedCartId])

	const sentence = useMemo(() => {
		const cartCode = selectedCart?.code
		const fromPoint = selectedCart?.return_point || '未知位置'
		const toPoint = targetPoint || '未选择目的地'
		if (!cartCode) return '请选择小推车与目的地'
		return `将${cartCode}号小推车由${fromPoint}运送至${toPoint}`
	}, [selectedCart, targetPoint])

	const canTransport = !!selectedCart && !!targetPoint

	const onTransport = async () => {
		if (!canTransport || !selectedCartId || !targetPoint) return
		try {
			await transferCart(selectedCartId, targetPoint)
			message.success(sentence)
			// refresh list to reflect new return_point (still available)
			const data = await listCarts()
			setCarts(Array.isArray(data) ? data : [])
		} catch (e: any) {
			message.error(e?.response?.data?.error || e?.message || '运送失败')
		}
	}

	return (
		<Card title="搬运小推车" loading={loading}>
			<Space direction="vertical" size={16} style={{ width: '100%' }}>
				<Form layout="vertical">
					<Form.Item label="选择小推车（仅显示已归还/可用）">
						<Select
							showSearch
							placeholder="选择小推车编号"
							optionFilterProp="label"
							options={availableCarts.map(c => ({ label: c.code, value: c.id }))}
							value={selectedCartId ?? undefined}
							onChange={(v) => setSelectedCartId(v)}
						/>
					</Form.Item>
					<Form.Item label="搬运至归还点">
						<Select
							placeholder="选择目的地归还点"
							options={RETURN_POINT_OPTIONS}
							value={targetPoint ?? undefined}
							onChange={(v) => setTargetPoint(v)}
						/>
					</Form.Item>
				</Form>
				<Typography.Text>{sentence}</Typography.Text>
				<Button type="primary" size="large" style={{ width: '100%', height: 56, fontSize: 18 }} disabled={!canTransport} onClick={onTransport}>
					运送
				</Button>
			</Space>
		</Card>
	)
} 