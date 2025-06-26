import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import { AuthService } from './services/authService';

const app = express();
const port = process.env.PORT || 5173;

app.use(cors());
app.use(express.json());

// 用户注册
app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { username, phone, password } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    const result = await AuthService.register({ username, phone, password });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('注册接口错误:', error);
    res.status(400).json({ error: error.message });
  }
});

// 用户登录
app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '请填写用户名和密码' });
    }

    const result = await AuthService.login({ username, password });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 验证token
app.get('/api/auth/verify', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: '未提供token' });
    }

    const user = await AuthService.verifyToken(token);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// 获取用户信息
app.get('/api/auth/profile', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: '未提供token' });
    }

    const decoded = await AuthService.verifyToken(token);
    const user = await AuthService.getUserById(decoded.user_id);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// 获取所有作品
app.get('/api/works', async (_req: any, res: any) => {
  try {
    const works = await prisma.user.findMany();
    res.json(works);
  } catch (error) {
    console.error('Error fetching works:', error);
    res.status(500).json({ error: 'Failed to fetch works' });
  }
});

// 获取作品的所有角色剧本
app.get('/api/works/:workId/scripts', async (req: any, res: any) => {
  const { workId } = req.params;

  try {
    const scripts = await prisma.user.findMany();
    res.json(scripts);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    res.status(500).json({ error: 'Failed to fetch scripts' });
  }
});

// 获取单个剧本
app.get('/api/scripts/:scriptId', async (req: any, res: any) => {
  const { scriptId } = req.params;

  try {
    const script = await prisma.user.findUnique({
      where: { id: parseInt(scriptId) }
    });

    if (!script) {
      res.status(404).json({ error: 'Script not found' });
      return;
    }

    res.json(script);
  } catch (error) {
    console.error('Error fetching script:', error);
    res.status(500).json({ error: 'Failed to fetch script' });
  }
});

// 更新剧本
app.put('/api/scripts/:scriptId', async (req: any, res: any) => {
  const { scriptId } = req.params;
  const { content } = req.body;

  try {
    const updatedScript = await prisma.user.update({
      where: { id: parseInt(scriptId) },
      data: { username: content }
    });
    res.json(updatedScript);
  } catch (error) {
    console.error('Error updating script:', error);
    res.status(500).json({ error: 'Failed to update script' });
  }
});

// 删除剧本
app.delete('/api/scripts/:scriptId', async (req: any, res: any) => {
  const { scriptId } = req.params;

  try {
    await prisma.user.delete({
      where: { id: parseInt(scriptId) }
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting script:', error);
    res.status(500).json({ error: 'Failed to delete script' });
  }
});

// 下载剧本
app.get('/api/scripts/:scriptId/download', async (req: any, res: any) => {
  const { scriptId } = req.params;

  try {
    const script = await prisma.user.findUnique({
      where: { id: parseInt(scriptId) }
    });

    if (!script) {
      res.status(404).json({ error: 'Script not found' });
      return;
    }

    // 生成文件名
    const fileName = `${script.username}_script.txt`;

    // 设置响应头
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(fileName)}`);

    // 返回文件内容
    res.send(script.username);
  } catch (error) {
    console.error('Error downloading script:', error);
    res.status(500).json({ error: 'Failed to download script' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 