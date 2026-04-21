'use client'

import { Typography, Button, Card, Row, Col, Space, Tag, Input, Select, Pagination, theme, Result, Statistic, Divider, Spin, Empty, Checkbox, Dropdown, Menu, Table, Modal, message } from 'antd'
import Link from 'next/link'
import { ShoppingOutlined, SearchOutlined, FilterOutlined, EnvironmentOutlined, TagOutlined, LoadingOutlined, UserOutlined, AppstoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DownOutlined } from '@ant-design/icons'
import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/AppLayout'
import { API_ENDPOINTS } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { getToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select
const { Column } = Table
const { confirm } = Modal

const categories = ['全部', '沙发', '桌椅', '柜子', '床', '灯具', '装饰']
const conditions = ['全部', '全新', '九成新', '八成新', '七成新及以下']
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'available', label: '在售' },
  { value: 'offline', label: '已下架' },
  { value: 'reserved', label: '已预订' },
  { value: 'sold', label: '已售出' },
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
  quantity: number
  deliveryMethod: string | null
  category: {
    id: string
    name: string
  } | null
}

export default function MyProductsPage() {
  const { token } = theme.useToken()
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedCondition, setSelectedCondition] = useState('全部')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [operating, setOperating] = useState(false)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      message.info('请先登录后再查看我的发布')
      router.push('/login')
      return
    }
    if (isLoggedIn && user) {
      fetchMyProducts()
    }
  }, [isLoggedIn, authLoading, user])

  const fetchMyProducts = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const url = selectedStatus !== 'all'
        ? `${API_ENDPOINTS.PRODUCTS}/my?status=${selectedStatus}`
        : `${API_ENDPOINTS.PRODUCTS}/my`

      const response = await fetch(url, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      })
      const result = await response.json()
      if (result.success) {
        setProducts(result.data)
      }
    } catch (error) {
      console.error('Error fetching my products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilterChange = (value: string) => {
    setSelectedStatus(value)
  }

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchMyProducts()
    }
  }, [selectedStatus])

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '在售'
      case 'reserved':
        return '已预订'
      case 'sold':
        return '已售出'
      case 'offline':
        return '已下架'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'green'
      case 'reserved':
        return 'orange'
      case 'sold':
        return 'default'
      case 'offline':
        return 'default'
      default:
        return 'default'
    }
  }

  const getDeliveryMethodText = (method: string | null) => {
    switch (method) {
      case 'self-pickup':
        return '自提'
      case 'free-shipping':
        return '包邮'
      case 'shipping-on-buyer':
        return '运费自付'
      default:
        return '未设置'
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

  const handleBatchStatusUpdate = async (newStatus: string, actionName: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的商品')
      return
    }

    confirm({
      title: `确认${actionName}？`,
      content: `您确定要${actionName}选中的 ${selectedRowKeys.length} 个商品吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        setOperating(true)
        try {
          const token = getToken()
          const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/batch/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({
              ids: selectedRowKeys,
              status: newStatus,
            }),
          })

          const result = await response.json()
          if (result.success) {
            message.success(`${actionName}成功，已更新 ${result.data.count} 个商品`)
            setSelectedRowKeys([])
            fetchMyProducts()
          } else {
            message.error(result.error || `${actionName}失败`)
          }
        } catch (error) {
          console.error('Error updating batch status:', error)
          message.error(`${actionName}失败，请稍后重试`)
        } finally {
          setOperating(false)
        }
      },
    })
  }

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的商品')
      return
    }

    confirm({
      title: '确认删除？',
      content: `您确定要删除选中的 ${selectedRowKeys.length} 个商品吗？此操作不可恢复！`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        setOperating(true)
        try {
          const token = getToken()
          const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/batch`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({
              ids: selectedRowKeys,
            }),
          })

          const result = await response.json()
          if (result.success) {
            message.success(`删除成功，已删除 ${result.data.count} 个商品`)
            setSelectedRowKeys([])
            fetchMyProducts()
          } else {
            message.error(result.error || '删除失败')
          }
        } catch (error) {
          console.error('Error deleting batch products:', error)
          message.error('删除失败，请稍后重试')
        } finally {
          setOperating(false)
        }
      },
    })
  }

  const handleSingleDelete = (id: string, name: string) => {
    confirm({
      title: '确认删除？',
      content: `您确定要删除商品"${name}"吗？此操作不可恢复！`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const token = getToken()
          const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
            method: 'DELETE',
            headers: {
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          })

          const result = await response.json()
          if (result.success) {
            message.success('删除成功')
            fetchMyProducts()
          } else {
            message.error(result.error || '删除失败')
          }
        } catch (error) {
          console.error('Error deleting product:', error)
          message.error('删除失败，请稍后重试')
        }
      },
    })
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const hasSelected = selectedRowKeys.length > 0

  const stats = {
    total: products.length,
    available: products.filter((p) => p.status === 'available').length,
    offline: products.filter((p) => p.status === 'offline').length,
    sold: products.filter((p) => p.status === 'sold').length,
    today: products.filter((p) => {
      const today = new Date().toDateString()
      return new Date(p.createdAt).toDateString() === today
    }).length,
  }

  const getActionMenu = (product: Product) => {
    const items: any[] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: '查看详情',
        onClick: () => router.push(`/products/${product.id}`),
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
        onClick: () => router.push(`/products/${product.id}/edit`),
      },
    ]

    if (product.status === 'available') {
      items.push({
        key: 'offline',
        label: '下架',
        onClick: () => handleBatchStatusUpdate('offline', '下架'),
      })
    }

    if (product.status === 'offline') {
      items.push({
        key: 'online',
        label: '重新上架',
        onClick: () => handleBatchStatusUpdate('available', '上架'),
      })
    }

    if (product.status === 'available' || product.status === 'reserved') {
      items.push({
        key: 'sold',
        label: '标记已售',
        onClick: () => handleBatchStatusUpdate('sold', '标记已售'),
      })
    }

    items.push({ type: 'divider' as const })
    items.push({
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleSingleDelete(product.id, product.name),
    })

    return items
  }

  const tableColumns = [
    {
      title: '商品图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images: string[], record: Product) => (
        <Link href={`/products/${record.id}`}>
          <img
            src={images[0] || 'https://placehold.co/600x400/e6f7ff/1890ff?text=暂无图片'}
            alt={record.name}
            style={{
              width: '80px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        </Link>
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <Link href={`/products/${record.id}`} style={{ color: token.colorText }}>
          <Text
            ellipsis
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: '250px',
            }}
          >
            {text}
          </Text>
        </Link>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number, record: Product) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
            ¥{Number(price).toFixed(0)}
          </Text>
          {record.originalPrice && (
            <Text delete type="secondary" style={{ fontSize: '12px' }}>
              ¥{Number(record.originalPrice).toFixed(0)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 80,
      render: (name: string) => name || '未分类',
    },
    {
      title: '新旧程度',
      dataIndex: 'condition',
      key: 'condition',
      width: 80,
      render: (condition: string) => (
        <Tag color={getConditionColor(condition)}>{condition}</Tag>
      ),
    },
    {
      title: '库存',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 60,
      render: (quantity: number) => (
        <Text>{quantity}件</Text>
      ),
    },
    {
      title: '取货方式',
      dataIndex: 'deliveryMethod',
      key: 'deliveryMethod',
      width: 80,
      render: (method: string | null) => getDeliveryMethodText(method),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 70,
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 90,
      render: (dateStr: string) => formatDate(dateStr),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Product) => (
        <Space size="small">
          <Link href={`/products/${record.id}/edit`}>
            <Button type="link" size="small" icon={<EditOutlined />}>
              编辑
            </Button>
          </Link>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleSingleDelete(record.id, record.name)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

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
            maxWidth: '1400px',
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
                <AppstoreOutlined style={{ marginRight: '10px', color: token.colorPrimary }} />
                我的发布
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                管理您发布的所有商品
              </Text>
            </div>

            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={6}>
                <Search
                  placeholder="搜索商品名称..."
                  allowClear
                  enterButton={<span><SearchOutlined /> 搜索</span>}
                  size="large"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col xs={12} sm={8} md={3}>
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
              <Col xs={12} sm={8} md={3}>
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
              <Col xs={12} sm={8} md={3}>
                <Select
                  placeholder="状态筛选"
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  value={selectedStatus}
                  onChange={handleStatusFilterChange}
                >
                  {statusOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={24} md={9} style={{ textAlign: 'right' }}>
                <Link href="/products/new">
                  <Button
                    type="primary"
                    icon={<ShoppingOutlined />}
                    size="large"
                    style={{
                      borderRadius: '8px',
                      height: '40px',
                    }}
                  >
                    发布新商品
                  </Button>
                </Link>
              </Col>
            </Row>
          </Space>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1400px',
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
                prefix={<AppstoreOutlined />}
              />
              <Divider type="vertical" style={{ height: '40px' }} />
              <Statistic
                title="在售"
                value={stats.available}
                valueStyle={{ color: '#52c41a', fontSize: '18px' }}
              />
              <Divider type="vertical" style={{ height: '40px' }} />
              <Statistic
                title="已下架"
                value={stats.offline}
                valueStyle={{ color: token.colorTextSecondary, fontSize: '18px' }}
              />
              <Divider type="vertical" style={{ height: '40px' }} />
              <Statistic
                title="已售出"
                value={stats.sold}
                valueStyle={{ color: token.colorTextSecondary, fontSize: '18px' }}
              />
            </Space>
          </Col>
          <Col>
            {hasSelected && (
              <Space>
                <Text type="secondary">已选择 <Text strong>{selectedRowKeys.length}</Text> 个商品</Text>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleBatchStatusUpdate('available', '上架')}
                  disabled={operating}
                >
                  批量上架
                </Button>
                <Button
                  size="small"
                  onClick={() => handleBatchStatusUpdate('offline', '下架')}
                  disabled={operating}
                >
                  批量下架
                </Button>
                <Button
                  size="small"
                  onClick={() => handleBatchStatusUpdate('sold', '标记已售')}
                  disabled={operating}
                >
                  标记已售
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={handleBatchDelete}
                  disabled={operating}
                >
                  批量删除
                </Button>
              </Space>
            )}
          </Col>
        </Row>
      </div>

      <div
        style={{
          maxWidth: '1400px',
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
        ) : filteredProducts.length > 0 ? (
          <Card bordered={false} style={{ borderRadius: '12px' }}>
            <Table
              rowSelection={rowSelection}
              columns={tableColumns}
              dataSource={filteredProducts}
              rowKey="id"
              pagination={{
                current: currentPage,
                onChange: (page) => setCurrentPage(page),
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 件商品`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        ) : (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <Empty
              description={
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    暂无符合条件的商品
                  </Text>
                  <Text type="secondary">尝试调整筛选条件或搜索关键词</Text>
                  <div style={{ marginTop: 16 }}>
                    <Link href="/products/new">
                      <Button type="primary" icon={<ShoppingOutlined />}>
                        发布第一个商品
                      </Button>
                    </Link>
                  </div>
                </div>
              }
            />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
