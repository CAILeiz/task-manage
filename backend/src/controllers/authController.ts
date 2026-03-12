import { Request, Response } from 'express';
import { createUser, loginUser, findUserById, updateUser, changeUserPassword, findOrCreateGitHubUser } from '../services';
import { successResponse, errorResponse } from '../utils/response';

function toUserResponse(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    bio: user.bio || '',
    avatar: user.avatar || '',
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

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return;
    }

    const { username, email, bio, avatar } = req.body;
    const user = await updateUser(userId, { username, email, bio, avatar });
    
    if (!user) {
      res.status(404).json(errorResponse('用户不存在', 404));
      return;
    }

    res.json(successResponse(toUserResponse(user), '更新成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || '更新失败', 500));
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json(errorResponse('请提供当前密码和新密码', 400));
      return;
    }

    const result = await changeUserPassword(userId, currentPassword, newPassword);
    if (!result.success) {
      res.status(400).json(errorResponse(result.message, 400));
      return;
    }

    res.json(successResponse(null, result.message));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || '密码修改失败', 500));
  }
}

export async function githubLogin(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json(errorResponse('缺少授权码', 400));
      return;
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      res.status(500).json(errorResponse('GitHub 登录未配置', 500));
      return;
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };
    if (tokenData.error) {
      res.status(401).json(errorResponse('GitHub 授权失败', 401));
      return;
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const githubUser = await userResponse.json() as { id: number; login: string; email?: string; avatar_url?: string };
    if (!githubUser.id) {
      res.status(401).json(errorResponse('获取 GitHub 用户信息失败', 401));
      return;
    }

    const result = await findOrCreateGitHubUser(
      String(githubUser.id),
      githubUser.login,
      githubUser.email || '',
      githubUser.avatar_url
    );

    res.json(successResponse({
      user: toUserResponse(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, 'GitHub 登录成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || 'GitHub 登录失败', 500));
  }
}

export default {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  githubLogin,
};
