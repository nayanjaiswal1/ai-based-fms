import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from '@database/entities';
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto/investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
  ) {}

  async create(userId: string, createDto: CreateInvestmentDto) {
    const returns = createDto.currentValue - createDto.investedAmount;
    const returnPercentage = (returns / createDto.investedAmount) * 100;

    const investment = this.investmentRepository.create({
      ...createDto,
      userId,
      returns,
      returnPercentage: Number(returnPercentage.toFixed(2)),
    });

    return this.investmentRepository.save(investment);
  }

  async findAll(userId: string, isActive = true) {
    const where: any = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.investmentRepository.find({
      where,
      order: { investmentDate: 'DESC' },
    });
  }

  async findByType(userId: string, type: string) {
    return this.investmentRepository.find({
      where: { userId, type: type as any, isActive: true },
      order: { investmentDate: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const investment = await this.investmentRepository.findOne({
      where: { id, userId },
    });

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    return investment;
  }

  async update(id: string, userId: string, updateDto: UpdateInvestmentDto) {
    const investment = await this.findOne(id, userId);

    Object.assign(investment, updateDto);

    // Recalculate returns if current value changed
    if (updateDto.currentValue) {
      investment.returns = investment.currentValue - investment.investedAmount;
      investment.returnPercentage = Number(
        ((investment.returns / investment.investedAmount) * 100).toFixed(2),
      );
    }

    return this.investmentRepository.save(investment);
  }

  async remove(id: string, userId: string) {
    const investment = await this.findOne(id, userId);
    investment.isActive = false;
    return this.investmentRepository.save(investment);
  }

  async getPortfolioSummary(userId: string) {
    const investments = await this.findAll(userId, true);

    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.investedAmount), 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + Number(inv.currentValue), 0);
    const totalReturns = totalCurrent - totalInvested;
    const overallReturnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // Group by type
    const byType = investments.reduce((acc, inv) => {
      if (!acc[inv.type]) {
        acc[inv.type] = {
          type: inv.type,
          count: 0,
          invested: 0,
          current: 0,
          returns: 0,
        };
      }
      acc[inv.type].count++;
      acc[inv.type].invested += Number(inv.investedAmount);
      acc[inv.type].current += Number(inv.currentValue);
      acc[inv.type].returns += Number(inv.returns);
      return acc;
    }, {});

    const composition = Object.values(byType).map((item: any) => ({
      ...item,
      percentage: totalCurrent > 0 ? ((item.current / totalCurrent) * 100).toFixed(1) : 0,
    }));

    return {
      summary: {
        totalInvestments: investments.length,
        totalInvested: Number(totalInvested.toFixed(2)),
        totalCurrent: Number(totalCurrent.toFixed(2)),
        totalReturns: Number(totalReturns.toFixed(2)),
        overallReturnPercentage: Number(overallReturnPercentage.toFixed(2)),
      },
      composition,
      topPerformers: investments
        .sort((a, b) => b.returnPercentage - a.returnPercentage)
        .slice(0, 5)
        .map((inv) => ({
          id: inv.id,
          name: inv.name,
          type: inv.type,
          returnPercentage: inv.returnPercentage,
          returns: inv.returns,
        })),
    };
  }

  async getPerformanceMetrics(userId: string) {
    const investments = await this.findAll(userId, true);

    const profitable = investments.filter((inv) => inv.returns > 0);
    const losing = investments.filter((inv) => inv.returns < 0);

    return {
      profitableInvestments: profitable.length,
      losingInvestments: losing.length,
      averageReturn:
        investments.length > 0
          ? Number(
              (
                investments.reduce((sum, inv) => sum + inv.returnPercentage, 0) / investments.length
              ).toFixed(2),
            )
          : 0,
      bestPerformer:
        investments.length > 0
          ? investments.reduce((best, inv) =>
              inv.returnPercentage > best.returnPercentage ? inv : best,
            )
          : null,
      worstPerformer:
        investments.length > 0
          ? investments.reduce((worst, inv) =>
              inv.returnPercentage < worst.returnPercentage ? inv : worst,
            )
          : null,
    };
  }
}
