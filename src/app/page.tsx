'use client'

import { Typography, Button, Card, Row, Col, Space, theme, Tag } from 'antd'
import Link from 'next/link'
import { PlusOutlined, ShoppingOutlined, HomeOutlined, EnvironmentOutlined, SafetyOutlined, TeamOutlined } from '@ant-design/icons'
import AppLayout from '@/components/AppLayout'

const { Title, Paragraph } = Typography

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
  {
    icon: <SafetyOutlined />,
    title: '安全可靠',
    description: '严格的商品审核机制，真实卖家认证，让您的交易更加安心、放心、舒心',
    color: '#13c2c2',
    bgColor: '#e6fffb',
  },
  {
    icon: <TeamOutlined />,
    title: '社区互动',
    description: '与本地家居爱好者交流，分享家居布置心得，打造温馨社区氛围',
    color: '#722ed1',
    bgColor: '#f9f0ff',
  },
  {
    icon: <HomeOutlined />,
    title: '环保理念',
    description: '让闲置家居流转起来，践行环保理念，为地球贡献一份力量',
    color: '#eb2f96',
    bgColor: '#fff0f6',
  },
]

const categories = [
  { name: '沙发', count: 234 },
  { name: '桌椅', count: 456 },
  { name: '柜子', count: 189 },
  { name: '床', count: 123 },
  { name: '灯具', count: 345 },
  { name: '装饰', count: 567 },
]

export default function Home() {
  const { token } = theme.useToken()

  return (
    <AppLayout>
      <div
        style={{
          background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #40a9ff 50%, #91d5ff 100%)`,
          padding: '80px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Tag color="white" style={{ fontSize: '14px', padding: '4px 16px', borderRadius: '20px' }}>
              🏠 本地二手家居交易平台
            </Tag>
            <Title
              style={{
                color: '#fff',
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 700,
                marginBottom: '8px',
                textShadow: '0 2px 20px rgba(0,0,0,0.1)',
              }}
            >
              让闲置家居流转起来
            </Title>
            <Paragraph
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: 'clamp(14px, 2vw, 18px)',
                maxWidth: '600px',
                margin: '0 auto 32px',
                lineHeight: 1.8,
              }}
            >
              HomeLoop 是专业的本地二手家居交易平台，为您提供安全、便捷的交易体验。
              无论是沙发、桌椅还是床柜，都能在这里找到心仪的家。
            </Paragraph>
            <Space size="middle" wrap>
              <Link href="/products/new">
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
                  hoverStyle={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                  }}
                >
                  立即发布商品
                </Button>
              </Link>
              <Link href="/products">
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
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  浏览全部商品
                </Button>
              </Link>
            </Space>
          </Space>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Title
            level={2}
            style={{
              marginBottom: '8px',
              fontSize: 'clamp(20px, 3vw, 28px)',
            }}
          >
            为什么选择 HomeLoop
          </Title>
          <Paragraph type="secondary" style={{ fontSize: '15px' }}>
            专业的二手家居交易平台，让您的闲置物品焕发新生
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card
                hoverable
                bordered={false}
                style={{
                  borderRadius: '16px',
                  height: '100%',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{
                  padding: '32px 24px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    background: feature.bgColor,
                    fontSize: '28px',
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </div>
                <Title
                  level={4}
                  style={{
                    marginBottom: '12px',
                    fontSize: '18px',
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
          padding: '60px 24px',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Title
              level={2}
              style={{
                marginBottom: '8px',
                fontSize: 'clamp(20px, 3vw, 28px)',
              }}
            >
              热门分类
            </Title>
            <Paragraph type="secondary" style={{ fontSize: '15px' }}>
              快速找到您需要的家居商品
            </Paragraph>
          </div>

          <Row gutter={[16, 16]} justify="center">
            {categories.map((cat, index) => (
              <Col xs={12} sm={8} md={4} key={index}>
                <Link href="/products" style={{ display: 'block' }}>
                  <Card
                    hoverable
                    bordered={false}
                    style={{
                      borderRadius: '12px',
                      textAlign: 'center',
                      background: token.colorFillAlter,
                    }}
                    bodyStyle={{
                      padding: '20px 16px',
                    }}
                  >
                    <Typography.Text
                      strong
                      style={{
                        fontSize: '15px',
                        color: token.colorText,
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      {cat.name}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      style={{
                        fontSize: '13px',
                      }}
                    >
                      {cat.count} 件商品
                    </Typography.Text>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <Card
          bordered={false}
          style={{
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #40a9ff 100%)`,
          }}
          bodyStyle={{
            padding: '48px 32px',
          }}
        >
          <div className="text-center">
            <Title
              style={{
                color: '#fff',
                marginBottom: '16px',
                fontSize: 'clamp(20px, 3vw, 28px)',
              }}
            >
              准备好让闲置家居流转了吗？
            </Title>
            <Paragraph
              style={{
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '32px',
                fontSize: '15px',
              }}
            >
              无论是想出售闲置家具，还是寻找物美价廉的家居商品，HomeLoop 都是您的最佳选择
            </Paragraph>
            <Space size="middle" wrap>
              <Link href="/products/new">
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
              <Link href="/products">
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
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
