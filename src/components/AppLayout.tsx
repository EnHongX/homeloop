'use client'

import { Layout, Typography, Button, Space, Menu, Drawer, theme } from 'antd'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeOutlined, PlusOutlined, ShoppingOutlined, MenuOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { Header, Content, Footer } = Layout
const { Title } = Typography

interface AppLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
}

export default function AppLayout({
  children,
  showHeader = true,
  showFooter = true,
}: AppLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { token } = theme.useToken()

  const getMenuItems = () => [
    {
      key: '/',
      label: <Link href="/">首页</Link>,
      icon: <HomeOutlined />,
    },
    {
      key: '/products',
      label: <Link href="/products">浏览商品</Link>,
      icon: <ShoppingOutlined />,
    },
    {
      key: '/products/new',
      label: (
        <Link href="/products/new">
          <Button type="primary" icon={<PlusOutlined />} size="small">
            发布商品
          </Button>
        </Link>
      ),
    },
  ]

  const menuItems = getMenuItems()
  const selectedKey = pathname === '/' ? '/' : pathname.startsWith('/products/new') ? '/products/new' : pathname.startsWith('/products') ? '/products' : '/'

  return (
    <Layout className="min-h-screen" style={{ background: token.colorBgLayout }}>
      {showHeader && (
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
          }}
        >
          <div className="flex items-center justify-between h-full max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #1890ff 100%)` }}
              >
                <HomeOutlined className="text-white text-lg" />
              </div>
              <Title level={4} style={{ margin: 0, color: token.colorText }}>
                HomeLoop
              </Title>
            </Link>

            <div className="hidden md:block">
              <Space size="middle">
                <Link
                  href="/"
                  style={{
                    color: selectedKey === '/' ? token.colorPrimary : token.colorText,
                    fontWeight: selectedKey === '/' ? 500 : 400,
                  }}
                  className="hover:text-primary transition-colors"
                >
                  <Space size={4}>
                    <HomeOutlined />
                    首页
                  </Space>
                </Link>
                <Link
                  href="/products"
                  style={{
                    color: selectedKey === '/products' ? token.colorPrimary : token.colorText,
                    fontWeight: selectedKey === '/products' ? 500 : 400,
                  }}
                  className="hover:text-primary transition-colors"
                >
                  <Space size={4}>
                    <ShoppingOutlined />
                    浏览商品
                  </Space>
                </Link>
                <Link href="/products/new">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="middle"
                    style={{
                      fontWeight: 500,
                      height: '36px',
                    }}
                  >
                    发布商品
                  </Button>
                </Link>
              </Space>
            </div>

            <div className="md:hidden">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                size="large"
              />
            </div>
          </div>
        </Header>
      )}

      <Content style={{ flex: 1 }}>{children}</Content>

      {showFooter && (
        <Footer
          style={{
            background: token.colorBgContainer,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            padding: '24px 24px',
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ background: token.colorPrimary }}
                >
                  <HomeOutlined className="text-white text-sm" />
                </div>
                <Typography.Text strong style={{ color: token.colorText }}>
                  HomeLoop
                </Typography.Text>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                ©{new Date().getFullYear()} HomeLoop - 本地二手家居交易平台
              </Typography.Text>
            </div>
          </div>
        </Footer>
      )}

      <Drawer
        title="菜单"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ border: 'none' }}
        />
      </Drawer>
    </Layout>
  )
}
