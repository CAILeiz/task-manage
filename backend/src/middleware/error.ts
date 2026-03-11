import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    res.status(400).json({
      code: 400,
      data: null,
      message: err.message,
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      code: 401,
      data: null,
      message: '未授权',
    });
    return;
  }

  res.status(500).json({
    code: 500,
    data: null,
    message: '服务器内部错误',
  });
}

export default errorMiddleware;
