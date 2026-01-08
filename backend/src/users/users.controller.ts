import { Controller, Get, Param, Query, UseGuards, Patch, Delete, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Back-compat for frontend dev-proxy calls: /api/users/all -> /users/all
  @Get('all')
  findAllAlias() {
    return this.usersService.findAll();
  }

  @Get('search')
  async searchByEmail(@Query('email') email?: string) {
    if (!email?.trim()) {
      return { found: false, message: 'Missing email' };
    }

    const user = await this.usersService.findByEmail(email.trim());
    if (!user) {
      return { found: false, message: 'Không tìm thấy người dùng' };
    }

    return { found: true, user };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(id, role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
