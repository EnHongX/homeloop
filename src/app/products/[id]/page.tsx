'use client'

import { Typography, Button, Card, Row, Col, Space, Tag, Descriptions, Divider, Image, Breadcrumb, DescriptionsProps, Spin, Result, Empty, Modal, message, theme } from 'antd'
import Link from 'next/link'
import { HomeOutlined, EditOutlined, ArrowLeftOutlined, LoadingOutlined, DeleteOutlined, ShoppingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { API_ENDPOINTS } from '@/lib/api'

const { Title, Text } = Typography

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'green'
    case 'reserved':
      return 'orange'
    case 'sold':
      return 'default'
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
    default:
      return status
  }
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { token } = theme.useToken()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${params.id}`)
      const result = await response.json()
      if (result.success) {
        setProduct(result.data)
      } else {
        if (response.status === 404) {
          setNotFound(true)
        }
        console.error('Error fetching product:', result.error)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${params.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        message.success('商品已删除')
        setDeleteModalVisible(false)
        router.push('/products')
      } else {
        message.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      message.error('删除失败，请稍后重试')
    } finally {
      setDeleting(false)
    }
  }

  const getDescriptionItems = (): DescriptionsProps['items'] => {
    if (!product) return []
    return [
      {
        key: '1',
        label: '价格',
        children: (
          <span className="text-xl font-bold text-red-500">
            ¥{Number(product.price).toLocaleString()}
          </span>
        ),
      },
      {
        key: '2',
        label: '原价',
        children: product.originalPrice ? (
          <Text delete className="text-gray-400">
            ¥{Number(product.originalPrice).toLocaleString()}
          </Text>
        ) : (
          <Text type="secondary">无</Text>
        ),
      },
      {
        key: '3',
        label: '新旧程度',
        children: <Tag color={getConditionColor(product.condition)}>{product.condition}</Tag>,
      },
      {
        key: '4',
        label: '分类',
        children: <Tag>{product.category?.name || '未分类'}</Tag>,
      },
      {
        key: '5',
        label: '状态',
        children: <Tag color={getStatusColor(product.status)}>{getStatusText(product.status)}</Tag>,
      },
      {
        key: '6',
        label: '浏览次数',
        children: `${product.views} 次`,
      },
      {
        key: '7',
        label: '发布时间',
        children: new Date(product.createdAt).toLocaleString('zh-CN'),
      },
      {
        key: '8',
        label: '所在地区',
        children: product.location || '未知',
      },
      {
        key: '9',
        label: '联系方式',
        children: product.contactInfo || '未知',
      },
    ]
  }

  if (loading) {
    return (
      <AppLayout>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">加载中...</Text>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (notFound || !product) {
    return (
      <AppLayout>
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '80px 16px',
            textAlign: 'center',
          }}
        >
          <Result
            status="404"
            title="商品不存在"
            subTitle="您访问的商品可能已被删除或不存在"
            icon={<ExclamationCircleOutlined />}
            extra={
              <Space>
                <Link href="/products">
                  <Button type="primary" icon={<ShoppingOutlined />}>
                    返回商品列表
                  </Button>
                </Link>
                <Link href="/">
                  <Button>返回首页</Button>
                </Link>
              </Space>
            }
          />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 16px 48px',
        }}
      >
        <Breadcrumb className="mb-6" style={{ marginBottom: '24px' }}>
          <Breadcrumb.Item>
            <Link href="/">首页</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/products">商品列表</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>商品详情</Breadcrumb.Item>
        </Breadcrumb>

        <Link href="/products" style={{ display: 'inline-block', marginBottom: '20px' }}>
          <Button type="text" icon={<ArrowLeftOutlined />}>
            返回商品列表
          </Button>
        </Link>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card
              bordered={false}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
              }}
              bodyStyle={{
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <Row gutter={[8, 8]} align="middle" style={{ marginBottom: '16px' }}>
                  <Col flex="auto">
                    <Title
                      level={2}
                      style={{
                        margin: 0,
                        fontSize: '22px',
                        fontWeight: 600,
                        color: token.colorText,
                        lineHeight: 1.4,
                      }}
                    >
                      {product.name}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={[8, 8]}>
                  {product.status !== 'available' && (
                    <Col>
                      <Tag color={getStatusColor(product.status)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                        {getStatusText(product.status)}
                      </Tag>
                    </Col>
                  )}
                  <Col>
                    <Tag color={getConditionColor(product.condition)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                      {product.condition}
                    </Tag>
                  </Col>
                  <Col>
                    <Tag>{product.category?.name || '未分类'}</Tag>
                  </Col>
                </Row>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <Image.PreviewGroup>
                  <div style={{ marginBottom: '12px' }}>
                    <Image
                      width="100%"
                      height={400}
                      src={product.images[0] || 'https://placehold.co/600x400/e6f7ff/1890ff?text=暂无图片'}
                      style={{
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                      preview={{
                        visible: previewImage === product.images[0],
                        onVisibleChange: (visible) => {
                          if (visible) {
                            setPreviewImage(product.images[0] || null)
                          } else {
                            setPreviewImage(null)
                          }
                        },
                      }}
                    />
                  </div>
                  {product.images.length > 1 && (
                    <Row gutter={[8, 8]}>
                      {product.images.slice(1).map((image, index) => (
                        <Col key={index}>
                          <Image
                            width={100}
                            height={100}
                            src={image}
                            style={{
                              objectFit: 'cover',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              border: `2px solid ${previewImage === image ? token.colorPrimary : token.colorBorder}`,
                            }}
                            preview={{
                              visible: previewImage === image,
                              onVisibleChange: (visible) => {
                                if (visible) {
                                  setPreviewImage(image)
                                } else {
                                  setPreviewImage(null)
                                }
                              },
                            }}
                          />
                        </Col>
                      ))}
                    </Row>
                  )}
                </Image.PreviewGroup>
              </div>

              <Divider />

              <div>
                <Title
                  level={4}
                  style={{
                    marginBottom: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  商品描述
                </Title>
                <Text
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.8,
                    color: token.colorTextSecondary,
                  }}
                >
                  {product.description || '暂无描述'}
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <div style={{ position: 'sticky', top: '88px' }}>
              <Card
                bordered={false}
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
                bodyStyle={{
                  padding: '24px',
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#ff4d4f',
                        lineHeight: 1.2,
                      }}
                    >
                      ¥{Number(product.price).toLocaleString()}
                    </Text>
                    {product.originalPrice && (
                      <Text
                        delete
                        style={{
                          fontSize: '16px',
                          color: token.colorTextSecondary,
                        }}
                      >
                        原价 ¥{Number(product.originalPrice).toLocaleString()}
                      </Text>
                    )}
                  </div>
                  {product.originalPrice && product.price < product.originalPrice && (
                    <Tag
                      color="red"
                      style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        padding: '2px 8px',
                      }}
                    >
                      省 ¥{Number(product.originalPrice - product.price).toLocaleString()}
                    </Tag>
                  )}
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <Descriptions
                  column={1}
                  size="small"
                  items={(getDescriptionItems() || []).slice(2)}
                  labelStyle={{
                    color: token.colorTextSecondary,
                    fontWeight: 400,
                    width: '80px',
                  }}
                />

                <Divider style={{ margin: '16px 0' }} />

                <Row gutter={[8, 8]} style={{ marginBottom: '20px' }}>
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      发布于 {new Date(product.createdAt).toLocaleDateString('zh-CN')}
                    </Text>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {product.views} 次浏览
                    </Text>
                  </Col>
                </Row>

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {product.status === 'available' && (
                    <Button type="primary" size="large" block style={{ height: '48px', borderRadius: '8px', fontSize: '16px' }}>
                      联系卖家
                    </Button>
                  )}
                  
                  <Row gutter={[8, 8]}>
                    <Col flex={1}>
                      <Link href={`/products/${params.id}/edit`} style={{ display: 'block' }}>
                        <Button icon={<EditOutlined />} block style={{ height: '40px', borderRadius: '6px' }}>
                          编辑商品
                        </Button>
                      </Link>
                    </Col>
                    <Col flex={1}>
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        block
                        style={{ height: '40px', borderRadius: '6px' }}
                        onClick={() => setDeleteModalVisible(true)}
                      >
                        删除商品
                      </Button>
                    </Col>
                  </Row>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={deleting}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <div style={{ padding: '16px 0' }}>
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '20px', marginRight: '8px' }} />
          <Text>确定要删除该商品吗？此操作不可撤销。</Text>
        </div>
        <div style={{ marginTop: '16px', padding: '12px', background: '#fff2f0', borderRadius: '6px' }}>
          <Text strong style={{ color: '#ff4d4f' }}>
            商品名称：{product.name}
          </Text>
        </div>
      </Modal>
    </AppLayout>
  )
}
