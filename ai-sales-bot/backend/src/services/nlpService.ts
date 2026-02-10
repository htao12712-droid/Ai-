import { IntentResult, Entity, ConversationContext, CallTranscript } from '../types';
import { ScriptContent } from '../types';

export class NLPService {
  private intents = {
    greeting: ['你好', '您好', '嗨', 'hello', 'hi'],
    interest: ['感兴趣', '想了解', '感兴趣', '有兴趣', '感兴趣', '想买', '想购买', 'purchase', 'interested', 'want'],
    question: ['问题', '问', '怎么', '如何', '什么', '多少', 'price', 'cost', 'how', 'what'],
    objection: ['太贵', '不需要', '考虑一下', '再看看', '没时间', 'busy', 'expensive', 'not now'],
    appointment: ['明天', '下周', '几点', '什么时候', '时间', 'schedule', 'time', 'when'],
    rejection: ['不需要', '不想', '不感兴趣', 'no', 'not interested', 'dont want'],
    farewell: ['再见', '拜拜', '挂了', 'bye', 'goodbye'],
  };

  private entityPatterns = {
    price: /(\d+元|\$\d+|\d+块)/g,
    quantity: /(\d+个|\d+件|\d+台)/g,
    time: /(明天|后天|下周|周[一二三四五六]|今天)/g,
  };

  async recognizeIntent(text: string, context: ConversationContext, scriptId: string): Promise<IntentResult> {
    let matchedIntent = 'unknown';
    let maxMatches = 0;

    for (const [intent, patterns] of Object.entries(this.intents)) {
      const matches = patterns.filter((pattern) => text.toLowerCase().includes(pattern.toLowerCase()));
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        matchedIntent = intent;
      }
    }

    const entities = this.extractEntities(text);
    const confidence = this.calculateConfidence(matchedIntent, text, entities);
    const suggestions = this.generateSuggestions(matchedIntent, entities);

    return {
      intent: matchedIntent,
      confidence,
      entities,
      suggestions,
    };
  }

  async generateResponse(
    intent: string,
    entities: Entity[],
    scriptId: string,
    context: ConversationContext
  ): Promise<{
    response: string;
    variables: Record<string, any>;
    nextAction?: 'transfer_to_human' | 'schedule_callback' | 'end_call';
  }> {
    const responses: Record<string, string> = {
      greeting: '您好,我是公司的智能客服,很高兴为您服务。今天有什么可以帮您的吗?',
      interest: '很高兴您对我们产品感兴趣。请问您想了解哪方面的信息呢?',
      question: '好的,我来为您解答。请问您具体想了解什么呢?',
      objection: '我理解您的顾虑。我们的产品确实有一些特别之处,让我为您介绍一下。',
      appointment: '好的,我们可以为您安排合适的时间。请问您方便的时间是?',
      rejection: '好的,感谢您抽出时间接听电话。如果以后有需要,欢迎随时联系我们。',
      farewell: '感谢您的来电,祝您生活愉快,再见!',
      unknown: '抱歉,我没有完全理解您的意思。能请您再说一遍吗?',
    };

    let response = responses[intent] || responses.unknown;
    const variables: Record<string, any> = {};

    for (const entity of entities) {
      variables[entity.type] = entity.value;
    }

    if (intent === 'rejection' || intent === 'farewell') {
      return { response, variables, nextAction: 'end_call' };
    }

    if (intent === 'unknown' && context.turnCount > 5) {
      response = '为了更好地为您服务,我帮您转接到人工客服,可以吗?';
      return { response, variables, nextAction: 'transfer_to_human' };
    }

    return { response, variables };
  }

  async analyzeCustomerIntent(callId: string, transcript: CallTranscript[]): Promise<{
    intentScore: number;
    level: 'high' | 'medium' | 'low' | 'none';
    reasons: string[];
    suggestions: string[];
  }> {
    let score = 0;
    const reasons: string[] = [];
    const suggestions: string[] = [];

    const customerTurns = transcript.filter((t) => t.speaker === 'customer');

    if (customerTurns.length > 3) {
      score += 20;
      reasons.push('客户积极参与对话');
    }

    const hasInterest = customerTurns.some((turn) =>
      this.intents.interest.some((i) => turn.text.includes(i))
    );
    if (hasInterest) {
      score += 40;
      reasons.push('客户表达了购买意向');
      suggestions.push('建议尽快安排人工跟进');
    }

    const hasQuestions = customerTurns.some((turn) =>
      this.intents.question.some((i) => turn.text.includes(i))
    );
    if (hasQuestions) {
      score += 20;
      reasons.push('客户主动提问');
    }

    const hasRejection = customerTurns.some((turn) =>
      this.intents.rejection.some((i) => turn.text.includes(i))
    );
    if (hasRejection) {
      score = 0;
      reasons.push('客户明确拒绝');
    }

    const level = this.getIntentLevel(score);

    if (level === 'high') {
      suggestions.push('标记为高意向客户,优先跟进');
    } else if (level === 'medium') {
      suggestions.push('持续关注,定期回访');
    }

    return { intentScore: score, level, reasons, suggestions };
  }

  async extractFeedback(transcript: CallTranscript[], productId?: string): Promise<{
    feedbacks: Array<{ type: string; content: string; sentiment: string; timestamp: Date }>;
    sentiment: 'positive' | 'negative' | 'neutral';
  }> {
    const feedbacks: Array<{ type: string; content: string; sentiment: string; timestamp: Date }> = [];

    const customerTurns = transcript.filter((t) => t.speaker === 'customer');

    for (const turn of customerTurns) {
      if (turn.text.includes('好') || turn.text.includes('满意') || turn.text.includes('不错')) {
        feedbacks.push({
          type: 'service',
          content: turn.text,
          sentiment: 'positive',
          timestamp: turn.timestamp,
        });
      }

      if (turn.text.includes('贵') || turn.text.includes('不满意') || turn.text.includes('差')) {
        feedbacks.push({
          type: 'price',
          content: turn.text,
          sentiment: 'negative',
          timestamp: turn.timestamp,
        });
      }
    }

    const positiveCount = feedbacks.filter((f) => f.sentiment === 'positive').length;
    const negativeCount = feedbacks.filter((f) => f.sentiment === 'negative').length;
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    }

    return { feedbacks, sentiment };
  }

  private extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];

    for (const [type, pattern] of Object.entries(this.entityPatterns)) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0]) {
          entities.push({
            type,
            value: match[0],
            confidence: 0.8,
            position: {
              start: match.index || 0,
              end: (match.index || 0) + match[0].length,
            },
          });
        }
      }
    }

    return entities;
  }

  private calculateConfidence(intent: string, text: string, entities: Entity[]): number {
    let confidence = 0.5;

    if (intent !== 'unknown') {
      confidence += 0.2;
    }

    if (entities.length > 0) {
      confidence += 0.2;
    }

    if (text.length > 10) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private getIntentLevel(score: number): 'high' | 'medium' | 'low' | 'none' {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 1) return 'low';
    return 'none';
  }

  private generateSuggestions(intent: string, entities: Entity[]): string[] {
    const suggestions: string[] = [];

    if (intent === 'interest') {
      suggestions.push('客户对产品感兴趣,继续介绍产品优势');
    }

    if (intent === 'question') {
      suggestions.push('客户有疑问,耐心解答');
    }

    if (intent === 'objection') {
      suggestions.push('客户有顾虑,针对性回应');
    }

    const hasPriceEntity = entities.some((e) => e.type === 'price');
    if (hasPriceEntity) {
      suggestions.push('客户关注价格,强调性价比');
    }

    return suggestions;
  }
}

export default new NLPService();
