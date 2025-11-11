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
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  create(@CurrentUser('id') userId: string, @Body() createDto: CreateTagDto) {
    return this.tagsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  findAll(@CurrentUser('id') userId: string, @Query('includeDefault') includeDefault?: boolean) {
    return this.tagsService.findAll(userId, includeDefault !== false);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tags' })
  search(@CurrentUser('id') userId: string, @Query('q') query: string) {
    return this.tagsService.search(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.tagsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.tagsService.remove(id, userId);
  }
}
