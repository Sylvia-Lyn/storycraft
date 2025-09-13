# Stripe支付集成指南

## 概述
本项目已成功集成Stripe支付系统，用户可以通过Stripe的安全支付页面完成订阅购买。

## 集成内容

### 1. 配置文件更新
- 在 `src/config.ts` 中添加了 `STRIPE_PUBLISHABLE_KEY` 配置项
- 需要设置环境变量 `VITE_STRIPE_PUBLISHABLE_KEY`

### 2. 依赖包
- 前端：`@stripe/stripe-js`
- 后端：`stripe` (在 `functions/payment_manager/package.json` 中)

### 3. 核心组件

#### StripeService (`src/services/stripeService.ts`)
- `createCheckoutSession()`: 创建Stripe支付会话
- `redirectToCheckout()`: 重定向到Stripe支付页面
- `verifySession()`: 验证支付会话并处理支付成功

#### PaymentSuccessPage (`src/components/PaymentSuccessPage.tsx`)
- 处理支付成功后的页面显示
- 自动验证支付状态
- 更新用户订阅信息

#### VipPage 更新
- 替换了原有的模拟支付逻辑
- 集成真实的Stripe支付流程

### 4. 云函数更新
- `functions/payment_manager/index.js` 中添加了Stripe相关功能：
  - `createStripeCheckoutSession`: 创建Stripe支付会话
  - `handleStripePaymentSuccess`: 处理支付成功

### 5. 路由配置
- 添加了 `/payment/success` 路由用于支付成功页面

## 支付流程

1. 用户在VIP页面点击购买按钮
2. 系统创建订单并生成Stripe支付会话
3. 用户被重定向到Stripe安全支付页面
4. 用户完成支付后，Stripe重定向回应用
5. 支付成功页面验证支付状态并更新用户订阅

## 环境变量配置

需要在环境变量中设置：
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

在云函数环境中设置：
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

## 测试

1. 确保已安装所有依赖包
2. 配置正确的Stripe密钥
3. 在VIP页面测试购买流程
4. 验证支付成功后的用户状态更新

## 注意事项

- 确保Stripe密钥的安全性
- 在生产环境中使用真实的Stripe密钥
- 测试时使用Stripe的测试模式
- 支付成功后会自动更新用户的订阅状态
