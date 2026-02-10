import { Request, Response, NextFunction } from 'express';
import scriptService from '../services/scriptService';

export class ScriptController {
  async createScript(req: Request, res: Response, next: NextFunction) {
    try {
      const script = await scriptService.createScript(req.body);
      res.status(201).json(script);
    } catch (error) {
      next(error);
    }
  }

  async getScripts(req: Request, res: Response, next: NextFunction) {
    try {
      const { scenario, isActive } = req.query;
      const scripts = await scriptService.getScripts(
        scenario as string,
        isActive !== undefined ? isActive === 'true' : undefined
      );
      res.json(scripts);
    } catch (error) {
      next(error);
    }
  }

  async getScriptById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const script = await scriptService.getScriptById(id);
      res.json(script);
    } catch (error) {
      next(error);
    }
  }

  async updateScript(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const script = await scriptService.updateScript(id, req.body);
      res.json(script);
    } catch (error) {
      next(error);
    }
  }

  async deleteScript(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await scriptService.deleteScript(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async previewScript(req: Request, res: Response, next: NextFunction) {
    try {
      const { scriptContent, customerContext } = req.body;
      const result = await scriptService.previewScript(scriptContent, customerContext);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getScriptVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const versions = await scriptService.getScriptVersions(id);
      res.json(versions);
    } catch (error) {
      next(error);
    }
  }
}

export default new ScriptController();
