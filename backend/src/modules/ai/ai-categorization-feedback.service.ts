import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiCategorizationFeedback, FeedbackType } from '@database/entities';

export interface SubmitFeedbackDto {
  transactionId: string;
  transactionDescription: string;
  suggestedCategoryId: string | null;
  correctCategoryId: string;
  feedbackType: FeedbackType;
  originalConfidence?: number;
  alternativeSuggestions?: { categoryId: string; confidence: number }[];
}

@Injectable()
export class AiCategorizationFeedbackService {
  constructor(
    @InjectRepository(AiCategorizationFeedback)
    private feedbackRepository: Repository<AiCategorizationFeedback>,
  ) {}

  async submitFeedback(userId: string, dto: SubmitFeedbackDto) {
    const feedback = this.feedbackRepository.create({
      userId,
      ...dto,
    });

    return this.feedbackRepository.save(feedback);
  }

  async getUserFeedback(userId: string, limit: number = 100) {
    return this.feedbackRepository.find({
      where: { userId },
      relations: ['suggestedCategory', 'correctCategory'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getFeedbackStats(userId: string) {
    const allFeedback = await this.feedbackRepository.find({
      where: { userId },
    });

    const total = allFeedback.length;
    const accepted = allFeedback.filter(f => f.feedbackType === FeedbackType.ACCEPT).length;
    const rejected = allFeedback.filter(f => f.feedbackType === FeedbackType.REJECT).length;
    const corrected = allFeedback.filter(f => f.feedbackType === FeedbackType.CORRECT).length;

    // Calculate accuracy
    const accuracy = total > 0 ? Math.round((accepted / total) * 100) : 0;

    // Category-specific accuracy
    const categoryAccuracy = new Map<string, { correct: number; total: number }>();

    for (const feedback of allFeedback) {
      const categoryId = feedback.suggestedCategoryId;
      if (!categoryId) continue;

      if (!categoryAccuracy.has(categoryId)) {
        categoryAccuracy.set(categoryId, { correct: 0, total: 0 });
      }

      const stats = categoryAccuracy.get(categoryId)!;
      stats.total++;
      if (feedback.feedbackType === FeedbackType.ACCEPT) {
        stats.correct++;
      }
    }

    const categoryStats = Array.from(categoryAccuracy.entries()).map(([categoryId, stats]) => ({
      categoryId,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      totalSuggestions: stats.total,
    }));

    return {
      total,
      accepted,
      rejected,
      corrected,
      accuracy,
      categoryStats: categoryStats.sort((a, b) => b.accuracy - a.accuracy),
    };
  }

  // Get patterns from user feedback to improve future categorizations
  async getCategorizationPatterns(userId: string) {
    const feedback = await this.feedbackRepository.find({
      where: { userId },
      relations: ['correctCategory'],
    });

    // Build patterns: description keywords -> category
    const patterns = new Map<string, Map<string, number>>();

    for (const item of feedback) {
      if (!item.correctCategoryId) continue;

      const words = item.transactionDescription
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3); // Only consider words longer than 3 chars

      for (const word of words) {
        if (!patterns.has(word)) {
          patterns.set(word, new Map());
        }

        const categoryMap = patterns.get(word)!;
        const count = categoryMap.get(item.correctCategoryId) || 0;
        categoryMap.set(item.correctCategoryId, count + 1);
      }
    }

    // Convert to array of patterns
    const patternArray = [];
    for (const [keyword, categoryMap] of patterns.entries()) {
      const categories = Array.from(categoryMap.entries())
        .map(([categoryId, count]) => ({ categoryId, count }))
        .sort((a, b) => b.count - a.count);

      if (categories.length > 0 && categories[0].count >= 2) {
        // Only include patterns that appear at least twice
        patternArray.push({
          keyword,
          mostLikelyCategory: categories[0].categoryId,
          occurrences: categories[0].count,
          alternatives: categories.slice(1, 3),
        });
      }
    }

    return patternArray.sort((a, b) => b.occurrences - a.occurrences);
  }
}
