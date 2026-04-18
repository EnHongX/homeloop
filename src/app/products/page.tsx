'use client'

import { Typography, Button, Card, Row, Col, Space, Tag, Input, Select, Pagination, theme, Empty, Result, Statistic, Divider } from 'antd'
import Link from 'next/link'
import { PlusOutlined, HomeOutlined, ShoppingOutlined, SearchOutlined, FilterOutlined, EnvironmentOutlined, TagOutlined } from '@ant-design/icons'
import { useState } from 'react'
import AppLayout from '@/components/AppLayout'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

const mockProducts = [
  {
    id: '1',
    name: '实木餐桌 带4把椅子',
    price: 2999,
    originalPrice: 5999,
    category: '桌椅',
    condition: '九成新',
    images: ['https://placehold.co/600x400/e6f7ff/1890ff?text=实木餐桌'],
    location: '北京市朝阳区',
    status: 'available',
    views: 234,
    publishTime: '2天前',
  },
  {
    id: '2',
    name: '北欧简约布艺沙发 三人位',
    price: 1500,
    originalPrice: 3500,
    category: '沙发',
    condition: '八成新',
    images: ['https://placehold.co/600x400/f6ffed/52c41a?text=布艺沙发'],
    location: '上海市浦东新区',
    status: 'available',
    views: 456,
    publishTime: '3天前',
  },
  {
    id: '3',
    name: '宜家书柜 书架 五层',
    price: 800,
    originalPrice: 1800,
    category: '柜子',
    condition: '全新',
    images: ['https://placehold.co/600x400/fff7e6/fa8c16?text=书柜'],
    location: '广州市天河区',
    status: 'available',
    views: 123,
    publishTime: '1天前',
  },
  {
    id: '4',
    name: '北欧风格实木床 1.8米',
    price: 2200,
    originalPrice: 4500,
    category: '床',
    condition: '九成新',
    images: ['https://placehold.co/600x400/e6fffb/13c2c2?text=实木床'],
    location: '深圳市南山区',
    status: 'available',
    views: 567,
    publishTime: '5天前',
  },
  {
    id: '5',
    name: '现代简约LED落地灯',
    price: 350,
    originalPrice: 800,
    category: '灯具',
    condition: '全新',
    images: ['https://placehold.co/600x400/f9f0ff/722ed1?text=落地灯'],
    location: '杭州市西湖区',
    status: 'available',
    views: 89,
    publishTime: '今天',
  },
  {
    id: '6',
    name: '复古装饰画 客厅挂画',
    price: 180,
    originalPrice: 400,
    category: '装饰',
    condition: '八成新',
    images: ['https://placehold.co/600x400/fff0f6/eb2f96?text=装饰画'],
    location: '成都市武侯区',
    status: 'available',
    views: 234,
    publishTime: '1周前',
  },
]

const categories = ['全部', '沙发', '桌椅', '柜子', '床', '灯具', '装饰']
const conditions = ['全部', '全新', '九成新', '八成新', '七成新及以下']
const sortOptions = [
  { value: 'default', label: '默认排序' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'newest', label: '最新发布' },
  { value: 'views', label: '最多浏览' },
]

