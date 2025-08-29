import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export function BorrowSuccessPage() {
	const navigate = useNavigate()
	return (
		<Result
			status="success"
			title="借用成功，请及时归还"
			extra={[
				<Button type="primary" key="back" onClick={() => navigate('/user/borrow')}>返回</Button>,
			]}
		/>
	)
}

export function ReturnSuccessPage() {
	const navigate = useNavigate()
	return (
		<Result
			status="success"
			title="归还成功"
			extra={[
				<Button type="primary" key="back" onClick={() => navigate('/user/return')}>返回</Button>,
			]}
		/>
	)
} 