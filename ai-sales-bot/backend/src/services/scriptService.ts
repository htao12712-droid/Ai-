import prisma from '../utils/database';
import { AppError } from '../middleware/error';
import { ScriptContent } from '../types';

export class ScriptService {
  async createScript(data: {
    name: string;
    description?: string;
    scenario: string;
    content: ScriptContent;
  }) {
    const script = await prisma.script.create({
      data: {
        name: data.name,
        description: data.description,
        scenario: data.scenario,
        content: data.content as any,
      },
    });

    await this.createScriptVersion(script.id, 1, data.content);

    return script;
  }

  async getScripts(scenario?: string, isActive?: boolean) {
    const where: any = {};

    if (scenario) {
      where.scenario = scenario;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const scripts = await prisma.script.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return scripts;
  }

  async getScriptById(id: string) {
    const script = await prisma.script.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!script) {
      throw new AppError('Script not found', 404);
    }

    return script;
  }

  async updateScript(id: string, data: {
    name?: string;
    description?: string;
    scenario?: string;
    content?: ScriptContent;
    isActive?: boolean;
  }) {
    let script = await prisma.script.findUnique({ where: { id } });

    if (!script) {
      throw new AppError('Script not found', 404);
    }

    if (data.content) {
      const latestVersion = await prisma.scriptVersion.findFirst({
        where: { scriptId: id },
        orderBy: { version: 'desc' },
      });

      const newVersion = (latestVersion?.version || 0) + 1;
      await this.createScriptVersion(id, newVersion, data.content);
    }

    script = await prisma.script.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        scenario: data.scenario,
        content: data.content as any,
        isActive: data.isActive,
      },
    });

    return script;
  }

  async deleteScript(id: string) {
    await prisma.script.delete({ where: { id } });
  }

  async createScriptVersion(scriptId: string, version: number, content: ScriptContent) {
    await prisma.scriptVersion.create({
      data: {
        scriptId,
        version,
        content: content as any,
      },
    });
  }

  async previewScript(scriptContent: ScriptContent, customerContext: Record<string, any>) {
    const conversation: Array<{ role: string; text: string }> = [];
    const startNode = scriptContent.nodes.find((n) => n.type === 'start');

    if (!startNode) {
      throw new AppError('Script must have a start node', 400);
    }

    let currentNode = startNode;
    const visited = new Set<string>();

    while (currentNode && visited.size < 10) {
      visited.add(currentNode.id);

      if (currentNode.content) {
        let content = currentNode.content;

        for (const [key, value] of Object.entries(customerContext)) {
          content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
        }

        conversation.push({ role: 'agent', text: content });
      }

      if (currentNode.type === 'end') {
        break;
      }

      if (currentNode.branches && currentNode.branches.length > 0) {
        currentNode = scriptContent.nodes.find((n) => n.id === currentNode.branches![0].nextNodeId);
      } else if (currentNode.nextNodeId) {
        currentNode = scriptContent.nodes.find((n) => n.id === currentNode.nextNodeId);
      } else {
        break;
      }
    }

    return { conversation };
  }

  async getScriptVersions(scriptId: string) {
    const versions = await prisma.scriptVersion.findMany({
      where: { scriptId },
      orderBy: { version: 'desc' },
    });

    return versions;
  }
}

export default new ScriptService();