export default function ProductsPage() {
  const { token } = theme.useToken()
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedCondition, setSelectedCondition] = useState('全部')
  const [sortBy, setSortBy] = useState('default')
  const [currentPage, setCurrentPage] = useState(1)

  const stats = {
    total: 1234,
    today: 56,
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case '全新':
        return 'green'
      case '九成新':
        return 'blue'
      case '八成新':
        return 'orange'
      default:
        return 'default'
    }
  }

  return (
    <AppLayout>
      <div
        style={{
          background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
          padding: '40px 24px',
          borderBottom: `1px solid ${token.colorBorder}`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title
                level={2}
                style={{
                  marginBottom: '8px',
                  fontSize: '28px',
                }}
              >
                <ShoppingOutlined style={{ marginRight: '12px', color: token.colorPrimary }} />
                浏览商品
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                发现身边的优质二手家居
              </Text>
            </div>

            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={10}>
                <Search
                  placeholder="搜索商品名称、描述..."
                  allowClear
                  enterButton={<span><SearchOutlined /> 搜索</span>}
                  size="large"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={(value) => console.log('Search:', value)}
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Select
                  placeholder="分类"
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  value={selectedCategory}
                  onChange={(value) => setSelectedCategory(value)}
                  suffixIcon={<FilterOutlined />}
                >
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat === '全部' ? '全部分类' : cat}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Select
                  placeholder="新旧程度"
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  value={selectedCondition}
                  onChange={(value) => setSelectedCondition(value)}
                >
                  {conditions.map((cond) => (
                    <Option key={cond} value={cond}>
                      {cond}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Select
                  placeholder="排序方式"
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  value={sortBy}
                  onChange={(value) => setSortBy(value)}
                >
                  {sortOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={24} md={2}>
                <Link href="/products/new" style={{ display: 'block' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      height: '40px',
                    }}
                  >
                    发布商品
                  </Button>
                </Link>
              </Col>
            </Row>
          </Space>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
            <Space size="middle">
              <Statistic
                title="总商品数"
                value={stats.total}
                valueStyle={{ color: token.colorPrimary, fontSize: '18px' }}
                prefix={<ShoppingOutlined />}
              />
              <Divider type="vertical" style={{ height: '40px' }} />
              <Statistic
                title="今日新增"
                value={stats.today}
                valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                valueRender={(val) => <span>+{val}</span>}
              />
            </Space>
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              找到 <Text strong>{mockProducts.length}</Text> 个商品
            </Text>
          </Col>
        </Row>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {mockProducts.length > 0 ? (
          <>
            <Row gutter={[20, 20]}>
              {mockProducts.map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <Link href={`/products/${product.id}`} style={{ display: 'block' }}>
                    <Card
                      hoverable
                      bordered={false}
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                      }}
                      bodyStyle={{
                        padding: '16px',
                      }}
                      cover={
                        <div style={{ position: 'relative' }}>
                          <img
                            alt={product.name}
                            src={product.images[0]}
                            style={{
                              height: '200px',
                              objectFit: 'cover',
                              width: '100%',
                            }}
                          />
                          {product.status === 'available' && (
                            <Tag
                              color="green"
                              style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                margin: 0,
                                borderRadius: '4px',
                              }}
                            >
                              在售
                            </Tag>
                          )}
                          <Tag
                            color={getConditionColor(product.condition)}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              margin: 0,
                              borderRadius: '4px',
                            }}
                          >
                            {product.condition}
                          </Tag>
                        </div>
                      }
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <Text
                          strong
                          style={{
                            fontSize: '15px',
                            color: token.colorText,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                          }}
                        >
                          {product.name}
                        </Text>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '8px',
                          marginBottom: '12px',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: '22px',
                            fontWeight: 700,
                            color: '#ff4d4f',
                          }}
                        >
                          ¥{product.price}
                        </Text>
                        {product.originalPrice && (
                          <Text
                            delete
                            type="secondary"
                            style={{ fontSize: '13px' }}
                          >
                            ¥{product.originalPrice}
                          </Text>
                        )}
                      </div>

                      <Divider style={{ margin: '12px 0' }} />

                      <Row gutter={[8, 8]}>
                        <Col span={12}>
                          <Space size={4}>
                            <TagOutlined style={{ fontSize: '12px', color: token.colorTextSecondary }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {product.category}
                            </Text>
                          </Space>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          <Space size={4}>
                            <EnvironmentOutlined style={{ fontSize: '12px', color: token.colorTextSecondary }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {product.location.split('市')[0]}
                            </Text>
                          </Space>
                        </Col>
                      </Row>

                      <Row gutter={[8, 8]} style={{ marginTop: '8px' }}>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {product.publishTime}
                          </Text>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {product.views} 次浏览
                          </Text>
                        </Col>
                      </Row>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>

            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                onChange={(page) => setCurrentPage(page)}
                total={50}
                pageSize={12}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `共 ${total} 件商品`}
                size="large"
              />
            </div>
          </>
        ) : (
          <div style={{ padding: '80px 0' }}>
            <Result
              status="info"
              icon={<ShoppingOutlined />}
              title="暂无符合条件的商品"
              subTitle="尝试调整筛选条件或搜索关键词"
              extra={
                <Space>
                  <Button type="primary" onClick={() => {
                    setSearchText('')
                    setSelectedCategory('全部')
                    setSelectedCondition('全部')
                  }}>
                    重置筛选
                  </Button>
                  <Link href="/products/new">
                    <Button icon={<PlusOutlined />}>发布第一个商品</Button>
                  </Link>
                </Space>
              }
            />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
