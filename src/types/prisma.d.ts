declare module './lib/prisma' {
  export const prisma: {
    work: {
      findMany: (options?: any) => Promise<any[]>;
    };
    characterScript: {
      findMany: (options?: any) => Promise<any[]>;
      findUnique: (options?: any) => Promise<any>;
      update: (options?: any) => Promise<any>;
      delete: (options?: any) => Promise<any>;
    };
  };
}
