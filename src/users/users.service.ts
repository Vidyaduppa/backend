import { Injectable, NotFoundException } from '@nestjs/common';

export interface UserProfile {
  name: string;
  email: string;
  address: string;
}

interface UpdateUserStatusRequest {
  status: 'active' | 'blocked';
}

interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'blocked';
  orders: number;
  joinedAt: string;
}

@Injectable()
export class UsersService {
  private profile: UserProfile = {
    name: '',
    email: '',
    address: '',
  };

  private users: AdminUserSummary[] = [];

  getUserProfile(): UserProfile {
    return this.profile;
  }

  updateUserProfile(profile: unknown): UserProfile {
    this.profile = { ...(profile as UserProfile) };
    return this.profile;
  }

  getUsers(): AdminUserSummary[] {
    return this.users;
  }

  updateUserStatus(id: string, payload: unknown): AdminUserSummary {
    const body = payload as UpdateUserStatusRequest;
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      throw new NotFoundException('User not found');
    }

    const updated = {
      ...this.users[index],
      status: body.status,
    };

    this.users[index] = updated;
    return updated;
  }
}
