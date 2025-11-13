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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { CategoryType } from '@database/entities';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  create(@CurrentUser('id') userId: string, @Body() createDto: CreateCategoryDto) {
    return this.categoriesService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('includeDefault') includeDefault?: boolean,
  ) {
    return this.categoriesService.findAll(userId, includeDefault !== false);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get categories as a tree structure' })
  findTree(@CurrentUser('id') userId: string) {
    return this.categoriesService.findTree(userId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get categories by type' })
  findByType(@CurrentUser('id') userId: string, @Param('type') type: CategoryType) {
    return this.categoriesService.findByType(userId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoriesService.findOne(id, userId);
  }

  @Get(':id/descendants')
  @ApiOperation({ summary: 'Get all descendant categories' })
  getDescendants(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoriesService.getDescendants(id, userId);
  }

  @Get(':id/ancestors')
  @ApiOperation({ summary: 'Get all ancestor categories' })
  getAncestors(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoriesService.getAncestors(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoriesService.remove(id, userId);
  }

  // NEW: Merge categories
  @Post('merge')
  @ApiOperation({ summary: 'Merge multiple categories into one' })
  @ApiResponse({ status: 200, description: 'Categories merged successfully' })
  merge(
    @CurrentUser('id') userId: string,
    @Body() mergeDto: { primaryId: string; secondaryIds: string[] },
  ) {
    return this.categoriesService.merge(mergeDto.primaryId, mergeDto.secondaryIds, userId);
  }

  // NEW: Archive category
  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a category' })
  archive(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoriesService.archive(id, userId);
  }

  // NEW: Unarchive category
  @Post(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a category' })
  unarchive(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoriesService.unarchive(id, userId);
  }

  // NEW: Get usage statistics
  @Get('stats/usage')
  @ApiOperation({ summary: 'Get category usage statistics' })
  getUsageStats(@CurrentUser('id') userId: string) {
    return this.categoriesService.getUsageStats(userId);
  }

  // NEW: Get archived categories
  @Get('archived/list')
  @ApiOperation({ summary: 'Get all archived categories' })
  getArchived(@CurrentUser('id') userId: string) {
    return this.categoriesService.getArchived(userId);
  }
}
