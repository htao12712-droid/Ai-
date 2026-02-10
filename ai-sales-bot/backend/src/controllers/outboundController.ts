import { Request, Response, NextFunction } from 'express';
import outboundService from '../services/outboundService';
import nlpService from '../services/nlpService';

export class OutboundController {
  async createCall(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId, customerId, scriptId } = req.body;
      const call = await outboundService.createCall(taskId, customerId, scriptId);
      res.status(201).json(call);
    } catch (error) {
      next(error);
    }
  }

  async getCall(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const call = await outboundService.getCall(id);
      res.json(call);
    } catch (error) {
      next(error);
    }
  }

  async getCalls(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId, page = '1', size = '10' } = req.query;
      const calls = await outboundService.getCalls(
        taskId as string,
        parseInt(page as string),
        parseInt(size as string)
      );
      res.json(calls);
    } catch (error) {
      next(error);
    }
  }

  async updateCallStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const call = await outboundService.updateCallStatus(id, status);
      res.json(call);
    } catch (error) {
      next(error);
    }
  }

  async addTranscript(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const transcript = req.body;
      const result = await outboundService.addTranscript(id, transcript);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async recognizeIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, context, scriptId } = req.body;
      const result = await nlpService.recognizeIntent(text, context, scriptId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async generateResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const { intent, entities, scriptId, context } = req.body;
      const result = await nlpService.generateResponse(intent, entities, scriptId, context);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async analyzeCustomerIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { transcript } = req.body;
      const result = await nlpService.analyzeCustomerIntent(id, transcript);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async extractFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { transcript, productId } = req.body;
      const result = await nlpService.extractFeedback(transcript, productId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new OutboundController();
