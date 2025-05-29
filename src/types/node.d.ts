declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
    NODE_ENV?: 'development' | 'production' | 'test';
    PORT?: string;
  }
  
  interface Process {
    env: ProcessEnv;
  }
}

declare var process: NodeJS.Process;
