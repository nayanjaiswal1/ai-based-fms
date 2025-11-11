import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto, UpdateSubscriptionDto, SuspendUserDto } from './dto/admin.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@database/entities';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns paginated user list' })
  getAllUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns user details with stats' })
  getUserDetails(@Param('userId') userId: string) {
    return this.adminService.getUserDetails(userId);
  }

  @Patch('users/:userId/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  updateUserRole(
    @CurrentUser('id') adminId: string,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(adminId, userId, updateDto);
  }

  @Patch('users/:userId/subscription')
  @ApiOperation({ summary: 'Update user subscription (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subscription updated' })
  updateSubscription(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateSubscriptionDto,
  ) {
    return this.adminService.updateSubscription(userId, updateDto);
  }

  @Post('users/:userId/suspend')
  @ApiOperation({ summary: 'Suspend/unsuspend user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User suspension status updated' })
  suspendUser(
    @CurrentUser('id') adminId: string,
    @Param('userId') userId: string,
    @Body() suspendDto: SuspendUserDto,
  ) {
    return this.adminService.suspendUser(adminId, userId, suspendDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics (Admin only)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns system statistics' })
  getSystemStats(@Query('days') days?: number) {
    return this.adminService.getSystemStats(days);
  }

  @Get('activity-logs')
  @ApiOperation({ summary: 'Get activity logs (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns recent activities' })
  getActivityLogs(@Query('limit') limit?: number) {
    return this.adminService.getActivityLogs(limit);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns performance metrics' })
  getPerformanceMetrics() {
    return this.adminService.getPerformanceMetrics();
  }
}
