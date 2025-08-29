import { useEffect, useState } from 'react'
import { Card, Form, Input, Select, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { listCarts, returnCart } from '../api/carts'
import type { Cart } from '../types'
import { RETURN_POINT_OPTIONS } from '../config'
import { isAxiosError } from 'axios'

export function UserReturnPage() {
	const [loading, setLoading] = useState(false)
	const [carts, setCarts] = useState<Cart[]>([])
	const [form] = Form.useForm<{ cart_code: string, return_point: string }>()
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

	const onSubmit = async (v: { cart_code: string, return_point: string }) => {
		const code = (v.cart_code || '').trim()
		if (!code) { msg.error('请输入小推车编号'); return }
		const cart = carts.find(c => c.code === code)
		if (!cart) { msg.error('未找到该编号的小推车'); return }
		try {
			await returnCart(cart.id, { return_point: v.return_point })
			form.resetFields()
			navigate('/result/return')
		} catch (e: any) {
			if (isAxiosError(e) && e.response?.status === 409) {
				const backend = (e.response?.data as any)?.error || ''
				if (backend.toLowerCase().includes('not borrowed')) {
					msg.error('该小推车当前未被借用')
				} else {
					msg.error('操作冲突，请稍后再试')
				}
			} else {
				const backend = isAxiosError(e) ? (e.response?.data as any)?.error : ''
				msg.error(backend || e?.message || '归还失败')
			}
		}
	}

	return (
		<div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: 12 }}>
			{holder}
			<Card title="用户归还" bodyStyle={{ padding: 12 }} style={{ width: '100%' }}>
				<Form form={form} layout="vertical" onFinish={onSubmit} style={{ padding: 8 }}>
					<Form.Item label="小推车编号" name="cart_code" rules={[{ required: true, message: '请输入小推车编号' }]}> 
						<Input placeholder="输入编号（1-2位数字）" />
					</Form.Item>
					<Form.Item label="归还点" name="return_point" rules={[{ required: true, message: '请选择归还点' }]}> 
						<Select placeholder="选择归还点" options={RETURN_POINT_OPTIONS} />
					</Form.Item>
					<Form.Item style={{ marginTop: 12 }}>
						<Button type="primary" htmlType="submit" size="large" block style={{ height: 48, fontSize: 16 }} loading={loading}>归还</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	)
} 