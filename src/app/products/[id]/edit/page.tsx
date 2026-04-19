'use client'

import { Typography, Button, Card, Row, Col, Form, Input, InputNumber, Select, Upload, Radio, Space, Breadcrumb, message, Divider, theme, Alert, Spin, Result } from 'antd'
import Link from 'next/link'
import { HomeOutlined, EditOutlined, UploadOutlined, ArrowLeftOutlined, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { API_ENDPOINTS } from '@/lib/api'

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const categories = ['沙发', '桌椅', '柜子', '床', '灯具', '装饰', '其他']
const conditions = ['全新', '九成新', '八成新', '七成新及以下']

interface ImageFile {
  uid: string
  name: string
  url: string
  thumbUrl?: string
  status: 'uploading' | 'done' | 'error'
  ossUrl?: string
}

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
  category: {
    id: string
    name: string
  } | null
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form] = Form.useForm()
  const { token } = theme.useToken()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [fileList, setFileList] = useState<ImageFile[]>([])

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
        const data = result.data
        setProduct(data)
        
        const initialFileList: ImageFile[] = data.images.map((img: string, index: number) => ({
          uid: `-${index}`,
          name: `image-${index}.jpg`,
          url: img,
          thumbUrl: img,
          status: 'done' as const,
          ossUrl: img,
        }))
        setFileList(initialFileList)

        form.setFieldsValue({
          name: data.name,
          description: data.description || '',
          price: data.price,
          originalPrice: data.originalPrice || undefined,
          category: data.category?.name || '其他',
          condition: data.condition,
          location: data.location || '',
          contactInfo: data.contactInfo || '',
          status: data.status,
          images: initialFileList,
        })
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

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    
    console.log('handleUpload called with file:', file.name)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'products')

      console.log('Uploading to', API_ENDPOINTS.UPLOAD)
      
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      console.log('Upload response:', result)

      if (result.success) {
        const ossUrl = result.data.url
        console.log('Upload successful, ossUrl:', ossUrl)
        onSuccess({ ossUrl, url: ossUrl })
        message.success('图片上传成功')
      } else {
        throw new Error(result.error || '上传失败')
      }
    } catch (error) {
      console.error('Upload error:', error)
      onError(error)
      message.error('图片上传失败，请重试')
    }
  }

  const handleFileChange = (info: any) => {
    const { file, fileList: newFileList } = info
    
    console.log('handleFileChange called, file.status:', file.status)
    console.log('file.response:', file.response)
    console.log('newFileList:', newFileList)
    console.log('current fileList:', fileList)

    const updatedList: ImageFile[] = newFileList.map((f: any) => {
      const existingFile = fileList.find(ef => ef.uid === f.uid)
      let ossUrl = f.response?.ossUrl || f.response?.url || f.ossUrl
      
      if (!ossUrl && existingFile?.ossUrl) {
        ossUrl = existingFile.ossUrl
      }
      if (!ossUrl && f.url && !f.originFileObj) {
        ossUrl = f.url
      }
      
      console.log(`File ${f.name}: status=${f.status}, ossUrl=${ossUrl}, f.url=${f.url}, existingFile.ossUrl=${existingFile?.ossUrl}`)
      
      const finalUrl = ossUrl || f.url || f.thumbUrl || existingFile?.url || ''
      return {
        uid: f.uid,
        name: f.name,
        url: finalUrl,
        thumbUrl: finalUrl || f.thumbUrl || existingFile?.thumbUrl,
        status: f.status,
        ossUrl: ossUrl,
      }
    })

    console.log('Updated fileList:', updatedList.map(f => ({ name: f.name, status: f.status, ossUrl: f.ossUrl, url: f.url })))
    setFileList(updatedList)
    form.setFieldsValue({ images: updatedList })
  }

  const handlePreview = async (file: any) => {
    const imageFile = fileList.find(f => f.uid === file.uid)
    let src = imageFile?.ossUrl || imageFile?.url || file.url
    if (!src && file.originFileObj) {
      src = await getBase64(file.originFileObj)
    }
    if (src) {
      const image = new Image()
      image.src = src
      const imgWindow = window.open(src)
      imgWindow?.document.write(image.outerHTML)
    }
  }

  const uploadProps = {
    listType: 'picture-card' as const,
    fileList: fileList.map(f => ({
      uid: f.uid,
      name: f.name,
      url: f.url,
      thumbUrl: f.thumbUrl,
      status: f.status,
      ossUrl: f.ossUrl,
    })),
    onPreview: handlePreview,
    onChange: handleFileChange,
    customRequest: handleUpload,
    beforeUpload: (file: File) => {
      if (fileList.length >= 9) {
        message.error('最多只能上传 9 张图片!')
        return Upload.LIST_IGNORE
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      const isAllowedType = allowedTypes.includes(file.type)

      if (!isAllowedType) {
        const fileName = file.name.toLowerCase()
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
        
        if (!hasValidExtension) {
          message.error('只能上传 JPG、PNG、WebP、GIF 格式的图片!')
          return Upload.LIST_IGNORE
        }
      }

      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB!')
        return Upload.LIST_IGNORE
      }

      return true
    },
  }

  const onFinish = async (values: any) => {
    console.log('onFinish called with values:', values)
    console.log('current fileList:', fileList.map(f => ({ name: f.name, status: f.status, ossUrl: f.ossUrl, url: f.url })))
    console.log('original product.images:', product?.images)
    
    const hasUploading = fileList.some(f => f.status === 'uploading')
    if (hasUploading) {
      message.warning('图片正在上传中，请稍候...')
      return
    }

    const hasError = fileList.some(f => f.status === 'error')
    if (hasError) {
      message.error('有图片上传失败，请删除或重新上传')
      return
    }

    let imageUrls: string[] = []
    
    const uploadedImages = fileList.filter(f => f.status === 'done' && (f.ossUrl || f.url))
    console.log('uploadedImages from fileList:', uploadedImages)
    
    if (uploadedImages.length > 0) {
      imageUrls = uploadedImages.map(f => f.ossUrl || f.url!)
    } else if (product && product.images && product.images.length > 0) {
      console.log('Using original product.images:', product.images)
      imageUrls = product.images
    }
    
    console.log('Final imageUrls:', imageUrls)
    
    if (imageUrls.length === 0) {
      message.error('请至少保留一张商品图片')
      return
    }

    setSubmitting(true)
    try {
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        originalPrice: values.originalPrice || null,
        category: values.category,
        condition: values.condition,
        location: values.location,
        contactInfo: values.contactInfo,
        status: values.status || 'available',
        images: imageUrls,
      }

      console.log('Sending product data:', productData)

      const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()
      console.log('API response:', result)

      if (result.success) {
        message.success('商品更新成功！')
        router.push(`/products/${params.id}`)
      } else {
        message.error(result.error || '更新失败，请重试')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      message.error('更新失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const uploadButton = (
    <div>
      <UploadOutlined style={{ fontSize: '24px' }} />
      <div style={{ marginTop: 8, fontSize: '13px' }}>上传图片</div>
    </div>
  )

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
                  <Button type="primary">返回商品列表</Button>
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
          maxWidth: '900px',
          margin: '0 auto',
          padding: '24px 16px',
        }}
      >
        <Breadcrumb style={{ marginBottom: '20px', fontSize: '14px' }}>
          <Breadcrumb.Item>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HomeOutlined />
              首页
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/products">商品列表</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href={`/products/${params.id}`}>商品详情</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>编辑商品</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ marginBottom: '28px' }}>
          <Title
            level={2}
            style={{
              marginBottom: '6px',
              fontSize: '24px',
            }}
          >
            <EditOutlined style={{ marginRight: '10px', color: token.colorPrimary }} />
            编辑商品
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            修改商品信息，更新后将同步到平台
          </Text>
        </div>

        <Card
          bordered={false}
          style={{ borderRadius: '12px' }}
          bodyStyle={{ padding: '24px 20px' }}
        >
          <Alert
            message="编辑商品信息"
            description="修改后点击保存按钮，商品信息将同步更新到平台"
            type="info"
            showIcon
            style={{ marginBottom: '24px', borderRadius: '8px' }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="name"
              label={
                <span>
                  <Text strong>商品名称</Text>
                  <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                </span>
              }
              rules={[{ required: true, message: '请输入商品名称' }]}
              extra="建议包含品牌、材质、型号等关键信息"
            >
              <Input
                placeholder="请输入商品名称，如：实木餐桌、布艺沙发"
                style={{ borderRadius: '8px', height: '44px' }}
                maxLength={50}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="images"
              label={
                <span>
                  <Text strong>商品图片</Text>
                  <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                </span>
              }
              rules={[{ required: true, message: '请上传商品图片' }]}
              extra="支持 JPG、PNG、WebP 格式，单张不超过 5MB，最多上传 9 张照片"
            >
              <Upload {...uploadProps} multiple maxCount={9} listType="picture-card">
                {fileList.length >= 9 ? null : uploadButton}
              </Upload>
            </Form.Item>

            {fileList.some(f => f.status === 'uploading') && (
              <Alert
                message="图片正在上传中"
                description={<span><LoadingOutlined spin /> 请等待所有图片上传完成后再点击保存</span>}
                type="warning"
                showIcon
                style={{ marginBottom: '24px', borderRadius: '8px' }}
              />
            )}

            {fileList.some(f => f.status === 'error') && (
              <Alert
                message="有图片上传失败"
                description="请删除失败的图片后重新上传"
                type="error"
                showIcon
                style={{ marginBottom: '24px', borderRadius: '8px' }}
              />
            )}

            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="price"
                  label={
                    <span>
                      <Text strong>售价 (元)</Text>
                      <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: '请输入售价' }]}
                  extra="建议参考同类商品的价格"
                >
                  <InputNumber
                    placeholder="请输入售价"
                    min={0}
                    precision={2}
                    style={{ width: '100%', height: '44px', borderRadius: '8px' }}
                    prefix="¥"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="originalPrice"
                  label={
                    <span>
                      <Text strong>原价 (元)</Text>
                      <Text type="secondary" style={{ marginLeft: '4px', fontSize: '12px' }}>
                        (选填)
                      </Text>
                    </span>
                  }
                  extra="填写原价能让买家更直观地看到优惠幅度"
                >
                  <InputNumber
                    placeholder="请输入原价"
                    min={0}
                    precision={2}
                    style={{ width: '100%', height: '44px', borderRadius: '8px' }}
                    prefix="¥"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="category"
                  label={
                    <span>
                      <Text strong>商品分类</Text>
                      <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: '请选择商品分类' }]}
                >
                  <Select
                    placeholder="请选择商品分类"
                    style={{ borderRadius: '8px', height: '44px' }}
                    size="large"
                    options={categories.map((cat) => ({ label: cat, value: cat }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="condition"
                  label={
                    <span>
                      <Text strong>新旧程度</Text>
                      <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: '请选择新旧程度' }]}
                >
                  <Select
                    placeholder="请选择新旧程度"
                    style={{ borderRadius: '8px', height: '44px' }}
                    size="large"
                    options={conditions.map((cond) => ({ label: cond, value: cond }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label={
                <span>
                  <Text strong>商品描述</Text>
                  <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                </span>
              }
              rules={[{ required: true, message: '请输入商品描述' }]}
              extra="请详细描述：使用时长、购买渠道、有无瑕疵、转让原因、尺寸规格等"
            >
              <TextArea
                placeholder="例如：2022年在宜家购买，使用了1年多，一直很爱惜，没有明显划痕。"
                rows={6}
                style={{ borderRadius: '8px' }}
                showCount
                maxLength={2000}
              />
            </Form.Item>

            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="location"
                  label={
                    <span>
                      <Text strong>所在地区</Text>
                      <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: '请输入所在地区' }]}
                  extra="建议填写到区县一级，如：北京市朝阳区"
                >
                  <Input
                    placeholder="如：北京市朝阳区、上海市浦东新区"
                    style={{ borderRadius: '8px', height: '44px' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contactInfo"
                  label={
                    <span>
                      <Text strong>联系方式</Text>
                      <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: '请输入联系方式' }]}
                  extra="手机号码或微信号，方便买家联系您"
                >
                  <Input
                    placeholder="手机号码或微信号"
                    style={{ borderRadius: '8px', height: '44px' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="status"
              label={<Text strong>商品状态</Text>}
            >
              <Radio.Group size="large">
                <Radio.Button value="available">在售</Radio.Button>
                <Radio.Button value="reserved">已预订</Radio.Button>
                <Radio.Button value="sold">已售出</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Divider style={{ margin: '28px 0 20px' }} />

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%' }}>
                <Link href={`/products/${params.id}`}>
                  <Button size="large" style={{ borderRadius: '8px', height: '44px', padding: '0 24px' }}>
                    取消
                  </Button>
                </Link>

                <Space style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<EditOutlined />}
                    loading={submitting}
                    style={{
                      borderRadius: '8px',
                      height: '44px',
                      padding: '0 24px',
                      fontWeight: 500,
                    }}
                  >
                    保存修改
                  </Button>
                </Space>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AppLayout>
  )
}
