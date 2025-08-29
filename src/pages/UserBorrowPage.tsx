import { useEffect, useState } from 'react'
import { Card, Form, Input, Select, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { listCarts, borrowCart } from '../api/carts'
import type { Cart } from '../types'
import { isAxiosError } from 'axios'

export function UserBorrowPage() {
	const [loading, setLoading] = useState(false)
	const [carts, setCarts] = useState<Cart[]>([])
	const [form] = Form.useForm<{ cart_code: string, borrower_name: string, borrower_phone: string, borrower_destination: string }>()
	const navigate = useNavigate()
	const [msg, holder] = message.useMessage()

	useEffect(() => {
		const fetch = async () => {
			setLoading(true)
			try {
				const data = await listCarts()
				setCarts(Array.isArray(data) ? data : [])
			} catch (e: any) {
				msg.error('加载失败')
			} finally { setLoading(false) }
		}
		fetch()
	}, [])

	const phoneRules = [
		{ required: true, message: '请输入手机号' },
		{ pattern: /^1\d{10}$/, message: '请输入有效的11位手机号' },
	]

	const onSubmit = async (v: { cart_code: string, borrower_name: string, borrower_phone: string, borrower_destination: string }) => {
		const code = (v.cart_code || '').trim()
		if (!code) { msg.error('请输入小推车编号'); return }
		const cart = carts.find(c => c.code === code)
		if (!cart) { msg.error('未找到该编号的小推车'); return }
		try {
			await borrowCart(cart.id, {
				borrower_name: v.borrower_name,
				borrower_phone: v.borrower_phone,
				borrower_destination: v.borrower_destination,
			})
			form.resetFields()
			navigate('/result/borrow')
		} catch (e: any) {
			if (isAxiosError(e) && e.response?.status === 409) {
				msg.error('此小推车正在被借用')
			} else {
				const backend = isAxiosError(e) ? (e.response?.data as any)?.error : ''
				msg.error(backend || e?.message || '借用失败')
			}
		}
	}

	return (
		<div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: 12 }}>
			{holder}
			<Card title="用户借用" bodyStyle={{ padding: 12 }} style={{ width: '100%' }}>
				<Form form={form} layout="vertical" onFinish={onSubmit} style={{ padding: 8 }}>
					<Form.Item label="小推车编号" name="cart_code" rules={[{ required: true, message: '请输入小推车编号' }]}> 
						<Input placeholder="输入编号（1-2位数字）" />
					</Form.Item>
					<Form.Item label="姓名" name="borrower_name" rules={[{ required: true, message: '请输入姓名' }]}> 
						<Input placeholder="请输入姓名" />
					</Form.Item>
					<Form.Item label="手机号" name="borrower_phone" rules={phoneRules}> 
						<Input inputMode="numeric" pattern="[0-9]*" placeholder="11位手机号" maxLength={11} />
					</Form.Item>
					<Form.Item label="去往地点" name="borrower_destination" rules={[{ required: true, message: '请输入去往地点' }]}> 
						<Input placeholder="如 友园16号楼" />
					</Form.Item>
					<Form.Item style={{ marginTop: 12 }}>
						<Button type="primary" htmlType="submit" size="large" block style={{ height: 48, fontSize: 16 }} loading={loading}>借用</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	)
} 