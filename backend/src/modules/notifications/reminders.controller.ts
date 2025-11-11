import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminder.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ReminderStatus } from '@database/entities';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({ status: 201, description: 'Reminder created successfully' })
  create(@CurrentUser('id') userId: string, @Body() createDto: CreateReminderDto) {
    return this.remindersService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reminders' })
  @ApiQuery({ name: 'status', enum: ReminderStatus, required: false })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('status') status?: ReminderStatus,
  ) {
    return this.remindersService.findAll(userId, status);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get reminders summary' })
  @ApiResponse({ status: 200, description: 'Returns summary with counts by status and type' })
  getSummary(@CurrentUser('id') userId: string) {
    return this.remindersService.getSummary(userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming reminders' })
  @ApiQuery({ name: 'days', type: Number, required: false, example: 7 })
  getUpcoming(@CurrentUser('id') userId: string, @Query('days') days?: number) {
    return this.remindersService.getUpcoming(userId, days ? Number(days) : 7);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue reminders' })
  getOverdue(@CurrentUser('id') userId: string) {
    return this.remindersService.getOverdue(userId);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get reminders due today' })
  getDueToday(@CurrentUser('id') userId: string) {
    return this.remindersService.getDueToday(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reminder by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.remindersService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reminder' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateReminderDto,
  ) {
    return this.remindersService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reminder' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.remindersService.remove(id, userId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark reminder as completed' })
  @ApiResponse({ status: 200, description: 'Reminder marked as completed' })
  markAsCompleted(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.remindersService.markAsCompleted(id, userId);
  }
}
