# 数据库文档（db_doc）

## 一、数据库连接方法

1. 在项目根目录的 `.env` 文件中添加如下内容：

```
DATABASE_URL="mysql://admin:你的密码@database-1.c7symcc24b18.ap-southeast-2.rds.amazonaws.com:3306/2B"
```

2. 使用 Prisma 连接数据库：

```bash
npx prisma db pull
```

如需初始化 Prisma：
```bash
npx prisma init
```

---

## 二、user 表结构设计

| 字段名            | 类型                                      | 说明                 |
|-------------------|-------------------------------------------|----------------------|
| id                | INT, AUTO_INCREMENT, PRIMARY KEY           | 主键                 |
| username          | VARCHAR(50), UNIQUE                        | 用户名               |
| password          | VARCHAR(255)                               | 密码（加密存储）     |
| login_status      | TINYINT(1), DEFAULT 0                      | 登录状态             |
| phone             | VARCHAR(20), UNIQUE                        | 手机号               |
| phone_verified    | TINYINT(1), DEFAULT 0                      | 手机号是否验证       |
| email             | VARCHAR(100), UNIQUE                       | 邮箱                 |
| email_verified    | TINYINT(1), DEFAULT 0                      | 邮箱是否验证         |
| real_name         | VARCHAR(50), NULL                          | 真实姓名             |
| id_number         | VARCHAR(32), NULL                          | 身份证号/证件号      |
| realname_verified | TINYINT(1), DEFAULT 0                      | 实名认证状态         |
| vip_type          | ENUM('free','chinese','multilingual')      | 会员类型             |
| vip_plan          | ENUM('yearly','quarterly','monthly'), NULL | 会员套餐             |
| vip_expire_at     | DATETIME, NULL                             | 会员到期时间         |
| vip_trial         | TINYINT(1), DEFAULT 0                      | 是否试用会员         |
| created_at        | DATETIME, DEFAULT CURRENT_TIMESTAMP         | 注册时间             |
| updated_at        | DATETIME, 自动更新时间                      | 更新时间             |

---

## 三、user 表建表 SQL

```sql
CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `login_status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '登录状态 0-未登录 1-已登录',
  `phone` VARCHAR(20) UNIQUE COMMENT '手机号',
  `phone_verified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '手机号是否验证 0-未验证 1-已验证',
  `email` VARCHAR(100) UNIQUE COMMENT '邮箱',
  `email_verified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '邮箱是否验证 0-未验证 1-已验证',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `id_number` VARCHAR(32) DEFAULT NULL COMMENT '身份证号/证件号',
  `realname_verified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '实名认证状态 0-未实名 1-已实名',
  `vip_type` ENUM('free', 'chinese', 'multilingual') NOT NULL DEFAULT 'free' COMMENT '会员类型',
  `vip_plan` ENUM('yearly', 'quarterly', 'monthly') DEFAULT NULL COMMENT '会员套餐',
  `vip_expire_at` DATETIME DEFAULT NULL COMMENT '会员到期时间',
  `vip_trial` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否试用会员',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

如需补充其他表或字段设计，请继续补充本文件。 