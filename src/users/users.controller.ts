import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user/profile')
  getUserProfile(): unknown {
    return this.usersService.getUserProfile();
  }

  @Put('user/profile')
  updateUserProfile(@Body() profile: unknown): unknown {
    return this.usersService.updateUserProfile(profile);
  }

  @Get('users')
  getUsers(): unknown {
    return this.usersService.getUsers();
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() payload: unknown): unknown {
    return this.usersService.updateUserStatus(id, payload);
  }
}
