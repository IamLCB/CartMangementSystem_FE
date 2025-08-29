import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { CartAdminPage } from './pages/CartAdminPage'
import { TransferCartPage } from './pages/TransferCartPage'
import { LogsPage } from './pages/LogsPage'
import { UserBorrowReturnPage } from './pages/UserBorrowReturnPage'
import { UserBorrowPage } from './pages/UserBorrowPage'
import { UserReturnPage } from './pages/UserReturnPage'
import { BorrowSuccessPage, ReturnSuccessPage } from './pages/ResultPages'

const { Header, Content } = Layout

export default function App() {
	return (
		<BrowserRouter>
			<AppShell />
		</BrowserRouter>
	)
}

function AppShell() {
	const location = useLocation()
	const isUserPage = location.pathname.startsWith('/user') || location.pathname.startsWith('/result')
	return (
		<Layout style={{ minHeight: '100vh' }}>
			{!isUserPage && (
				<Header style={{ display: 'flex', alignItems: 'center' }}>
					<div style={{ color: '#fff', fontWeight: 600, marginRight: 24 }}>小推车管理后台</div>
					<HeaderMenu />
				</Header>
			)}
			<Content style={{ padding: isUserPage ? 0 : 24, background: isUserPage ? '#f5f5f5' : undefined }}>
				<Routes>
					<Route path="/carts" element={<CartAdminPage />} />
					<Route path="/transfer" element={<TransferCartPage />} />
					<Route path="/logs" element={<LogsPage />} />
					<Route path="/user" element={<UserBorrowReturnPage />} />
					<Route path="/user/borrow" element={<UserBorrowPage />} />
					<Route path="/user/return" element={<UserReturnPage />} />
					<Route path="/result/borrow" element={<BorrowSuccessPage />} />
					<Route path="/result/return" element={<ReturnSuccessPage />} />
					<Route path="*" element={<Navigate to="/carts" replace />} />
				</Routes>
			</Content>
		</Layout>
	)
}

function HeaderMenu() {
	const navigate = useNavigate()
	const location = useLocation()
	if (location.pathname.startsWith('/user') || location.pathname.startsWith('/result')) return null
	return (
		<Menu
			theme="dark"
			mode="horizontal"
			selectable={false}
			items={[
				{ key: 'carts', label: '小推车管理', onClick: () => navigate('/carts') },
				{ key: 'transfer', label: '搬运小推车', onClick: () => navigate('/transfer') },
				{ key: 'logs', label: '日志查询', onClick: () => navigate('/logs') },
			]}
		/>
	)
}
