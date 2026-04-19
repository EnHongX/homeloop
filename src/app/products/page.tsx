'use client'

import { Typography, Button, Card, Row, Col, Space, Tag, Input, Select, Pagination, theme, Result, Statistic, Divider, Spin, Empty } from 'antd'
import Link from 'next/link'
import { PlusOutlined, ShoppingOutlined, SearchOutlined, FilterOutlined, EnvironmentOutlined, TagOutlined, LoadingOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { API_ENDPOINTS } from '@/lib/api'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

const categories = ['全部', '沙发', '桌椅', '柜子', '床', '灯具', '装饰']
const conditions = ['全部', '全新', '九成新', '八成新', '七成新及以下']
const sortOptions = [
  { value: 'default', label: '默认排序' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'newest', label: '最新发布' },
  { value: 'views', label: '最多浏览' },
]

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  originalPrice: number | null
  categoryId: string | null
  condition: string
  images: string[]
  location: string | null
  contactInfo: string | null
  status: string
  createdAt: string
  updatedAt: string
  userId: string | null
  views: number
  isFeatured: boolean
  category: {
    id: string
    name: string
  } | null
}

export default function ProductsPage() {
  const { token } = theme.useToken()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedCondition, setSelectedCondition] = useState('全部')
  const [sortBy, setSortBy] = useState('default')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS)
      const result = await response.json()
      if (result.success) {
        setProducts(result.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今天'
    if (days === 1) return '1天前'
    if (days < 7) return `${days}天前`
    if (days < 30) return `${Math.floor(days / 7)}周前`
    return `${Math.floor(days / 30)}个月前`
  }

  const filteredProducts = products.filter((product) => {
    if (searchText && !product.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false
    }
    if (selectedCategory !== '全部' && product.category?.name !== selectedCategory) {
      return false
    }
    if (selectedCondition !== '全部' && product.condition !== selectedCondition) {
      return false
    }
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return Number(a.price) - Number(b.price)
      case 'price-desc':
        return Number(b.price) - Number(a.price)
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'views':
        return b.views - a.views
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const stats = {
    total: products.length,
    today: products.filter((p) => {
      const today = new Date().toDateString()
      return new Date(p.createdAt).toDateString() === today
    }).length,
  }

  return (
    <AppLayout>
      <div
        style={{
          background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
          padding: '32px 16px',
          borderBottom: `1px solid ${token.colorBorder}`,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title
                level={2}
                style={{
                  marginBottom: '6px',
                  fontSize: '24px',
                }}
              >
                <ShoppingOutlined style={{ marginRight: '10px', color: token.colorPrimary }} />
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

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 16px',
        }}
      >
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
              找到 <Text strong>{sortedProducts.length}</Text> 个商品
            </Text>
          </Col>
        </Row>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px 48px',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">加载中...</Text>
            </div>
          </div>
        ) : sortedProducts.length > 0 ? (
          <>
            <Row gutter={[20, 20]}>
              {sortedProducts.map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <Link href={`/products/${product.id}`} style={{ display: 'block' }}>
                    <Card
                      hoverable
                      bordered={false}
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}
                      bodyStyle={{
                        padding: '16px',
                      }}
                      cover={
                        <div style={{ position: 'relative' }}>
                          <img
                            alt={product.name}
                            src={product.images[0] || 'https://placehold.co/600x400/e6f7ff/1890ff?text=暂无图片'}
                            style={{
                              height: '180px',
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
                          {product.status === 'reserved' && (
                            <Tag
                              color="orange"
                              style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                margin: 0,
                                borderRadius: '4px',
                              }}
                            >
                              已预订
                            </Tag>
                          )}
                          {product.status === 'sold' && (
                            <Tag
                              color="default"
                              style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                margin: 0,
                                borderRadius: '4px',
                              }}
                            >
                              已售出
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
                          ¥{Number(product.price).toFixed(0)}
                        </Text>
                        {product.originalPrice && (
                          <Text
                            delete
                            type="secondary"
                            style={{ fontSize: '13px' }}
                          >
                            ¥{Number(product.originalPrice).toFixed(0)}
                          </Text>
                        )}
                      </div>

                      <Divider style={{ margin: '12px 0' }} />

                      <Row gutter={[8, 8]}>
                        <Col span={12}>
                          <Space size={4}>
                            <TagOutlined style={{ fontSize: '12px', color: token.colorTextSecondary }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {product.category?.name || '未分类'}
                            </Text>
                          </Space>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          <Space size={4}>
                            <EnvironmentOutlined style={{ fontSize: '12px', color: token.colorTextSecondary }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {product.location?.split('市')[0] || '未知'}
                            </Text>
                          </Space>
                        </Col>
                      </Row>

                      <Row gutter={[8, 8]} style={{ marginTop: '8px' }}>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {formatDate(product.createdAt)}
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

            {sortedProducts.length > 12 && (
              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <Pagination
                  current={currentPage}
                  onChange={(page) => setCurrentPage(page)}
                  total={sortedProducts.length}
                  pageSize={12}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 件商品`}
                />
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <Empty
              description={
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    暂无符合条件的商品
                  </Text>
                  <Text type="secondary">尝试调整筛选条件或搜索关键词</Text>
                </div>
              }
            >
              <Link href="/products/new">
                <Button type="primary" icon={<PlusOutlined />}>
                  发布第一个商品
                </Button>
              </Link>
            </Empty>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
