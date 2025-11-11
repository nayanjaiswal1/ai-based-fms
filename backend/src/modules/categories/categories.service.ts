import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, IsNull } from 'typeorm';
import { Category, CategoryType } from '@database/entities';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: TreeRepository<Category>,
  ) {}

  async create(userId: string, createDto: CreateCategoryDto) {
    // Check if category already exists for this user
    const existing = await this.categoryRepository.findOne({
      where: {
        name: createDto.name,
        userId,
        isActive: true,
      },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepository.create({
      ...createDto,
      userId,
    });

    if (createDto.parentId) {
      const parent = await this.findOne(createDto.parentId, userId);
      category.parent = parent;
    }

    return this.categoryRepository.save(category);
  }

  async findAll(userId: string, includeDefault = true) {
    const where: any = { isActive: true };

    if (includeDefault) {
      // Include both user's custom categories and default categories
      where.userId = [userId, IsNull()];
    } else {
      where.userId = userId;
    }

    return this.categoryRepository.find({
      where,
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  async findTree(userId: string) {
    const categories = await this.findAll(userId);
    return this.categoryRepository.buildTrees(categories);
  }

  async findByType(userId: string, type: CategoryType) {
    return this.categoryRepository.find({
      where: [
        { userId, type, isActive: true },
        { userId: IsNull(), type, isActive: true, isDefault: true },
      ],
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check ownership - user can access their own categories or default categories
    if (category.userId && category.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }

    return category;
  }

  async update(id: string, userId: string, updateDto: UpdateCategoryDto) {
    const category = await this.findOne(id, userId);

    // Cannot modify default categories
    if (category.isDefault) {
      throw new ForbiddenException('Cannot modify default categories');
    }

    if (updateDto.parentId) {
      const parent = await this.findOne(updateDto.parentId, userId);
      category.parent = parent;
    }

    Object.assign(category, updateDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string, userId: string) {
    const category = await this.findOne(id, userId);

    if (category.isDefault) {
      throw new ForbiddenException('Cannot delete default categories');
    }

    // Soft delete
    category.isActive = false;
    return this.categoryRepository.save(category);
  }

  async getDescendants(id: string, userId: string) {
    const category = await this.findOne(id, userId);
    return this.categoryRepository.findDescendants(category);
  }

  async getAncestors(id: string, userId: string) {
    const category = await this.findOne(id, userId);
    return this.categoryRepository.findAncestors(category);
  }
}
