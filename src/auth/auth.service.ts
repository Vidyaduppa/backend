import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

interface AuthRegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthLoginRequest {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  private currentUserId: string | null = null;

  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async register(payload: unknown): Promise<AuthResponse> {
    const body = payload as AuthRegisterRequest;
    const existing = await this.userModel.findOne({ email: body.email }).lean();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const created = await this.userModel.create({
      name: body.name,
      email: body.email,
      passwordHash,
      role: 'user',
      status: 'active',
    });

    return this.issueAuthForUser(created);
  }

  async login(payload: unknown): Promise<AuthResponse> {
    const body = payload as AuthLoginRequest;
    const user = await this.userModel.findOne({ email: body.email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueAuthForUser(user);
  }

  logout(): void {
    this.currentUserId = null;
  }

  async me(): Promise<AuthUser> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return user;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!this.currentUserId) {
      return null;
    }
    const user = await this.userModel.findById(this.currentUserId).lean();
    if (!user) {
      return null;
    }
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async getCurrentUserId(): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return user.id;
  }

  issueAuthForUser(user: UserDocument): AuthResponse {
    this.currentUserId = String(user._id);
    return {
      accessToken: `access-${Date.now()}`,
      refreshToken: `refresh-${Date.now()}`,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
