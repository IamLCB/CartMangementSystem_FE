import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Space, Table, Tag, message, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { createCart, deleteCart, listCarts, borrowCart, returnCart, updateCart } from '../api/carts'
import type { Cart, CartStatus } from '../types'
import { RETURN_POINT_OPTIONS } from '../config'

export function CartAdminPage() {
	const [loading, setLoading] = useState(false)
	const [carts, setCarts] = useState<Cart[]>([])
	const [createOpen, setCreateOpen] = useState(false)
	const [borrowOpen, setBorrowOpen] = useState<null | number>(null)
	const [returnOpen, setReturnOpen] = useState<null | number>(null)
	const [editId, setEditId] = useState<null | number>(null)
	const [modal, modalContextHolder] = Modal.useModal()

	const fetchData = async () => {
		setLoading(true)
		try {
			const data = await listCarts()
			setCarts(Array.isArray(data) ? data : [])
		} catch (e: any) {
			message.error(e?.message || '加载失败')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { fetchData() }, [])
	useEffect(() => {
		const timer = window.setInterval(() => { fetchData() }, 5000)
		return () => window.clearInterval(timer)
	}, [])

	const statusColors: Record<CartStatus, string> = useMemo(() => ({
		available: 'green',
		borrowed: 'orange',
	}), [])

	const columns: ColumnsType<Cart> = [
		{ title: '编号', dataIndex: 'code', width: 160 },
		{ title: '状态', dataIndex: 'status', width: 120, render: (v: CartStatus) => {
			const st = (v as CartStatus) || 'available'
			const color = statusColors[st] || 'default'
			return <Tag color={color}>{st === 'available' ? '可用' : '借用中'}</Tag>
		}},
		{ title: '借用人', dataIndex: 'borrower_name', render: (v) => v || '-' },
		{ title: '手机', dataIndex: 'borrower_phone', render: (v) => v || '-' },
		{ title: '去往地点', dataIndex: 'borrower_destination', render: (v) => v || '-' },
		{ title: '归还点', dataIndex: 'return_point', render: (v) => v || '-' },
		{
			title: '操作',
			key: 'action',
			render: (_, record) => (
				<Space>
					<Button size="small" onClick={() => setEditId(record.id)}>编辑</Button>
					<Button size="small" danger onClick={() => onDelete(record.id)}>删除</Button>
					{record.status === 'available' ? (
						<Button size="small" type="primary" onClick={() => setBorrowOpen(record.id)}>借用</Button>
					) : (
						<Button size="small" onClick={() => setReturnOpen(record.id)}>归还</Button>
					)}
				</Space>
			),
		},
	]

	const onDelete = async (id: number) => {
		modal.confirm({
			title: '确认删除该小推车？',
			onOk: async () => {
				try {
					await deleteCart(id)
					message.success('删除成功')
					fetchData()
				} catch (e: any) {
					message.error(e?.response?.data?.error || e?.message || '删除失败')
				}
			},
		})
	}

	return (
		<div>
			{modalContextHolder}
			<Space style={{ marginBottom: 16 }}>
				<Button type="primary" onClick={() => setCreateOpen(true)}>新增小推车</Button>
				<Button onClick={fetchData} loading={loading}>刷新</Button>
			</Space>
			<Table rowKey="id" loading={loading} dataSource={carts} columns={columns} pagination={{ pageSize: 10 }} />

			<CreateCartModal open={createOpen} onClose={() => setCreateOpen(false)} onOk={async (values) => {
				try {
					await createCart(values)
					message.success('创建成功')
					setCreateOpen(false)
					fetchData()
				} catch (e: any) {
					message.error(e?.response?.data?.error || e?.message || '创建失败')
				}
			}} />

			<BorrowModal id={borrowOpen} onClose={() => setBorrowOpen(null)} onOk={async (id, values) => {
				if (!id) return
				try {
					await borrowCart(id, values)
					message.success('借用成功')
					setBorrowOpen(null)
					fetchData()
				} catch (e: any) {
					message.error(e?.response?.data?.error || e?.message || '借用失败')
				}
			}} />

			<ReturnModal id={returnOpen} onClose={() => setReturnOpen(null)} onOk={async (id, values) => {
				if (!id) return
				try {
					await returnCart(id, values)
					message.success('归还成功')
					setReturnOpen(null)
					fetchData()
				} catch (e: any) {
					message.error(e?.response?.data?.error || e?.message || '归还失败')
				}
			}} />

			<EditCartModal id={editId} cart={carts.find(c => c.id === editId) || null} onClose={() => setEditId(null)} onOk={async (id, values) => {
				if (!id) return
				try {
					await updateCart(id, values as any)
					message.success('更新成功')
					setEditId(null)
					fetchData()
				} catch (e: any) {
					message.error(e?.response?.data?.error || e?.message || '更新失败')
				}
			}} />
		</div>
	)
}

function CreateCartModal({ open, onClose, onOk }: { open: boolean, onClose: () => void, onOk: (values: { code: string, return_point?: string }) => void }) {
	const [form] = Form.useForm<{ code: string, return_point?: string }>()
	return (
		<Modal title="新增小推车" open={open} onCancel={onClose} onOk={() => form.submit()} destroyOnClose>
			<Form form={form} layout="vertical" onFinish={onOk}>
				<Form.Item label="编号" name="code" rules={[{ required: true, message: '请输入编号' }]}> 
					<Input placeholder="如 CART-001" />
				</Form.Item>
				<Form.Item label="归还点（初始）" name="return_point"> 
					<Select allowClear placeholder="选择归还点" options={RETURN_POINT_OPTIONS} />
				</Form.Item>
			</Form>
		</Modal>
	)
}

function BorrowModal({ id, onClose, onOk }: { id: number | null, onClose: () => void, onOk: (id: number | null, values: { borrower_name: string, borrower_phone: string, borrower_destination: string }) => void }) {
	const [form] = Form.useForm<{ borrower_name: string, borrower_phone: string, borrower_destination: string }>()
	return (
		<Modal title="借用小推车" open={!!id} onCancel={onClose} onOk={() => form.submit()} destroyOnClose>
			<Form form={form} layout="vertical" onFinish={(v) => onOk(id, v)}>
				<Form.Item label="姓名" name="borrower_name" rules={[{ required: true, message: '请输入姓名' }]}> 
					<Input />
				</Form.Item>
				<Form.Item label="手机号" name="borrower_phone" rules={[{ required: true, message: '请输入手机号' }]}> 
					<Input />
				</Form.Item>
				<Form.Item label="去往地点" name="borrower_destination" rules={[{ required: true, message: '请输入去往地点' }]}> 
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	)
}

function ReturnModal({ id, onClose, onOk }: { id: number | null, onClose: () => void, onOk: (id: number | null, values: { return_point: string }) => void }) {
	const [form] = Form.useForm<{ return_point: string }>()
	return (
		<Modal title="归还小推车" open={!!id} onCancel={onClose} onOk={() => form.submit()} destroyOnClose>
			<Form form={form} layout="vertical" onFinish={(v) => onOk(id, v)}>
				<Form.Item label="归还点" name="return_point" rules={[{ required: true, message: '请选择归还点' }]}> 
					<Select placeholder="选择归还点" options={RETURN_POINT_OPTIONS} />
				</Form.Item>
			</Form>
		</Modal>
	)
}

function EditCartModal({ id, cart, onClose, onOk }: { id: number | null, cart: Cart | null, onClose: () => void, onOk: (id: number | null, values: Partial<Cart>) => void }) {
	const [form] = Form.useForm<Partial<Cart>>()
	useEffect(() => {
		if (cart) {
			form.setFieldsValue({
				code: cart.code,
				status: cart.status,
				borrower_name: cart.borrower_name || undefined,
				borrower_phone: cart.borrower_phone || undefined,
				borrower_destination: cart.borrower_destination || undefined,
				return_point: cart.return_point || undefined,
			})
		}
	}, [cart])
	return (
		<Modal title="编辑小推车" open={!!id} onCancel={onClose} onOk={() => form.submit()} destroyOnClose>
			<Form form={form} layout="vertical" onFinish={(v) => onOk(id, v)}>
				<Form.Item label="编号" name="code" rules={[{ required: true, message: '请输入编号' }]}> 
					<Input />
				</Form.Item>
				<Form.Item label="状态" name="status" rules={[{ required: true }]}> 
					<select>
						<option value="available">可用</option>
						<option value="borrowed">借用中</option>
					</select>
				</Form.Item>
				<Form.Item label="借用人" name="borrower_name"> 
					<Input />
				</Form.Item>
				<Form.Item label="手机号" name="borrower_phone"> 
					<Input />
				</Form.Item>
				<Form.Item label="去往地点" name="borrower_destination"> 
					<Input />
				</Form.Item>
				<Form.Item label="归还点" name="return_point"> 
					<Select allowClear placeholder="选择归还点" options={RETURN_POINT_OPTIONS} />
				</Form.Item>
			</Form>
		</Modal>
	)
} 