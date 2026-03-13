import { Injectable, UnauthorizedException } from '@nestjs/common';

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

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  private users: StoredUser[] = [
    {
      id: 'admin-1',
      name: 'Admin',
      email: 'admin@shop.local',
      password: 'Admin@123',
      role: 'admin',
    },
  ];
  private currentUser: AuthUser | null = null;

  register(payload: unknown): AuthResponse {
    const body = payload as AuthRegisterRequest;
    const created: StoredUser = {
      id: `u${Date.now()}`,
      name: body.name,
      email: body.email,
      password: body.password,
      role: 'user',
    };

    this.users.push(created);
    this.currentUser = {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
    };

    return {
      accessToken: `access-${Date.now()}`,
      refreshToken: `refresh-${Date.now()}`,
      user: this.currentUser,
    };
  }

  login(payload: unknown): AuthResponse {
    const body = payload as AuthLoginRequest;
    const user = this.users.find(
      (item) => item.email === body.email && item.password === body.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: `access-${Date.now()}`,
      refreshToken: `refresh-${Date.now()}`,
      user: this.currentUser,
    };
  }

  logout(): void {
    this.currentUser = null;
  }

  me(): AuthUser {
    if (!this.currentUser) {
      throw new UnauthorizedException('Not authenticated');
    }
    return this.currentUser;
  }
}
