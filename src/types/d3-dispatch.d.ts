// 修复 @types/d3-dispatch 与 TypeScript 4.9 的兼容性问题
// 这个文件完全替代了有问题的类型定义

declare module 'd3-dispatch' {
  export interface Dispatch<T = any, EventMap = any> {
    on(typenames: string, listener?: (this: T, ...args: any[]) => void): this;
    on(typenames: string, listener: null): this;
    copy(): Dispatch<T, EventMap>;
    call(typename: string, ...args: any[]): this;
    apply(typename: string, that?: any, ...args: any[]): this;
  }

  export function dispatch<T = any, EventMap = any>(...types: string[]): Dispatch<T, EventMap>;
}

// 同时声明 @types/d3-dispatch 模块
declare module '@types/d3-dispatch' {
  export * from 'd3-dispatch';
}
