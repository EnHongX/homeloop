'use client'

import { Button, Card, Layout, Typography, Row, Col, Space } from 'antd'
import Link from 'next/link'
import { PlusOutlined, ShoppingOutlined, HomeOutlined } from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title, Paragraph } = Typography

export default function Home() {
  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-md">
        <div className="flex items-center justify-between h-full px-8">
          <div className="flex items-center gap-2">
            <HomeOutlined className="text-2xl text-blue-500" />
            <Title level={4} className="!m-0 !text-gray-800">
              HomeLoop
            </Title>
          </div>
          <Space>
            <Link href="/products">
              <Button type="default">浏览商品</Button>
            </Link>
            <Link href="/products/new">
              <Button type="primary" icon={<PlusOutlined />}>
                发布商品
              </Button>
            </Link>
          </Space>
        </div>
      </Header>
      <Content className="bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title level={1} className="!mb-4">
              让闲置家居流转起来
            </Title>
            <Paragraph className="text-lg text-gray-600 !mb-8">
              HomeLoop 是专业的二手家居交易平台，为您提供安全、便捷的交易体验
            </Paragraph>
            <Link href="/products/new">
              <Button type="primary" size="large" icon={<PlusOutlined />}>
                立即发布商品
              </Button>
            </Link>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable className="text-center">
                <ShoppingOutlined className="text-4xl text-blue-500 mb-4" />
                <Title level={4}>海量商品</Title>
                <Paragraph className="text-gray-600">
                  汇集各类优质二手家居商品，总有一款适合您
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable className="text-center">
                <PlusOutlined className="text-4xl text-green-500 mb-4" />
                <Title level={4}>轻松发布</Title>
                <Paragraph className="text-gray-600">
                  简单几步，即可发布您的闲置家居商品
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable className="text-center">
                <HomeOutlined className="text-4xl text-orange-500 mb-4" />
                <Title level={4}>本地交易</Title>
                <Paragraph className="text-gray-600">
                  支持本地自提，交易更安全、更便捷
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer className="text-center bg-white">
        HomeLoop ©{new Date().getFullYear()} - 二手家居交易平台
      </Footer>
    </Layout>
  )
}
