'use client'

import { Layout, Typography, Button, Card, Row, Col, Space, Tag, Descriptions, Divider, Image, Breadcrumb, DescriptionsProps } from 'antd'
import Link from 'next/link'
import { HomeOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

const mockProduct = {
  id: '1',
  name: '实木餐桌',
  description: '这是一张实木餐桌，使用了5年，保养良好，无明显划痕。桌子为实木材质，质量非常好，适合4-6人使用。',
  price: 2999,
  originalPrice: 5999,
  category: '桌椅',
  condition: '九成新',
  images: [
    'https://placehold.co/600x400',
    'https://placehold.co/600x400',
    'https://placehold.co/600x400'
  ],
  location: '北京市朝阳区',
  contactInfo: '13800138000',
  status: 'available',
  createdAt: '2024-01-15T10:30:00Z',
  userId: 'user1',
  views: 256,
  isFeatured: false
}

const items: DescriptionsProps['items'] = [
  {
    key: '1',
    label: '价格',
    children: <span className="text-xl font-bold text-red-500">¥2,999</span>,
  },
  {
    key: '2',
    label: '原价',
    children: <Text delete>¥5,999</Text>,
  },
  {
    key: '3',
    label: '新旧程度',
    children: <Tag color="blue">{mockProduct.condition}</Tag>,
  },
  {
    key: '4',
    label: '分类',
    children: <Tag>{mockProduct.category}</Tag>,
  },
  {
    key: '5',
    label: '状态',
    children: <Tag color="green">{mockProduct.status === 'available' ? '在售' : '已售出'}</Tag>,
  },
  {
    key: '6',
    label: '浏览次数',
    children: `${mockProduct.views} 次`,
  },
  {
    key: '7',
    label: '发布时间',
    children: new Date(mockProduct.createdAt).toLocaleString('zh-CN'),
  },
  {
    key: '8',
    label: '所在地区',
    children: mockProduct.location,
  },
  {
    key: '9',
    label: '联系方式',
    children: mockProduct.contactInfo,
  },
]

export default function ProductDetailPage({ params }: { params: { id: string } }) {
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
            <Link href="/products">
              <Button type="default">商品列表</Button>
            </Link>
          </Space>
        </div>
      </Header>
      <Content className="bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item>
              <Link href="/">首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/products">商品列表</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>商品详情</Breadcrumb.Item>
          </Breadcrumb>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={14}>
              <Card>
                <Title level={2} className="!mb-4">
                  {mockProduct.name}
                </Title>
                
                <div className="mb-6">
                  <Image.PreviewGroup>
                    <Row gutter={[16, 16]}>
                      {mockProduct.images.map((image, index) => (
                        <Col key={index}>
                          <Image
                            width={index === 0 ? 400 : 120}
                            src={image}
                            className={index === 0 ? '' : ''}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                </div>

                <Divider />

                <div className="mb-4">
                  <Title level={4}>商品描述</Title>
                  <Text className="text-gray-600">
                    {mockProduct.description}
                  </Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card className="sticky top-8">
                <div className="flex justify-between items-center mb-4">
                  <Title level={3} className="!mb-0 !text-red-500">
                    ¥{mockProduct.price}
                  </Title>
                  <Text delete className="text-gray-400">
                    原价: ¥{mockProduct.originalPrice}
                  </Text>
                </div>

                <Divider />

                <Descriptions
                  title="商品信息"
                  column={1}
                  items={items}
                />

                <Divider />

                <Space className="w-full" direction="vertical">
                  <Button type="primary" size="large" block>
                    联系卖家
                  </Button>
                  <Link href={`/products/${params.id}/edit`}>
                    <Button icon={<EditOutlined />} block>
                      编辑商品
                    </Button>
                  </Link>
                </Space>
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
