'use client'

import { Layout, Typography, Button, Card, Row, Col, Space, Tag, Input, Select, Pagination } from 'antd'
import Link from 'next/link'
import { PlusOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title } = Typography
const { Search } = Input
const { Option } = Select

const mockProducts = [
  {
    id: '1',
    name: '实木餐桌',
    price: 2999,
    category: '桌椅',
    condition: '九成新',
    images: ['https://placehold.co/600x400'],
    location: '北京市朝阳区',
    status: 'available'
  },
  {
    id: '2',
    name: '布艺沙发',
    price: 1500,
    category: '沙发',
    condition: '八成新',
    images: ['https://placehold.co/600x400'],
    location: '上海市浦东新区',
    status: 'available'
  },
  {
    id: '3',
    name: '书柜',
    price: 800,
    category: '柜子',
    condition: '全新',
    images: ['https://placehold.co/600x400'],
    location: '广州市天河区',
    status: 'available'
  }
]

const categories = ['全部', '沙发', '桌椅', '柜子', '床', '灯具', '装饰']
const conditions = ['全部', '全新', '九成新', '八成新', '七成新及以下']

export default function ProductsPage() {
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
            <Link href="/">
              <Button type="default">首页</Button>
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
          <Title level={2} className="!mb-6">
            <ShoppingOutlined className="mr-2" />
            商品列表
          </Title>

          <Card className="mb-8">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <Search
                  placeholder="搜索商品名称..."
                  allowClear
                  enterButton="搜索"
                  size="large"
                />
              </Col>
              <Col xs={12} md={4}>
                <Select
                  placeholder="选择分类"
                  size="large"
                  style={{ width: '100%' }}
                  defaultValue="全部"
                >
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} md={4}>
                <Select
                  placeholder="新旧程度"
                  size="large"
                  style={{ width: '100%' }}
                  defaultValue="全部"
                >
                  {conditions.map((cond) => (
                    <Option key={cond} value={cond}>
                      {cond}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <Space>
                  <Link href="/products/new">
                    <Button type="primary" icon={<PlusOutlined />} size="large">
                      发布商品
                    </Button>
                  </Link>
                </Space>
              </Col>
            </Row>
          </Card>

          <Row gutter={[16, 16]}>
            {mockProducts.map((product) => (
              <Col xs={24} sm={12} md={8} key={product.id}>
                <Link href={`/products/${product.id}`}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={product.name}
                        src={product.images[0]}
                        className="h-48 object-cover"
                      />
                    }
                    className="h-full"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Title level={4} className="!mb-0 !text-lg">
                        {product.name}
                      </Title>
                      <Tag color="green">{product.status === 'available' ? '在售' : '已售出'}</Tag>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xl font-bold text-red-500">¥{product.price}</span>
                      <Tag>{product.condition}</Tag>
                    </div>
                    <div className="text-gray-500 text-sm">
                      <Tag>{product.category}</Tag>
                      <span className="ml-2">{product.location}</span>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          <div className="mt-8 text-center">
            <Pagination
              defaultCurrent={1}
              total={50}
              pageSize={9}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条`}
            />
          </div>
        </div>
      </Content>
      <Footer className="text-center bg-white">
        HomeLoop ©{new Date().getFullYear()} - 二手家居交易平台
      </Footer>
    </Layout>
  )
}
