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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LendBorrowService } from './lend-borrow.service';
import { CreateLendBorrowDto, UpdateLendBorrowDto, RecordPaymentDto } from './dto/lend-borrow.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { LendBorrowStatus } from '@database/entities';

@ApiTags('Lend & Borrow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lend-borrow')
export class LendBorrowController {
  constructor(private readonly lendBorrowService: LendBorrowService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lend/borrow record' })
  @ApiResponse({ status: 201, description: 'Record created successfully' })
  create(@CurrentUser('id') userId: string, @Body() createDto: CreateLendBorrowDto) {
    return this.lendBorrowService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lend/borrow records' })
  findAll(@CurrentUser('id') userId: string, @Query('status') status?: LendBorrowStatus) {
    return this.lendBorrowService.findAll(userId, status);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get lend/borrow summary' })
  @ApiResponse({ status: 200, description: 'Returns summary with totals and net position' })
  getSummary(@CurrentUser('id') userId: string) {
    return this.lendBorrowService.getSummary(userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming due payments' })
  getUpcoming(@CurrentUser('id') userId: string) {
    return this.lendBorrowService.getUpcomingDue(userId);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue payments' })
  getOverdue(@CurrentUser('id') userId: string) {
    return this.lendBorrowService.getOverdue(userId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get records by type (lend or borrow)' })
  findByType(@CurrentUser('id') userId: string, @Param('type') type: string) {
    return this.lendBorrowService.findByType(userId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lend/borrow record by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.lendBorrowService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lend/borrow record' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateLendBorrowDto,
  ) {
    return this.lendBorrowService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lend/borrow record' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.lendBorrowService.remove(id, userId);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Record a payment' })
  @ApiResponse({ status: 200, description: 'Payment recorded, status updated' })
  recordPayment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() paymentDto: RecordPaymentDto,
  ) {
    return this.lendBorrowService.recordPayment(id, userId, paymentDto);
  }

  @Post(':id/settle')
  @ApiOperation({ summary: 'Mark as fully settled' })
  @ApiResponse({ status: 200, description: 'Marked as settled' })
  markAsSettled(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.lendBorrowService.markAsSettled(id, userId);
  }
}
