import { Injectable, NotFoundException, ForbiddenException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupComment, GroupMember } from '@database/entities';
import { CreateGroupCommentDto, UpdateGroupCommentDto } from './dto/group-comment.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class GroupCommentsService {
  constructor(
    @InjectRepository(GroupComment)
    private commentRepository: Repository<GroupComment>,
    @InjectRepository(GroupMember)
    private memberRepository: Repository<GroupMember>,
    @Optional() private notificationsGateway: NotificationsGateway,
  ) {}

  // Helper method to safely broadcast events when WebSocket is enabled
  private async broadcastGroupEvent(groupId: string, event: string, data: any) {
    if (this.notificationsGateway) {
      await this.broadcastGroupEvent(groupId, event, data);
    }
  }

  async create(groupId: string, userId: string, createDto: CreateGroupCommentDto) {
    // Check if user is a member of the group
    await this.checkMemberAccess(groupId, userId);

    const comment = this.commentRepository.create({
      ...createDto,
      groupId,
      userId,
    });

    const saved = await this.commentRepository.save(comment);

    // Broadcast comment to all group members
    await this.broadcastGroupEvent(groupId, 'comment:created', {
      comment: saved,
      userId,
      timestamp: new Date().toISOString(),
    });

    return this.findOne(saved.id);
  }

  async findAll(groupId: string, userId: string, transactionId?: string) {
    await this.checkMemberAccess(groupId, userId);

    const where: any = { groupId, isDeleted: false };
    if (transactionId) {
      where.transactionId = transactionId;
    }

    return this.commentRepository.find({
      where,
      relations: ['user', 'parentComment'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['user', 'parentComment'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: string, userId: string, updateDto: UpdateGroupCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = updateDto.content;
    comment.isEdited = true;
    const updated = await this.commentRepository.save(comment);

    // Broadcast update
    await this.broadcastGroupEvent(comment.groupId, 'comment:updated', {
      comment: updated,
      userId,
      timestamp: new Date().toISOString(),
    });

    return this.findOne(updated.id);
  }

  async remove(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is the comment author or group admin
    const member = await this.memberRepository.findOne({
      where: { groupId: comment.groupId, userId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    if (comment.userId !== userId && member.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own comments or be a group admin');
    }

    comment.isDeleted = true;
    await this.commentRepository.save(comment);

    // Broadcast deletion
    await this.broadcastGroupEvent(comment.groupId, 'comment:deleted', {
      commentId: id,
      userId,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'Comment deleted successfully' };
  }

  private async checkMemberAccess(groupId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { groupId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return member;
  }
}
