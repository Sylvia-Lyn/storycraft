import ghpages from 'gh-pages';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('开始部署到GitHub Pages...');

ghpages.publish(
  join(__dirname, 'dist'),
  {
    branch: 'gh-pages',
    repo: 'https://github.com/Jackwang-lea/storycraft.git',
    message: 'Auto-deploy from script',
    dotfiles: true,
    user: {
      name: 'GitHub Actions',
      email: 'actions@github.com'
    }
  },
  (err) => {
    if (err) {
      console.error('部署失败:', err);
      process.exit(1);
    } else {
      console.log('部署成功!');
    }
  }
); 