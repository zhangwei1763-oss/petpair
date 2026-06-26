import type { PetProfile } from '../types';

const AI_BASE_URL = '/api/ai';
const AI_MODEL = 'gpt-5.5';

export interface AIPersonalityAnalysis {
  personalityTags: string[];
  energyLevel: 'low' | 'medium' | 'high';
  suggestedActivities: string[];
  compatibleTypes: string[];
  description: string;
  confidence: number;
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * 调用 AI API 进行通用对话
 */
export async function chatWithAI(messages: AIChatMessage[]): Promise<string> {
  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API 请求失败: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * 分析宠物照片，生成性格特征
 */
export async function analyzePetPersonality(
  imageBase64: string,
  petName: string,
  species: 'dog' | 'cat' | 'other'
): Promise<AIPersonalityAnalysis> {
  const speciesText = species === 'dog' ? '狗' : species === 'cat' ? '猫' : '宠物';

  const messages: AIChatMessage[] = [
    {
      role: 'system',
      content: `你是一位专业的宠物行为分析师，擅长通过观察宠物的照片来分析其性格特征。
请根据照片中的宠物表情、姿态、毛色、体型等特征，给出专业的性格分析。
输出必须是严格的 JSON 格式，不要包含任何其他文字。`,
    },
    {
      role: 'user',
      content: `请分析这只${speciesText}的性格特征。

宠物名字：${petName}

请输出以下格式的 JSON：
{
  "personalityTags": ["活泼", "友好", "好奇"],
  "energyLevel": "high",
  "suggestedActivities": ["跑步", "玩球", "社交"],
  "compatibleTypes": ["大型犬", "活泼的狗狗"],
  "description": "这是一只非常活泼友好的狗狗...",
  "confidence": 0.85
}

注意：
- personalityTags: 3-5 个性格标签（中文）
- energyLevel: 只能是 "low", "medium", "high" 之一
- suggestedActivities: 3-5 个推荐活动（中文）
- compatibleTypes: 2-4 个适合的玩伴类型（中文）
- description: 100-200 字的性格描述（中文）
- confidence: 0-1 之间的置信度`,
    },
  ];

  // 如果有图片，添加图片内容
  if (imageBase64) {
    messages[1].content = [
      {
        type: 'text',
        text: messages[1].content,
      },
      {
        type: 'image_url',
        image_url: {
          url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
        },
      },
    ] as any;
  }

  try {
    const response = await chatWithAI(messages);

    // 提取 JSON 部分
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 返回格式错误');
    }

    const analysis = JSON.parse(jsonMatch[0]) as AIPersonalityAnalysis;

    // 验证返回数据
    if (!analysis.personalityTags || !analysis.energyLevel) {
      throw new Error('AI 返回数据不完整');
    }

    return analysis;
  } catch (error) {
    console.error('AI 分析失败:', error);
    // 返回默认分析
    return getDefaultAnalysis(species);
  }
}

/**
 * 生成匹配解释
 */
export async function generateMatchExplanation(
  pet1: PetProfile,
  pet2: PetProfile,
  matchScore: number
): Promise<string> {
  const messages: AIChatMessage[] = [
    {
      role: 'system',
      content: '你是一位宠物配对专家，擅长分析两只宠物的匹配度并给出温馨有趣的解释。',
    },
    {
      role: 'user',
      content: `请为以下两只宠物生成匹配解释：

宠物1：${pet1.name}，${pet1.breed}，${pet1.gender === 'male' ? '公' : '母'}，${pet1.age}岁
性格：${pet1.personalityTags.join('、')}
能量水平：${pet1.energyLevel}
喜欢：${pet1.activityPreferences?.join('、') || '未知'}

宠物2：${pet2.name}，${pet2.breed}，${pet2.gender === 'male' ? '公' : '母'}，${pet2.age}岁
性格：${pet2.personalityTags.join('、')}
能量水平：${pet2.energyLevel}
喜欢：${pet2.activityPreferences?.join('、') || '未知'}

匹配分数：${matchScore}分

请生成一段 50-100 字的温馨解释，说明为什么它们很配，并推荐一个适合它们一起做的活动。语气要友好、有趣。`,
    },
  ];

  try {
    return await chatWithAI(messages);
  } catch (error) {
    return `${pet1.name}和${pet2.name}的匹配度很高！它们都是活泼的性格，适合一起玩耍。`;
  }
}

/**
 * AI 养宠助手对话
 */
export async function askPetAssistant(
  question: string,
  petContext?: PetProfile
): Promise<string> {
  const messages: AIChatMessage[] = [
    {
      role: 'system',
      content: `你是一位专业的宠物养护顾问，擅长回答关于宠物训练、健康、饮食、行为等方面的问题。
请用友好、专业的语气回答，回答要简洁实用，控制在 150 字以内。`,
    },
  ];

  if (petContext) {
    messages.push({
      role: 'system',
      content: `当前宠物信息：${petContext.name}，${petContext.breed}，${petContext.age}岁，${petContext.gender === 'male' ? '公' : '母'}。`,
    });
  }

  messages.push({
    role: 'user',
    content: question,
  });

  try {
    return await chatWithAI(messages);
  } catch (error) {
    return '抱歉，AI 助手暂时无法回答，请稍后再试。';
  }
}

/**
 * 获取默认性格分析
 */
function getDefaultAnalysis(species: 'dog' | 'cat' | 'other'): AIPersonalityAnalysis {
  if (species === 'dog') {
    return {
      personalityTags: ['活泼', '友好', '好奇'],
      energyLevel: 'medium',
      suggestedActivities: ['散步', '玩球', '社交'],
      compatibleTypes: ['中型犬', '活泼的狗狗'],
      description: '这是一只活泼友好的狗狗，喜欢与人互动，对新鲜事物充满好奇。适合有规律的运动和社交活动。',
      confidence: 0.6,
    };
  } else {
    return {
      personalityTags: ['独立', '温顺', '警觉'],
      energyLevel: 'low',
      suggestedActivities: ['室内游戏', '攀爬', '观察'],
      compatibleTypes: ['安静的猫咪', '温顺的狗狗'],
      description: '这是一只性格独立的猫咪，喜欢安静的环境，但也享受与主人的亲密时光。适合室内活动和观察类游戏。',
      confidence: 0.6,
    };
  }
}

/**
 * AI 聊天助手 —— 爪爪小助手（PawPal）
 * 根据双方宠物信息、聊天记录等综合分析，给出活动建议
 */
export async function summonPawPal(context: {
  myPet: PetProfile;
  otherPet: PetProfile;
  chatHistory: string[];
  userQuestion?: string;
}): Promise<string> {
  const { myPet, otherPet, chatHistory, userQuestion } = context;

  const tagMap: Record<string, string> = {
    lively: '活泼', gentle: '温顺', timid: '胆小', independent: '独立', clingy: '粘人',
  };
  const energyMap: Record<string, string> = { low: '低', medium: '中等', high: '高' };
  const tagStr = (tags: string[]) => tags.map((t) => tagMap[t] || t).join('、');

  const chatSummary = chatHistory.length > 0
    ? chatHistory.slice(-10).join('\n')
    : '（暂无聊天记录）';

  const messages: AIChatMessage[] = [
    {
      role: 'system',
      content: `你是"爪爪小助手"，PetPair 宠物社交平台的智能约会策划师。你的任务是帮助两位宠物主人策划一次愉快的宠物约会。

你的特点：
- 语气亲切可爱，像一个热心的朋友
- 善于根据宠物性格和主人需求推荐活动
- 考虑实际因素（天气、时间、距离、安全等）
- 回答简洁有条理，控制在 200 字以内

请用以下格式组织你的建议：
1. 推荐活动（1-2个）
2. 推荐地点
3. 建议时间
4. 温馨提示（安全/注意事项）`,
    },
    {
      role: 'user',
      content: `请帮我策划一次宠物约会！

【我的宠物】
名字：${myPet.name}
品种：${myPet.breed}
性别：${myPet.gender === 'male' ? '公' : '母'}
年龄：${myPet.age}岁
体型：${myPet.size}
性格：${tagStr(myPet.personalityTags)}
能量水平：${energyMap[myPet.energyLevel]}
喜欢：${myPet.activityPreferences?.join('、') || '未知'}

【对方的宠物】
名字：${otherPet.name}
品种：${otherPet.breed}
性别：${otherPet.gender === 'male' ? '公' : '母'}
年龄：${otherPet.age}岁
体型：${otherPet.size}
性格：${tagStr(otherPet.personalityTags)}
能量水平：${energyMap[otherPet.energyLevel]}
喜欢：${otherPet.activityPreferences?.join('、') || '未知'}

【聊天记录】
${chatSummary}

${userQuestion ? `【用户补充问题】\n${userQuestion}` : ''}

请给出具体的活动建议！`,
    },
  ];

  try {
    return await chatWithAI(messages);
  } catch {
    return `🐾 爪爪小助手暂时走神了...

不过根据${myPet.name}和${otherPet.name}的性格，推荐你们一起去附近的公园散步，上午10点是个不错的时间哦！记得带上水壶和拾便袋~`;
  }
}

/**
 * 检查 AI API 是否配置
 */
export function isAIConfigured(): boolean {
  return true; // 通过服务器端代理，始终可用
}
