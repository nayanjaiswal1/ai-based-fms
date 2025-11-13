import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tag } from '@database/entities';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(userId: string, createDto: CreateTagDto) {
    // Check if tag already exists for this user
    const existing = await this.tagRepository.findOne({
      where: {
        name: createDto.name,
        userId,
      },
    });

    if (existing) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = this.tagRepository.create({
      ...createDto,
      userId,
    });

    return this.tagRepository.save(tag);
  }

  async findAll(userId: string, includeDefault = true) {
    if (includeDefault) {
      // Include both user's custom tags and default tags
      // Use query builder to properly handle OR condition with IsNull
      return this.tagRepository
        .createQueryBuilder('tag')
        .where('(tag.userId = :userId OR tag.userId IS NULL)', { userId })
        .orderBy('tag.name', 'ASC')
        .getMany();
    } else {
      // Only user's custom tags
      return this.tagRepository.find({
        where: { userId },
        order: { name: 'ASC' },
      });
    }
  }

  async findOne(id: string, userId: string) {
    const tag = await this.tagRepository.findOne({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check ownership - user can access their own tags or default tags
    if (tag.userId && tag.userId !== userId) {
      throw new ForbiddenException('You do not have access to this tag');
    }

    return tag;
  }

  async update(id: string, userId: string, updateDto: UpdateTagDto) {
    const tag = await this.findOne(id, userId);

    // Cannot modify default tags
    if (tag.isDefault) {
      throw new ForbiddenException('Cannot modify default tags');
    }

    Object.assign(tag, updateDto);
    return this.tagRepository.save(tag);
  }

  async remove(id: string, userId: string) {
    const tag = await this.findOne(id, userId);

    if (tag.isDefault) {
      throw new ForbiddenException('Cannot delete default tags');
    }

    return this.tagRepository.remove(tag);
  }

  async search(userId: string, query: string) {
    return this.tagRepository
      .createQueryBuilder('tag')
      .where('(tag.userId = :userId OR tag.userId IS NULL)')
      .andWhere('LOWER(tag.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .setParameter('userId', userId)
      .orderBy('tag.name', 'ASC')
      .getMany();
  }
}
