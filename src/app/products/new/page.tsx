'use client'

import { Layout, Typography, Button, Card, Row, Col, Form, Input, InputNumber, Select, Upload, Radio, Space, Breadcrumb, message, Divider } from 'antd'
import Link from 'next/link'
import { HomeOutlined, PlusOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const categories = ['沙发', '桌椅', '柜子', '床', '灯具', '装饰', '其他']
const conditions = ['全新', '九成新', '八成新', '七成新及以下']

const uploadProps = {
  name: 'file',
  action: '/api/upload',
  listType: 'picture',
  previewFile: async (file: File | Blob) => {
    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  },
  onChange(info: any) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList)
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`)
    }
  },
}

export default function NewProductPage() {
  const router = useRouter()
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    console.log('Form values:', values)
    message.success('商品发布成功！')
    router.push('/products')
  }

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
        <div className="max-w-4xl mx-auto">
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item>
              <Link href="/">首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/products">商品列表</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>发布商品</Breadcrumb.Item>
          </Breadcrumb>

          <Card>
            <Title level={2} className="!mb-6">
              <PlusOutlined className="mr-2" />
              发布商品
            </Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                condition: '九成新',
                status: 'available',
              }}
            >
              <Form.Item
                name="name"
                label="商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称，如：实木餐桌" size="large" />
              </Form.Item>

              <Form.Item
                name="images"
                label="商品图片"
                rules={[{ required: true, message: '请上传商品图片' }]}
              >
                <Upload
                  {...uploadProps}
                  listType="picture-card"
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                </Upload>
                <Text type="secondary" className="text-sm">
                  支持 JPG、PNG 格式，最多上传 9 张图片，建议尺寸 800x800
                </Text>
              </Form.Item>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="price"
                    label="售价 (元)"
                    rules={[{ required: true, message: '请输入售价' }]}
                  >
                    <InputNumber
                      placeholder="请输入售价"
                      min={0}
                      precision={2}
                      size="large"
                      style={{ width: '100%' }}
                      prefix="¥"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="originalPrice"
                    label="原价 (元)（选填）"
                  >
                    <InputNumber
                      placeholder="请输入原价"
                      min={0}
                      precision={2}
                      size="large"
                      style={{ width: '100%' }}
                      prefix="¥"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="category"
                    label="商品分类"
                    rules={[{ required: true, message: '请选择商品分类' }]}
                  >
                    <Select placeholder="请选择商品分类" size="large">
                      {categories.map((cat) => (
                        <Option key={cat} value={cat}>
                          {cat}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="condition"
                    label="新旧程度"
                    rules={[{ required: true, message: '请选择新旧程度' }]}
                  >
                    <Select placeholder="请选择新旧程度" size="large">
                      {conditions.map((cond) => (
                        <Option key={cond} value={cond}>
                          {cond}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="商品描述"
                rules={[{ required: true, message: '请输入商品描述' }]}
              >
                <TextArea
                  placeholder="请详细描述商品情况，包括使用时间、有无划痕、转让原因等"
                  rows={6}
                  size="large"
                  showCount
                  maxLength={2000}
                />
              </Form.Item>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="location"
                    label="所在地区"
                    rules={[{ required: true, message: '请输入所在地区' }]}
                  >
                    <Input placeholder="如：北京市朝阳区" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="contactInfo"
                    label="联系方式"
                    rules={[{ required: true, message: '请输入联系方式' }]}
                  >
                    <Input placeholder="手机号码或微信号" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="status"
                label="商品状态"
                rules={[{ required: true, message: '请选择商品状态' }]}
              >
                <Radio.Group>
                  <Radio.Button value="available">在售</Radio.Button>
                  <Radio.Button value="reserved">已预订</Radio.Button>
                  <Radio.Button value="sold">已售出</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Divider />

              <Form.Item className="!mb-0">
                <Space>
                  <Button type="primary" htmlType="submit" size="large">
                    发布商品
                  </Button>
                  <Link href="/products">
                    <Button size="large">取消</Button>
                  </Link>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
      <Footer className="text-center bg-white">
        HomeLoop ©{new Date().getFullYear()} - 二手家居交易平台
      </Footer>
    </Layout>
  )
}
