import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('user/profile')
  async getUserProfile(): Promise<unknown> {
    const userId = await this.authService.getCurrentUserId();
    return this.usersService.getUserProfile(userId);
  }

  @Put('user/profile')
  async updateUserProfile(@Body() profile: unknown): Promise<unknown> {
    const userId = await this.authService.getCurrentUserId();
    return this.usersService.updateUserProfile(userId, profile);
  }

  @Get('users')
  getUsers(): Promise<unknown> {
    return this.usersService.getUsers();
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body() payload: unknown,
  ): Promise<unknown> {
    return this.usersService.updateUserStatus(id, payload);
  }
}
