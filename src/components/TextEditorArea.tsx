import { forwardRef, useRef, useImperativeHandle, useEffect, ChangeEvent } from 'react';

interface TextEditorAreaProps {
  content: string;
  onChange: (content: string) => void;
  onSelect?: (e: any) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface TextEditorAreaRef {
  getTextarea: () => HTMLTextAreaElement | null;
  focus: () => void;
}

// 自动保存功能的本地存储键名
const AUTOSAVE_KEY = 'storycraft_autosave_content';

const TextEditorArea = forwardRef<TextEditorAreaRef, TextEditorAreaProps>(
  ({ content, onChange, onSelect, placeholder = "南晋长熙年间，大漠赫连部悄然崛起。可汗独女为何身负颠覆草原命运的预言？都护长子苏飞卿为何夜夜梦魇？平南王独女为何忽然走失又忽然带着敌酋之首现身？尊贵无极的永安公主为何独独心仪一介伶人花间客？冷宫中总是被鬼事缠身的奴婢鸢儿，如何一朝成为了公主近臣？在这里中，每一个人都有他们设计好的故事线。皇权斗争？爱恨纠缠？时空只是表象，时空诡计里扭曲的情感才是他们的命运。在这里，每一个人都被写入了设定和执念，有些人能够控制这些虚妄的规则，有些人迷失在无尽的轮回中。无尽的轮回里，有人像推着巨石向上的西西弗斯，是扑向命运之火的飞蛾，凭借着微茫的希望，一次一次尝试打破宿命，像新生的蝴蝶一次一次突破自己的茧。当你再一次在梦中醒来，还会去寻求交织时空背后的真相吗？庄生化蝶，望帝托鹃，南柯一梦，孰真孰幻？重重梦境，你此时究竟身在何处？\n 在这里，每一个人都被写入了设定和执念，有些人能够控制这些虚妄的规则，有些人迷失在无尽的轮回中。无尽的轮回里，有人像推着巨石向上的西西弗斯，是扑向命运之火的飞蛾，凭借着微茫的希望，一次一次尝试打破宿命，像新生的蝴蝶一次一次突破自己的茧。当你再一次在梦中醒来，还会去寻求交织时空背后的真相吗？庄生化蝶，望帝托鹃，南柯一梦，孰真孰幻？重重梦境，你此时究竟身在何处？", className = "", style = {} }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 组件挂载时，尝试从localStorage加载已保存的内容
    useEffect(() => {
      try {
        const savedContent = localStorage.getItem(AUTOSAVE_KEY);
        if (savedContent && savedContent.trim() !== '' && content === '') {
          // 只有当当前内容为空时，才加载已保存的内容
          onChange(savedContent);
        }
      } catch (error) {
        console.error('Failed to load autosaved content:', error);
      }
    }, []);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      getTextarea: () => textareaRef.current,
      focus: () => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    }));

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      onChange(newContent);

      // 自动保存到localStorage
      try {
        localStorage.setItem(AUTOSAVE_KEY, newContent);
      } catch (error) {
        console.error('Failed to autosave content:', error);
      }
    };

    // 默认样式
    const defaultStyle: React.CSSProperties = {
      lineHeight: '1.6',
      ...style
    };

    return (
      <div className={`flex-1 border border-gray-300 rounded ${className}`}>
        <textarea
          ref={textareaRef}
          className="w-full h-full p-3 resize-none outline-none"
          value={content}
          onChange={handleChange}
          onSelect={onSelect}
          placeholder={placeholder}
          style={defaultStyle}
        />
      </div>
    );
  }
);

TextEditorArea.displayName = 'TextEditorArea';

export default TextEditorArea; 