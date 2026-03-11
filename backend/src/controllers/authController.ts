import { Request, Response } from 'express';
import { createUser, loginUser, findUserById } from '../services';
import { successResponse, errorResponse } from '../utils/response';

function toUserResponse(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json(errorResponse('用户名、邮箱和密码不能为空', 400));
      return;
    }

    if (password.length < 6) {
      res.status(400).json(errorResponse('密码长度至少6位', 400));
      return;
    }

    const result = await createUser({ username, email, password });
    res.status(201).json(successResponse({
      user: toUserResponse(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, '注册成功'));
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json(errorResponse('用户名或邮箱已存在', 409));
      return;
    }
    res.status(500).json(errorResponse(error.message || '注册失败', 500));
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json(errorResponse('用户名和密码不能为空', 400));
      return;
    }

    const result = await loginUser(username, password);
    if (!result) {
      res.status(401).json(errorResponse('用户名或密码错误', 401));
      return;
    }

    res.json(successResponse({
      user: toUserResponse(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, '登录成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || '登录失败', 500));
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json(errorResponse('用户不存在', 404));
      return;
    }

    res.json(successResponse(toUserResponse(user), '获取成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || '获取失败', 500));
  }
}

export default {
  register,
  login,
  getMe,
};
