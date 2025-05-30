// 这是一个模拟的Prisma客户端，用于构建过程
// 在实际开发中，应该使用真正的Prisma客户端

type Script = {
  id: string;
  content: string;
  character: {
    name: string;
    type: string;
  };
  type: string;
};

// 创建一个模拟的Prisma客户端对象
export const prisma = {
  work: {
    findMany: async () => [],
  },
  characterScript: {
    findMany: async () => [] as Script[],
    findUnique: async () => ({
      id: 'mock-id',
      content: 'mock-content',
      character: {
        name: 'mock-character',
        type: 'mock-type'
      },
      type: 'draft'
    }) as Script,
    update: async () => ({
      id: 'mock-id',
      content: 'mock-content',
      character: {
        name: 'mock-character',
        type: 'mock-type'
      },
      type: 'draft'
    }) as Script,
    delete: async () => ({}),
  },
};
