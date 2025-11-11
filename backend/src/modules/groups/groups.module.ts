import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group, GroupMember, GroupTransaction } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember, GroupTransaction])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
