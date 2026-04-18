'use client'

import { Typography, Button, Card, Row, Col, Form, Input, InputNumber, Select, Upload, Radio, Space, Breadcrumb, message, Divider, theme, Steps, Alert } from 'antd'
import Link from 'next/link'
import { HomeOutlined, PlusOutlined, ArrowLeftOutlined, FileTextOutlined, PictureOutlined, TagOutlined, EnvironmentOutlined, PhoneOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import AppLayout from '@/components/AppLayout'

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
  originFileObj?: File
}

export default function NewProductPage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const { token } = theme.useToken()
  const [currentStep, setCurrentStep] = useState(0)
  const [fileList, setFileList] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const uploadingUidsRef = useRef<Set<string>>(new Set())

  const steps = [
    {
      title: '基本信息',
      icon: <FileTextOutlined />,
      description: '填写商品名称和描述',
    },
    {
      title: '商品图片',
      icon: <PictureOutlined />,
      description: '上传商品照片',
    },
    {
      title: '价格分类',
      icon: <TagOutlined />,
      description: '设置价格和分类',
    },
    {
      title: '联系方式',
      icon: <PhoneOutlined />,
      description: '填写交易信息',
    },
  ]

  const uploadImageToOSS = async (file: File, uid: string): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'products')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        return result.data.url
      } else {
        throw new Error(result.error || '上传失败')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleFileChange = async (info: any) => {
    const { file, fileList: newFileList } = info

    const updatedList: ImageFile[] = newFileList.map((f: any) => {
      const existing = fileList.find(item => item.uid === f.uid)
      return {
        uid: f.uid,
        name: f.name,
        url: f.url || f.thumbUrl || existing?.url || '',
        thumbUrl: f.thumbUrl || existing?.thumbUrl,
        status: existing?.status || 'uploading',
        ossUrl: existing?.ossUrl,
        originFileObj: f.originFileObj || existing?.originFileObj,
      }
    })

    setFileList(updatedList)

    if (file.status === 'removed') {
      uploadingUidsRef.current.delete(file.uid)
      return
    }

    if (file.originFileObj && !uploadingUidsRef.current.has(file.uid)) {
      uploadingUidsRef.current.add(file.uid)

      setFileList(prev => prev.map(f => 
        f.uid === file.uid ? { ...f, status: 'uploading' } : f
      ))

      const ossUrl = await uploadImageToOSS(file.originFileObj, file.uid)

      uploadingUidsRef.current.delete(file.uid)

      if (ossUrl) {
        setFileList(prev => prev.map(f => 
          f.uid === file.uid ? { ...f, status: 'done', ossUrl, url: ossUrl } : f
        ))
        message.success('图片上传成功')
      } else {
        setFileList(prev => prev.map(f => 
          f.uid === file.uid ? { ...f, status: 'error' } : f
        ))
        message.error('图片上传失败，请重试')
      }
    }
  }

  const handlePreview = async (file: any) => {
    const imageFile = fileList.find(f => f.uid === file.uid)
    let src = imageFile?.ossUrl || imageFile?.url || file.url
    if (!src && imageFile?.originFileObj) {
      src = await getBase64(imageFile.originFileObj)
    }
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
      status: f.status as any,
    })),
    onPreview: handlePreview,
    onChange: handleFileChange,
    beforeUpload: (file: File) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!')
        return Upload.LIST_IGNORE
      }
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB!')
        return Upload.LIST_IGNORE
      }
      return false
    },
  }

  const onFinish = async (values: any) => {
    const hasUploading = fileList.some(f => f.status === 'uploading') || uploadingUidsRef.current.size > 0
    if (hasUploading) {
      message.warning('图片正在上传中，请稍候...')
      return
    }

    const hasError = fileList.some(f => f.status === 'error')
    if (hasError) {
      message.error('有图片上传失败，请删除或重新上传')
      return
    }

    const uploadedImages = fileList.filter(f => f.status === 'done' && f.ossUrl)
    if (uploadedImages.length === 0) {
      message.error('请至少上传一张商品图片')
      return
    }

    setLoading(true)
    try {
      const imageUrls = uploadedImages.map(f => f.ossUrl!)

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

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (result.success) {
        message.success('商品发布成功！')
        router.push('/products')
      } else {
        message.error(result.error || '发布失败，请重试')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      message.error('发布失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['name', 'description'])
      } else if (currentStep === 1) {
        const hasUploading = fileList.some(f => f.status === 'uploading') || uploadingUidsRef.current.size > 0
        if (hasUploading) {
          message.warning('图片正在上传中，请稍候...')
          return
        }

        if (fileList.length === 0) {
          message.warning('请至少上传一张商品图片')
          return
        }

        const hasError = fileList.some(f => f.status === 'error')
        if (hasError) {
          message.error('有图片上传失败，请删除或重新上传')
          return
        }

        const hasUploaded = fileList.some(f => f.status === 'done' && f.ossUrl)
        if (!hasUploaded) {
          message.error('没有成功上传的图片，请重新上传')
          return
        }
      } else if (currentStep === 2) {
        await form.validateFields(['price', 'category', 'condition'])
      }
      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.log('Validation failed:', error)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const uploadButton = (
    <div>
      <PlusOutlined style={{ fontSize: '24px' }} />
      <div style={{ marginTop: 8, fontSize: '13px' }}>上传图片</div>
    </div>
  )

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
          <Breadcrumb.Item>发布商品</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{ marginBottom: '28px' }}>
          <Title
            level={2}
            style={{
              marginBottom: '6px',
              fontSize: '24px',
            }}
          >
            <PlusOutlined style={{ marginRight: '10px', color: token.colorPrimary }} />
            发布商品
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            简单几步，让您的闲置家居找到新主人
          </Text>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <Steps
            current={currentStep}
            items={steps}
            size="small"
            labelPlacement="horizontal"
            style={{
              background: token.colorBgContainer,
              padding: '20px 16px',
              borderRadius: '12px',
            }}
          />
        </div>

        <Card
          bordered={false}
          style={{ borderRadius: '12px' }}
          bodyStyle={{ padding: '24px 20px' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              condition: '九成新',
              status: 'available',
            }}
            size="large"
          >
            {currentStep === 0 && (
              <div>
                <Alert
                  message="填写商品基本信息"
                  description="好的标题和详细的描述能帮助您的商品更快卖出"
                  type="info"
                  showIcon
                  style={{ marginBottom: '24px', borderRadius: '8px' }}
                />

                <Form.Item
                  name="name"
                  label={
                    <span>
                      <Text strong>商品名称</Text>
                      <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: '请输入商品名称' }]}
                  extra="建议包含品牌、材质、型号等关键信息，例如：宜家实木餐桌 1.6米"
                >
                  <Input
                    placeholder="请输入商品名称，如：实木餐桌、布艺沙发"
                    style={{ borderRadius: '8px', height: '44px' }}
                    maxLength={50}
                    showCount
                  />
                </Form.Item>

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
                    placeholder="例如：2022年在宜家购买，使用了1年多，一直很爱惜，没有明显划痕。因搬家忍痛转让，尺寸160*80*75cm，适合3-4人使用。自提地址在朝阳区，有意者可私信看实物。"
                    rows={6}
                    style={{ borderRadius: '8px' }}
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <Alert
                  message="上传商品图片"
                  description="图片将自动上传到阿里云OSS，请等待上传完成后再继续"
                  type="info"
                  showIcon
                  style={{ marginBottom: '24px', borderRadius: '8px' }}
                />

                <Form.Item
                  name="images"
                  label={
                    <span>
                      <Text strong>商品图片</Text>
                      <Text type="danger" style={{ marginLeft: '4px' }}>*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: '请上传商品图片' }]}
                  extra="支持 JPG、PNG 格式，单张不超过 5MB，建议上传 3-9 张不同角度的照片"
                >
                  <Upload {...uploadProps} multiple maxCount={9} listType="picture-card">
                    {fileList.length >= 9 ? null : uploadButton}
                  </Upload>
                </Form.Item>

                {(fileList.some(f => f.status === 'uploading') || uploadingUidsRef.current.size > 0) && (
                  <Alert
                    message="图片正在上传中"
                    description={<span><LoadingOutlined spin /> 请等待所有图片上传完成后再点击下一步</span>}
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

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      style={{ borderRadius: '8px', background: token.colorBgElevated }}
                    >
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                        💡 拍照建议
                      </Text>
                      <Text type="secondary" style={{ fontSize: '13px', lineHeight: 1.8 }}>
                        • 光线充足时拍摄，避免逆光<br />
                        • 多角度拍摄：正面、侧面、顶部<br />
                        • 拍摄细节：品牌logo、材质纹理<br />
                        • 如有瑕疵请如实拍摄
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      style={{ borderRadius: '8px', background: token.colorBgElevated }}
                    >
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                        ⚠️ 注意事项
                      </Text>
                      <Text type="secondary" style={{ fontSize: '13px', lineHeight: 1.8 }}>
                        • 图片中请勿包含联系方式<br />
                        • 请勿上传网络盗图<br />
                        • 保证图片与实物一致<br />
                        • 违规图片将被删除
                      </Text>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <Alert
                  message="设置价格和分类"
                  description="合理的定价和准确的分类能让更多人找到您的商品"
                  type="info"
                  showIcon
                  style={{ marginBottom: '24px', borderRadius: '8px' }}
                />

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
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <Alert
                  message="填写交易信息"
                  description="准确的联系方式和位置信息能帮助买家更快联系到您"
                  type="info"
                  showIcon
                  style={{ marginBottom: '24px', borderRadius: '8px' }}
                />

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
                        prefix={<EnvironmentOutlined style={{ color: token.colorTextSecondary }} />}
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
                        prefix={<PhoneOutlined style={{ color: token.colorTextSecondary }} />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="status"
                  label={<Text strong>商品状态</Text>}
                  initialValue="available"
                >
                  <Radio.Group size="large">
                    <Radio.Button value="available">在售</Radio.Button>
                    <Radio.Button value="reserved">已预订</Radio.Button>
                    <Radio.Button value="sold">已售出</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <Card
                  style={{
                    borderRadius: '12px',
                    background: token.colorSuccessBg,
                    borderColor: token.colorSuccessBorder,
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Space align="start" size="middle">
                    <CheckCircleOutlined style={{ fontSize: '24px', color: token.colorSuccess }} />
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                        准备好发布了吗？
                      </Text>
                      <Text type="secondary" style={{ fontSize: '13px', lineHeight: 1.8 }}>
                        请确保所有信息准确无误。发布后，您的商品将在平台上展示，
                        感兴趣的买家会通过您提供的联系方式与您联系。
                      </Text>
                    </div>
                  </Space>
                </Card>
              </div>
            )}

            <Divider style={{ margin: '28px 0 20px' }} />

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%' }}>
                {currentStep > 0 && (
                  <Button
                    icon={<ArrowLeftOutlined />}
                    size="large"
                    onClick={prevStep}
                    style={{ borderRadius: '8px', height: '44px', padding: '0 24px' }}
                  >
                    上一步
                  </Button>
                )}

                <Space style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Link href="/products">
                    <Button size="large" style={{ borderRadius: '8px', height: '44px', padding: '0 24px' }}>
                      取消
                    </Button>
                  </Link>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="primary"
                      size="large"
                      onClick={nextStep}
                      style={{
                        borderRadius: '8px',
                        height: '44px',
                        padding: '0 24px',
                        fontWeight: 500,
                      }}
                    >
                      下一步
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<PlusOutlined />}
                      loading={loading}
                      style={{
                        borderRadius: '8px',
                        height: '44px',
                        padding: '0 24px',
                        fontWeight: 500,
                      }}
                    >
                      发布商品
                    </Button>
                  )}
                </Space>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AppLayout>
  )
}
