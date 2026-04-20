'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  theme,
  Alert,
} from 'antd'
import {
  PhoneOutlined,
  LockOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import AppLayout from '@/components/AppLayout'
import { sendVerificationCode, loginWithCode } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const { Title, Text } = Typography

const PHONE_REGEX = /^1[3-9]\d{9}$/

export default function LoginPage() {
  const { token } = theme.useToken()
  const [form] = Form.useForm()
  const router = useRouter()
  const { isLoggedIn, setUser } = useAuth()

  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showTestCode, setShowTestCode] = useState(true)

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [countdown])

  const handleSendCode = async () => {
    try {
      const phone = form.getFieldValue('phone')
      
      if (!phone || !PHONE_REGEX.test(phone)) {
        message.error('请输入正确的手机号码')
        return
      }

      setCodeLoading(true)
      const result = await sendVerificationCode(phone)
      
      if (result.success) {
        message.success(result.message || '验证码已发送')
        setCountdown(60)
        setShowTestCode(true)
      } else {
        message.error(result.error || '发送验证码失败')
      }
    } catch (error) {
      message.error('发送验证码失败')
    } finally {
      setCodeLoading(false)
    }
  }

  const handleFinish = async (values: { phone: string; code: string }) => {
    try {
      setLoading(true)
      
      const result = await loginWithCode(values.phone, values.code)
      
      if (result.success && result.data) {
        setUser(result.data.user)
        message.success(result.message || '登录成功')
        setTimeout(() => {
          router.push('/')
        }, 500)
      } else {
        message.error(result.error || '登录失败')
      }
    } catch (error) {
      message.error('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div
        style={{
          minHeight: 'calc(100vh - 144px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
          background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, #f0f5ff 100%)`,
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: '420px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
          bodyStyle={{
            padding: '40px 32px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #40a9ff 100%)`,
              }}
            >
              <HomeOutlined style={{ color: '#fff', fontSize: '28px' }} />
            </div>
            <Title level={3} style={{ marginBottom: '8px' }}>
              登录 HomeLoop
            </Title>
            <Text type="secondary">
              输入手机号和验证码即可登录，新用户自动注册
            </Text>
          </div>

          {showTestCode && (
            <Alert
              message="测试提示"
              description="当前为测试模式，固定验证码为: 123456"
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
              closable
              onClose={() => setShowTestCode(false)}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            size="large"
          >
            <Form.Item
              name="phone"
              label="手机号码"
              rules={[
                { required: true, message: '请输入手机号码' },
                { pattern: PHONE_REGEX, message: '请输入正确的手机号码' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: token.colorTextSecondary }} />}
                placeholder="请输入手机号"
                maxLength={11}
              />
            </Form.Item>

            <Form.Item
              name="code"
              label="验证码"
              rules={[
                { required: true, message: '请输入验证码' },
                { len: 6, message: '请输入6位验证码' },
              ]}
            >
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 120px)' }}
                  prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
                  placeholder="请输入验证码"
                  maxLength={6}
                />
                <Button
                  type="primary"
                  style={{ width: '120px' }}
                  onClick={handleSendCode}
                  loading={codeLoading}
                  disabled={countdown > 0}
                  ghost
                >
                  {countdown > 0 ? `${countdown}秒` : '获取验证码'}
                </Button>
              </Input.Group>
            </Form.Item>

            <Form.Item style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                登录 / 注册
              </Button>
            </Form.Item>

            <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center' }}>
              登录即表示同意
              <Link href="#" style={{ color: token.colorPrimary, margin: '0 4px' }}>
                用户协议
              </Link>
              和
              <Link href="#" style={{ color: token.colorPrimary, margin: '0 4px' }}>
                隐私政策
              </Link>
            </Text>
          </Form>
        </Card>
      </div>
    </AppLayout>
  )
}
