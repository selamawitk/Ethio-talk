declare module 'serverless-http' {
  import { Request, Response, NextFunction } from 'express';
  interface ServerlessHandler {
    (event: any, context: any): Promise<any>;
  }
  export default function serverless(
    app: (req: Request, res: Response, next: NextFunction) => void,
    options?: any,
  ): ServerlessHandler;
}
