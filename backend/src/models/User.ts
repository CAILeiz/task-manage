import { IUser, ICreateUserRequest, IUserResponse } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 用户模型
 */
export class User implements IUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IUser>) {
    this.id = data.id || uuidv4();
    this.username = data.username || '';
    this.email = data.email || '';
    this.passwordHash = data.passwordHash || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * 转换为响应格式（不包含密码）
   */
  toResponse(): IUserResponse {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 从数据库行创建用户实例
   */
  static fromRow(row: any): User {
    return new User({
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  /**
   * 验证用户名格式
   */
  static validateUsername(username: string): { valid: boolean; message?: string } {
    if (!username || username.trim().length === 0) {
      return { valid: false, message: '用户名不能为空' };
    }
    if (username.length < 3 || username.length > 50) {
      return { valid: false, message: '用户名长度必须在 3-50 个字符之间' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, message: '用户名只能包含字母、数字和下划线' };
    }
    return { valid: true };
  }

  /**
   * 验证邮箱格式
   */
  static validateEmail(email: string): { valid: boolean; message?: string } {
    if (!email || email.trim().length === 0) {
      return { valid: false, message: '邮箱不能为空' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: '邮箱格式不正确' };
    }
    if (email.length > 100) {
      return { valid: false, message: '邮箱长度不能超过 100 个字符' };
    }
    return { valid: true };
  }

  /**
   * 验证密码强度
   */
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || password.length === 0) {
      return { valid: false, message: '密码不能为空' };
    }
    if (password.length < 6) {
      return { valid: false, message: '密码长度至少 6 位' };
    }
    if (password.length > 100) {
      return { valid: false, message: '密码长度不能超过 100 个字符' };
    }
    return { valid: true };
  }

  /**
   * 验证创建用户请求
   */
  static validateCreateRequest(data: ICreateUserRequest): { valid: boolean; message?: string } {
    const usernameValidation = User.validateUsername(data.username);
    if (!usernameValidation.valid) {
      return usernameValidation;
    }

    const emailValidation = User.validateEmail(data.email);
    if (!emailValidation.valid) {
      return emailValidation;
    }

    const passwordValidation = User.validatePassword(data.password);
    if (!passwordValidation.valid) {
      return passwordValidation;
    }

    return { valid: true };
  }
}

export default User;
