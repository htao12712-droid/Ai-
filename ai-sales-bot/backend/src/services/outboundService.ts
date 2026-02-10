import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/database';
import { AppError } from '../middleware/error';
import { CallTranscript, CallStatus, IntentResult, IntentAnalysis, Feedback } from '../types';

export class OutboundService {
  private activeCalls = new Map<string, any>();

  async createCall(taskId: string, customerId: string, scriptId: string) {
    const call = await prisma.call.create({
      data: {
        taskId,
        customerId,
        scriptId,
        status: 'calling',
        startTime: new Date(),
      },
      include: {
        customer: true,
        task: {
          include: {
            script: true,
          },
        },
      },
    });

    return call;
  }

  async getCall(callId: string) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        customer: true,
        task: true,
        transcripts: {
          orderBy: { timestamp: 'asc' },
        },
        intentAnalysis: true,
        feedbacks: true,
      },
    });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    return call;
  }

  async getCalls(taskId: string, page = 1, size = 10) {
    const skip = (page - 1) * size;

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where: { taskId },
        include: {
          customer: true,
          intentAnalysis: true,
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: size,
      }),
      prisma.call.count({ where: { taskId } }),
    ]);

    return { calls, total, page, size, totalPages: Math.ceil(total / size) };
  }

  async updateCallStatus(callId: string, status: CallStatus) {
    const call = await prisma.call.findUnique({ where: { id: callId } });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    if (!this.isValidStatusTransition(call.status as CallStatus, status)) {
      throw new AppError(`Invalid status transition from ${call.status} to ${status}`, 400);
    }

    const updatedCall = await prisma.call.update({
      where: { id: callId },
      data: { status },
    });

    if (status === 'ended' || status === 'failed') {
      await this.finalizeCall(callId);
    }

    return updatedCall;
  }

  async addTranscript(callId: string, transcript: CallTranscript) {
    const callTranscript = await prisma.transcript.create({
      data: {
        callId,
        speaker: transcript.speaker,
        content: transcript.text,
        timestamp: transcript.timestamp,
        confidence: transcript.confidence,
      },
    });

    return callTranscript;
  }

  async analyzeIntent(callId: string, intentResult: IntentResult) {
    const call = await prisma.call.findUnique({ where: { id: callId } });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    const score = this.calculateIntentScore(intentResult);
    const level = this.getIntentLevel(score);

    const analysis = await prisma.intentAnalysis.create({
      data: {
        callId,
        score,
        level,
        reasons: intentResult.suggestions as any,
        suggestions: intentResult.suggestions as any,
      },
    });

    return analysis;
  }

  async addFeedback(callId: string, feedback: Feedback) {
    const callFeedback = await prisma.feedback.create({
      data: {
        callId,
        type: feedback.type,
        content: feedback.content,
        sentiment: feedback.sentiment,
        createdAt: feedback.timestamp,
      },
    });

    return callFeedback;
  }

  async finalizeCall(callId: string) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        transcripts: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!call) {
      throw new AppError('Call not found', 404);
    }

    if (!call.endTime) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - call.startTime.getTime()) / 1000);

      await prisma.call.update({
        where: { id: callId },
        data: {
          endTime,
          duration,
        },
      });
    }
  }

  private isValidStatusTransition(currentStatus: CallStatus, newStatus: CallStatus): boolean {
    const validTransitions: Record<CallStatus, CallStatus[]> = {
      calling: ['connected', 'failed'],
      connected: ['ended', 'failed'],
      ended: [],
      failed: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private calculateIntentScore(intentResult: IntentResult): number {
    let score = 0;

    if (intentResult.confidence > 0.8) {
      score += 30;
    } else if (intentResult.confidence > 0.5) {
      score += 20;
    }

    const buyingIntents = ['buy', 'purchase', 'order', 'want', 'interested'];
    if (buyingIntents.some((intent) => intentResult.intent.toLowerCase().includes(intent))) {
      score += 50;
    }

    const questionIntents = ['question', 'inquire', 'ask'];
    if (questionIntents.some((intent) => intentResult.intent.toLowerCase().includes(intent))) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private getIntentLevel(score: number): string {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 1) return 'low';
    return 'none';
  }
}

export default new OutboundService();
