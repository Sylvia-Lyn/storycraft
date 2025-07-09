# 注册功能故障排除指南

## 问题描述
在输入注册信息后，出现以下错误：
```
POST http://localhost:3000/api/auth/register 500 (Internal Server Error)
Register error: SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

## 解决方案

### 1. 配置环境变量
在项目根目录创建 `.env` 文件（如果不存在），添加以下内容：

```env
DATABASE_URL="mysql://admin:你的密码@database-1.c7symcc24b18.ap-southeast-2.rds.amazonaws.com:3306/2B"
JWT_SECRET="your-secret-key-here"
```

**注意：** 请将 `你的密码` 替换为实际的数据库密码。

### 2. 更新数据库结构
运行以下命令来同步数据库结构：

```bash
npx prisma db pull
npx prisma generate
```

### 3. 启动服务器
有两种方式启动开发环境：

#### 方式一：使用启动脚本（推荐）
```bash
node start-dev.js
```

#### 方式二：分别启动
```bash
# 终端1：启动后端服务器
node src/server.ts

# 终端2：启动前端服务器
npm run dev
```

### 4. 验证数据库连接
运行数据库连接测试：

```bash
node test-db-connection.js
```

## 常见问题

### Q: 数据库连接失败
A: 检查以下几点：
- `.env` 文件中的 `DATABASE_URL` 是否正确
- 数据库服务器是否正在运行
- 网络连接是否正常

### Q: 端口冲突
A: 确保端口 3000 和 5173 没有被其他程序占用

### Q: Prisma 错误
A: 运行以下命令重新生成 Prisma 客户端：
```bash
npx prisma generate
```

## 修复内容

1. ✅ 修复了 AuthService 中的字段名不匹配问题
2. ✅ 更新了 Prisma schema 以匹配数据库结构
3. ✅ 修复了前端 API 请求路径
4. ✅ 创建了开发环境启动脚本
5. ✅ 配置了 Vite 代理以正确处理 API 请求

## 测试步骤

1. 确保环境变量配置正确
2. 启动开发服务器
3. 访问 http://localhost:3000/register
4. 填写注册信息并提交
5. 检查是否成功注册并跳转到首页

如果仍有问题，请检查浏览器控制台和服务器日志以获取更详细的错误信息。 