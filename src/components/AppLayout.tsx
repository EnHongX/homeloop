'use client'

import { Layout, Typography, Button, Space, Menu, Drawer, theme, ConfigProvider } from 'antd'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeOutlined, PlusOutlined, ShoppingOutlined, MenuOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

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

  const getSelectedKey = () => {
    if (pathname === '/') return '/'
    if (pathname.startsWith('/products/new')) return '/products/new'
    if (pathname.startsWith('/products')) return '/products'
    return '/'
  }

  const selectedKey = getSelectedKey()

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: token.colorBgLayout,
      }}
    >
      {showHeader && (
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: '64px',
            lineHeight: '64px',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #40a9ff 100%)`,
                }}
              >
                <HomeOutlined style={{ color: '#fff', fontSize: '18px' }} />
              </div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  color: token.colorText,
                  fontSize: '18px',
                  whiteSpace: 'nowrap',
                }}
              >
                HomeLoop
              </Title>
            </Link>

            <div
              style={{
                display: 'none',
              }}
              className="desktop-nav"
            >
              <Space size="middle" align="center">
                <Link
                  href="/"
                  style={{
                    color: selectedKey === '/' ? token.colorPrimary : token.colorText,
                    fontWeight: selectedKey === '/' ? 500 : 400,
                    textDecoration: 'none',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.2s',
                  }}
                >
                  <HomeOutlined />
                  首页
                </Link>
                <Link
                  href="/products"
                  style={{
                    color: selectedKey === '/products' ? token.colorPrimary : token.colorText,
                    fontWeight: selectedKey === '/products' ? 500 : 400,
                    textDecoration: 'none',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.2s',
                  }}
                >
                  <ShoppingOutlined />
                  浏览商品
                </Link>
                <Link href="/products/new">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="middle"
                    style={{
                      fontWeight: 500,
                      height: '36px',
                      borderRadius: '6px',
                    }}
                  >
                    发布商品
                  </Button>
                </Link>
              </Space>
            </div>

            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '20px' }} />}
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'block',
                height: '40px',
                width: '40px',
                borderRadius: '6px',
              }}
              className="mobile-menu-btn"
            />
          </div>
        </Header>
      )}

      <Content style={{ flex: 1 }}>{children}</Content>

      {showFooter && (
        <Footer
          style={{
            background: token.colorBgContainer,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            padding: '24px 16px',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: token.colorPrimary,
                }}
              >
                <HomeOutlined style={{ color: '#fff', fontSize: '14px' }} />
              </div>
              <Text strong style={{ color: token.colorText }}>
                HomeLoop
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              ©{new Date().getFullYear()} HomeLoop - 本地二手家居交易平台
            </Text>
          </div>
        </Footer>
      )}

      <Drawer
        title="导航菜单"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ border: 'none' }}
          items={[
            {
              key: '/',
              label: (
                <Link href="/" style={{ display: 'block' }}>
                  首页
                </Link>
              ),
              icon: <HomeOutlined />,
            },
            {
              key: '/products',
              label: (
                <Link href="/products" style={{ display: 'block' }}>
                  浏览商品
                </Link>
              ),
              icon: <ShoppingOutlined />,
            },
            {
              key: '/products/new',
              label: (
                <Link href="/products/new" style={{ display: 'block' }}>
                  发布商品
                </Link>
              ),
              icon: <PlusOutlined />,
            },
          ]}
        />
      </Drawer>

      <style jsx global>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: block !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  )
}
