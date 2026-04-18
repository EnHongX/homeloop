'use client'

import { Typography, Button, Card, Row, Col, Space, theme, Tag } from 'antd'
import Link from 'next/link'
import { PlusOutlined, ShoppingOutlined, HomeOutlined, EnvironmentOutlined, SafetyOutlined, TeamOutlined } from '@ant-design/icons'
import AppLayout from '@/components/AppLayout'

const { Title, Paragraph, Text } = Typography

const features = [
  {
    icon: <ShoppingOutlined />,
    title: '海量商品',
    description: '汇集各类优质二手家居商品，沙发、桌椅、床柜、灯具应有尽有，总有一款适合您',
    color: '#1890ff',
    bgColor: '#e6f7ff',
  },
  {
    icon: <PlusOutlined />,
    title: '轻松发布',
    description: '简单三步即可发布您的闲置家居，上传图片、填写信息、一键发布，快速高效',
    color: '#52c41a',
    bgColor: '#f6ffed',
  },
  {
    icon: <EnvironmentOutlined />,
    title: '本地交易',
    description: '支持本地自提或面交，避免物流损坏风险，交易更安全、更便捷、更放心',
    color: '#fa8c16',
    bgColor: '#fff7e6',
  },
]

export default function Home() {
  const { token } = theme.useToken()

  return (
    <AppLayout>
      <div
        style={{
          background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #40a9ff 50%, #91d5ff 100%)`,
          padding: '60px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <Tag
            color="white"
            style={{
              fontSize: '14px',
              padding: '4px 16px',
              borderRadius: '20px',
              marginBottom: '20px',
            }}
          >
            🏠 本地二手家居交易平台
          </Tag>

          <Title
            style={{
              color: '#fff',
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 700,
              marginBottom: '12px',
              lineHeight: 1.2,
            }}
          >
            让闲置家居流转起来
          </Title>

          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'clamp(14px, 2vw, 16px)',
              maxWidth: '600px',
              margin: '0 auto 32px',
              lineHeight: 1.8,
            }}
          >
            HomeLoop 是专业的本地二手家居交易平台，为您提供安全、便捷的交易体验。
          </Paragraph>

          <Space size="middle" wrap style={{ justifyContent: 'center' }}>
            <Link href="/products/new" style={{ textDecoration: 'none' }}>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                style={{
                  height: '48px',
                  fontSize: '16px',
                  padding: '0 32px',
                  borderRadius: '24px',
                  background: '#fff',
                  color: token.colorPrimary,
                  border: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              >
                立即发布商品
              </Button>
            </Link>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <Button
                size="large"
                icon={<ShoppingOutlined />}
                style={{
                  height: '48px',
                  fontSize: '16px',
                  padding: '0 32px',
                  borderRadius: '24px',
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.5)',
                  fontWeight: 600,
                }}
              >
                浏览全部商品
              </Button>
            </Link>
          </Space>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '48px 16px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title
            level={2}
            style={{
              marginBottom: '8px',
              fontSize: 'clamp(20px, 3vw, 26px)',
            }}
          >
            为什么选择 HomeLoop
          </Title>
          <Text type="secondary" style={{ fontSize: '15px' }}>
            专业的二手家居交易平台，让您的闲置物品焕发新生
          </Text>
        </div>

        <Row gutter={[20, 20]}>
          {features.map((feature, index) => (
            <Col xs={24} md={8} key={index}>
              <Card
                hoverable
                bordered={false}
                style={{
                  borderRadius: '12px',
                  height: '100%',
                }}
                bodyStyle={{
                  padding: '28px 24px',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    background: feature.bgColor,
                    fontSize: '24px',
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </div>
                <Title
                  level={4}
                  style={{
                    marginBottom: '10px',
                    fontSize: '17px',
                    fontWeight: 600,
                  }}
                >
                  {feature.title}
                </Title>
                <Paragraph
                  type="secondary"
                  style={{
                    margin: 0,
                    lineHeight: 1.7,
                    fontSize: '14px',
                  }}
                >
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div
        style={{
          background: token.colorBgContainer,
          padding: '48px 16px',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          <Card
            bordered={false}
            style={{
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #40a9ff 100%)`,
            }}
            bodyStyle={{
              padding: '40px 24px',
              textAlign: 'center',
            }}
          >
            <Title
              style={{
                color: '#fff',
                marginBottom: '12px',
                fontSize: 'clamp(20px, 3vw, 26px)',
              }}
            >
              准备好让闲置家居流转了吗？
            </Title>
            <Paragraph
              style={{
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '28px',
                fontSize: '15px',
              }}
            >
              无论是想出售闲置家具，还是寻找物美价廉的家居商品，HomeLoop 都是您的最佳选择
            </Paragraph>
            <Space size="middle" wrap style={{ justifyContent: 'center' }}>
              <Link href="/products/new" style={{ textDecoration: 'none' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  style={{
                    height: '44px',
                    padding: '0 28px',
                    borderRadius: '22px',
                    background: '#fff',
                    color: token.colorPrimary,
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                  }}
                >
                  免费发布商品
                </Button>
              </Link>
              <Link href="/products" style={{ textDecoration: 'none' }}>
                <Button
                  size="large"
                  style={{
                    height: '44px',
                    padding: '0 28px',
                    borderRadius: '22px',
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    border: '2px solid rgba(255,255,255,0.6)',
                    fontWeight: 600,
                    fontSize: '15px',
                  }}
                >
                  逛逛市场
                </Button>
              </Link>
            </Space>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
