import { forwardRef, useRef, useImperativeHandle, ChangeEvent, MouseEvent } from 'react';

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

const TextEditorArea = forwardRef<TextEditorAreaRef, TextEditorAreaProps>(
  ({ content, onChange, onSelect, placeholder = "在这里输入文本...", className = "", style = {} }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      onChange(e.target.value);
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
          className="w-full h-full p-4 resize-none outline-none"
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