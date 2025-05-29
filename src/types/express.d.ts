declare module 'express' {
  import { Server } from 'http';
  
  export interface Request {
    params: Record<string, string>;
    body: any;
  }
  
  export interface Response {
    json(data: any): Response;
    status(code: number): Response;
    send(body: any): Response;
    end(): Response;
    setHeader(name: string, value: string): Response;
  }
  
  export interface Application {
    use(middleware: any): Application;
    get(path: string, handler: (req: Request, res: Response) => void): Application;
    post(path: string, handler: (req: Request, res: Response) => void): Application;
    put(path: string, handler: (req: Request, res: Response) => void): Application;
    delete(path: string, handler: (req: Request, res: Response) => void): Application;
    listen(port: number, callback?: () => void): Server;
  }
  
  export default function express(): Application;
}
