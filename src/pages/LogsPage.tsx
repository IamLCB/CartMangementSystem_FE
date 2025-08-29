import { useEffect, useState } from 'react'
import { Card, Table, Tag, message, Form, Input, Space, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { listLogs, type ActionLog } from '../api/carts'

export function LogsPage() {
	const [loading, setLoading] = useState(false)
	const [logs, setLogs] = useState<ActionLog[]>([])
	const [form] = Form.useForm<{ cart_code?: string }>()

	const fetch = async (cart_code?: string) => {
		setLoading(true)
		try {
			const q = cart_code ? `?cart_code=${encodeURIComponent(cart_code)}` : ''
			const data = await fetchLogs(q)
			setLogs(Array.isArray(data) ? data : [])
		} catch (e: any) {
			message.error(e?.message || '加载日志失败')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetch()
		const timer = window.setInterval(() => {
			const values = form.getFieldsValue()
			fetch(values?.cart_code)
		}, 5000)
		return () => window.clearInterval(timer)
	}, [])

	const columns: ColumnsType<ActionLog> = [
		{ title: '时间', dataIndex: 'created_at', width: 180 },
		{ title: '类型', dataIndex: 'type', width: 100, render: (v) => <Tag color={v === 'borrow' ? 'orange' : v === 'return' ? 'green' : 'blue'}>{v}</Tag> },
		{ title: '小推车', dataIndex: 'cart_code', width: 140 },
		{ title: '借用人', dataIndex: 'borrower_name', render: (v) => v || '-' },
		{ title: '手机号', dataIndex: 'borrower_phone', render: (v) => v || '-' },
		{ title: '去往地点', dataIndex: 'borrower_destination', render: (v) => v || '-' },
		{ title: '来源点', dataIndex: 'from_point', render: (v) => v || '-' },
		{ title: '去向点', dataIndex: 'to_point', render: (v) => v || '-' },
	]

	return (
		<Card title="操作日志">
			<Space direction="vertical" style={{ width: '100%' }} size={16}>
				<Form layout="inline" form={form} onFinish={(v) => fetch(v.cart_code)}>
					<Form.Item label="小推车编号" name="cart_code">
						<Input placeholder="支持精确匹配" allowClear style={{ width: 240 }} />
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit">查询</Button>
					</Form.Item>
					<Form.Item>
						<Button onClick={() => { form.resetFields(); fetch(); }}>重置</Button>
					</Form.Item>
				</Form>
				<Table rowKey="id" loading={loading} dataSource={logs} columns={columns} pagination={{ pageSize: 20 }} />
			</Space>
		</Card>
	)
}

async function fetchLogs(query: string) {
	const res = await fetch(`/api/logs${query}`)
	if (!res.ok) throw new Error(`HTTP ${res.status}`)
	return res.json()
} 