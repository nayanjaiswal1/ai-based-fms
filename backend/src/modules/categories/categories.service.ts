import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, IsNull, DataSource } from 'typeorm';
import { Category, CategoryType, Transaction } from '@database/entities';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: TreeRepository<Category>,
    private dataSource: DataSource,
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

  // NEW: Merge categories
  async merge(primaryId: string, secondaryIds: string[], userId: string) {
    const primary = await this.findOne(primaryId, userId);

    if (primary.isDefault) {
      throw new ForbiddenException('Cannot merge into default categories');
    }

    // Validate all secondary categories
    const secondaryCategories = await Promise.all(
      secondaryIds.map(id => this.findOne(id, userId))
    );

    // Check all categories belong to user
    for (const category of secondaryCategories) {
      if (category.isDefault) {
        throw new ForbiddenException('Cannot merge default categories');
      }
      if (category.id === primaryId) {
        throw new BadRequestException('Cannot merge a category with itself');
      }
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update all transactions pointing to secondary categories
      for (const secondary of secondaryCategories) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(Transaction)
          .set({ categoryId: primaryId })
          .where('categoryId = :categoryId', { categoryId: secondary.id })
          .execute();

        // Increment usage count
        primary.usageCount += secondary.usageCount;

        // Soft delete secondary category
        secondary.isActive = false;
        await queryRunner.manager.save(secondary);
      }

      await queryRunner.manager.save(primary);
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Successfully merged ${secondaryIds.length} categories into ${primary.name}`,
        primaryCategory: primary,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // NEW: Archive category
  async archive(id: string, userId: string) {
    const category = await this.findOne(id, userId);

    if (category.isDefault) {
      throw new ForbiddenException('Cannot archive default categories');
    }

    category.isArchived = true;
    return this.categoryRepository.save(category);
  }

  // NEW: Unarchive category
  async unarchive(id: string, userId: string) {
    const category = await this.findOne(id, userId);

    if (category.isDefault) {
      throw new ForbiddenException('Cannot unarchive default categories');
    }

    category.isArchived = false;
    return this.categoryRepository.save(category);
  }

  // NEW: Get usage statistics
  async getUsageStats(userId: string) {
    const categories = await this.findAll(userId);

    // Calculate usage count from transactions
    const stats = await Promise.all(
      categories.map(async (category) => {
        const transactionCount = await this.dataSource
          .getRepository(Transaction)
          .count({ where: { categoryId: category.id } });

        return {
          id: category.id,
          name: category.name,
          type: category.type,
          usageCount: transactionCount,
          isArchived: category.isArchived,
          createdAt: category.createdAt,
        };
      })
    );

    // Sort by usage count descending
    return stats.sort((a, b) => b.usageCount - a.usageCount);
  }

  // NEW: Get archived categories
  async getArchived(userId: string) {
    return this.categoryRepository.find({
      where: [
        { userId, isArchived: true, isActive: true },
      ],
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }
}
