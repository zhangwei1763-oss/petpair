import type {
  PetProfile,
  SizeType,
  PersonalityTag,
  EnergyLevel,
  Review,
} from '../types';

/**
 * 体型等级映射，用于计算体型差距
 */
const SIZE_ORDER: Record<SizeType, number> = {
  small: 0,
  medium: 1,
  large: 2,
  giant: 3,
};

/**
 * 能量等级映射，用于计算能量差距
 */
const ENERGY_ORDER: Record<EnergyLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

/**
 * 性格冲突对：lively + timid 互相冲突
 */
const PERSONALITY_CONFLICTS: [PersonalityTag, PersonalityTag][] = [
  ['lively', 'timid'],
];

/**
 * 性格互补对：timid + gentle 互补
 */
const PERSONALITY_COMPLEMENTS: [PersonalityTag, PersonalityTag][] = [
  ['timid', 'gentle'],
];

/**
 * 判断两个标签是否构成冲突关系
 */
function hasConflict(tagsA: PersonalityTag[], tagsB: PersonalityTag[]): boolean {
  for (const [a, b] of PERSONALITY_CONFLICTS) {
    if (
      (tagsA.includes(a) && tagsB.includes(b)) ||
      (tagsA.includes(b) && tagsB.includes(a))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * 判断两个标签是否构成互补关系
 */
function hasComplement(tagsA: PersonalityTag[], tagsB: PersonalityTag[]): boolean {
  for (const [a, b] of PERSONALITY_COMPLEMENTS) {
    if (
      (tagsA.includes(a) && tagsB.includes(b)) ||
      (tagsA.includes(b) && tagsB.includes(a))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * 计算两只宠物之间的匹配分数
 * @param myPet 当前用户的宠物
 * @param otherPet 对方的宠物
 * @param distanceKm 两只宠物之间的距离（公里）
 * @returns 匹配分数（0-100）和匹配原因列表
 */
export function calculateMatchScore(
  myPet: PetProfile,
  otherPet: PetProfile,
  distanceKm: number,
): { score: number; reasons: string[] } {
  let score = 70; // 基础分
  const reasons: string[] = [];

  // ---- 硬性过滤：体型差距超过2级直接扣30分 ----
  const sizeDiff = Math.abs(
    SIZE_ORDER[myPet.size] - SIZE_ORDER[otherPet.size],
  );
  if (sizeDiff > 2) {
    score -= 30;
    reasons.push(`体型差距较大（${myPet.size} vs ${otherPet.size}），匹配度降低`);
  }

  // ---- 性格兼容 ----
  const commonTags = myPet.personalityTags.filter((tag) =>
    otherPet.personalityTags.includes(tag),
  );
  if (commonTags.length > 0) {
    score += commonTags.length * 15;
    reasons.push(
      `性格相似：${commonTags.map(tagNameMap).join('、')}`,
    );
  }

  if (hasComplement(myPet.personalityTags, otherPet.personalityTags)) {
    score += 20;
    reasons.push('性格互补（温顺 + 胆小），相处和谐');
  }

  if (hasConflict(myPet.personalityTags, otherPet.personalityTags)) {
    score -= 20;
    reasons.push('性格可能冲突（活泼 + 胆小），需要引导');
  }

  // ---- 能量匹配 ----
  const energyDiff = Math.abs(
    ENERGY_ORDER[myPet.energyLevel] - ENERGY_ORDER[otherPet.energyLevel],
  );
  if (energyDiff === 0) {
    score += 10;
    reasons.push('运动量需求一致');
  } else if (energyDiff === 1) {
    score += 5;
    reasons.push('运动量需求接近');
  } else {
    score -= 5;
    reasons.push('运动量需求差距较大');
  }

  // ---- 距离 ----
  if (distanceKm <= 5) {
    reasons.push(`距离很近（${distanceKm.toFixed(1)}km），方便见面`);
  } else if (distanceKm <= 10) {
    score -= 5;
    reasons.push(`距离适中（${distanceKm.toFixed(1)}km）`);
  } else {
    score -= 15;
    reasons.push(`距离较远（${distanceKm.toFixed(1)}km），见面不太方便`);
  }

  // ---- 疫苗 ----
  if (
    myPet.vaccineStatus === 'up_to_date' &&
    otherPet.vaccineStatus === 'up_to_date'
  ) {
    score += 5;
    reasons.push('双方疫苗齐全，健康有保障');
  }

  // ---- 分数 clamp 到 0-100 ----
  score = Math.max(0, Math.min(100, score));

  return { score, reasons };
}

/**
 * 根据匹配分数获取匹配标签和颜色
 * @param score 匹配分数（0-100）
 * @returns 匹配标签文本和颜色值
 */
export function getMatchLabel(score: number): { label: string; color: string } {
  if (score >= 90) {
    return { label: '完美匹配', color: '#52c41a' }; // 绿色
  }
  if (score >= 70) {
    return { label: '高度匹配', color: '#1890ff' }; // 蓝色
  }
  if (score >= 50) {
    return { label: '一般匹配', color: '#fa8c16' }; // 橙色
  }
  return { label: '匹配度低', color: '#f5222d' }; // 红色
}

/**
 * 性格标签中文名映射
 */
function tagNameMap(tag: PersonalityTag): string {
  const map: Record<PersonalityTag, string> = {
    lively: '活泼',
    gentle: '温顺',
    timid: '胆小',
    independent: '独立',
    clingy: '粘人',
  };
  return map[tag];
}

// ==================== V1.0 高级匹配算法 ====================

/**
 * 性格兼容矩阵 key 格式: "tagA+tagB"（按字母序排列）
 * compatiblePairs: 正面分数
 */
const COMPATIBLE_PAIRS: Record<string, number> = {
  'lively+lively': 15,
  'lively+gentle': 10,
  'gentle+gentle': 15,
  'timid+gentle': 20,
  'timid+timid': 5,
  'independent+independent': 10,
  'clingy+gentle': 15,
  'clingy+clingy': 10,
};

/**
 * 性格不兼容矩阵
 */
const INCOMPATIBLE_PAIRS: Record<string, number> = {
  'lively+timid': -20,
  'lively+independent': -5,
};

/**
 * 能量等级连续值映射
 */
const ENERGY_MAP: Record<EnergyLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * 体型等级连续值映射
 */
const SIZE_MAP: Record<SizeType, number> = {
  small: 1,
  medium: 2,
  large: 3,
  giant: 4,
};

/**
 * 维度名称中文映射
 */
const DIMENSION_LABEL_MAP: Record<string, string> = {
  personality: '性格',
  energy: '能量',
  size: '体型',
  distance: '距离',
  health: '健康',
};

/**
 * 生成性格对的 key（按字母序排列，确保 A+B 和 B+A 得到相同 key）
 */
function makePairKey(a: PersonalityTag, b: PersonalityTag): string {
  return [a, b].sort().join('+');
}

/**
 * 判断宠物是否已认证（健康认证：疫苗齐全 + 已绝育）
 */
function isVerified(pet: PetProfile): boolean {
  return pet.vaccineStatus === 'up_to_date' && pet.neutered;
}

/**
 * 计算高级匹配分数（V1.0）
 * 使用多维度评分体系，返回各维度的单独分数和匹配建议
 */
export function calculateAdvancedMatchScore(
  myPet: PetProfile,
  otherPet: PetProfile,
  distanceKm: number,
  _historyReviews?: Review[],
): {
  score: number;
  reasons: string[];
  dimensions: {
    personality: number;
    energy: number;
    size: number;
    distance: number;
    health: number;
  };
} {
  try {
  let score = 50; // 基础分从 50 开始
  const reasons: string[] = [];

  // ---- personality 维度 ----
  let personalityScore = 0;
  const pairScores: number[] = [];
  for (const tagA of myPet.personalityTags) {
    for (const tagB of otherPet.personalityTags) {
      const key = makePairKey(tagA, tagB);
      if (COMPATIBLE_PAIRS[key] !== undefined) {
        pairScores.push(COMPATIBLE_PAIRS[key]);
      }
      if (INCOMPATIBLE_PAIRS[key] !== undefined) {
        pairScores.push(INCOMPATIBLE_PAIRS[key]);
      }
    }
  }
  // 取所有性格对分数的平均值（如果有的话），否则为 0
  if (pairScores.length > 0) {
    personalityScore = Math.round(pairScores.reduce((a, b) => a + b, 0) / pairScores.length);
  }
  score += personalityScore;

  if (personalityScore >= 15) {
    reasons.push('性格非常互补！');
  } else if (personalityScore >= 8) {
    reasons.push('性格比较合拍');
  } else if (personalityScore < 0) {
    reasons.push('性格可能存在冲突，需要引导');
  }

  // ---- energy 维度 ----
  const energyDiff = Math.abs(ENERGY_MAP[myPet.energyLevel] - ENERGY_MAP[otherPet.energyLevel]);
  let energyScore = 0;
  if (energyDiff === 0) {
    energyScore = 15;
    reasons.push('运动量需求一致');
  } else if (energyDiff === 1) {
    energyScore = 8;
    reasons.push('运动量需求接近');
  } else {
    energyScore = -5;
    reasons.push('运动量需求差距较大');
  }
  score += energyScore;

  // ---- size 维度 ----
  const sizeDiff = Math.abs(SIZE_MAP[myPet.size] - SIZE_MAP[otherPet.size]);
  let sizeScore = 0;
  if (sizeDiff === 0) {
    sizeScore = 10;
  } else if (sizeDiff === 1) {
    sizeScore = 5;
  } else if (sizeDiff === 2) {
    sizeScore = -10;
    reasons.push('注意体型差距较大');
  } else {
    sizeScore = -25;
    reasons.push('体型差距非常大，需特别注意安全');
  }
  score += sizeScore;

  // ---- distance 维度 ----
  let distanceScore = 0;
  if (distanceKm <= 3) {
    distanceScore = 10;
    reasons.push(`距离很近（${distanceKm.toFixed(1)}km），方便见面`);
  } else if (distanceKm <= 5) {
    distanceScore = 5;
    reasons.push(`距离较近（${distanceKm.toFixed(1)}km）`);
  } else if (distanceKm <= 10) {
    distanceScore = -5;
    reasons.push(`距离适中（${distanceKm.toFixed(1)}km）`);
  } else if (distanceKm <= 15) {
    distanceScore = -10;
    reasons.push(`距离稍远（${distanceKm.toFixed(1)}km），但值得尝试`);
  } else {
    distanceScore = -20;
    reasons.push(`距离较远（${distanceKm.toFixed(1)}km），见面不太方便`);
  }
  score += distanceScore;

  // ---- health 维度 ----
  let healthScore = 0;
  const myVerified = isVerified(myPet);
  const otherVerified = isVerified(otherPet);
  if (myVerified && otherVerified) {
    healthScore = 10;
    reasons.push('双方均已认证（疫苗齐全+已绝育），健康有保障');
  } else if (myVerified || otherVerified) {
    healthScore = 5;
    reasons.push('一方已认证（疫苗齐全+已绝育）');
  }
  score += healthScore;

  // ---- 分数 clamp 到 0-100 ----
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    reasons,
    dimensions: {
      personality: personalityScore,
      energy: energyScore,
      size: sizeScore,
      distance: distanceScore,
      health: healthScore,
    },
  };
  } catch (err) {
    console.error('calculateAdvancedMatchScore error:', err);
    return {
      score: 50,
      reasons: ['匹配计算出错'],
      dimensions: { personality: 50, energy: 50, size: 50, distance: 50, health: 50 },
    };
  }
}

/**
 * 获取维度等级标签
 * @param dim 维度名称
 * @param score 该维度分数
 * @returns 标签文本和等级
 */
export function getDimensionLabel(
  dim: string,
  score: number,
): { label: string; level: 'excellent' | 'good' | 'fair' | 'poor' } {
  let level: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 10) {
    level = 'excellent';
  } else if (score >= 5) {
    level = 'good';
  } else if (score >= 0) {
    level = 'fair';
  } else {
    level = 'poor';
  }

  const label = DIMENSION_LABEL_MAP[dim] || dim;
  return { label, level };
}

/**
 * 根据各维度分数生成匹配建议
 * @param dimensions 各维度分数
 * @returns 建议列表（2-3 条）
 */
export function getCompatibilityAdvice(
  dimensions: {
    personality: number;
    energy: number;
    size: number;
    distance: number;
    health: number;
  },
): string[] {
  const advice: string[] = [];

  // 性格建议
  if (dimensions.personality >= 15) {
    advice.push('性格非常互补，相处会很愉快！');
  } else if (dimensions.personality >= 8) {
    advice.push('性格比较合拍，可以尝试一起玩');
  } else if (dimensions.personality < 0) {
    advice.push('性格可能存在冲突，建议初次见面时多加引导');
  }

  // 体型建议
  if (dimensions.size <= -10) {
    advice.push('注意体型差距较大，玩耍时请注意安全');
  }

  // 距离建议
  if (dimensions.distance <= -10) {
    advice.push('距离稍远但值得尝试，可以约在中间地点见面');
  } else if (dimensions.distance >= 10) {
    advice.push('距离很近，随时可以约起来！');
  }

  // 健康建议
  if (dimensions.health >= 10) {
    advice.push('双方健康认证齐全，放心玩耍');
  } else if (dimensions.health === 0) {
    advice.push('建议确认双方疫苗状态后再见面');
  }

  // 能量建议
  if (dimensions.energy === -5) {
    advice.push('运动量需求差距较大，可以选择折中的活动强度');
  } else if (dimensions.energy >= 15) {
    advice.push('运动量需求一致，可以一起尽情奔跑！');
  }

  // 确保至少返回 2 条，最多 3 条
  if (advice.length > 3) {
    return advice.slice(0, 3);
  }
  if (advice.length < 2) {
    // 补充通用建议
    if (advice.length === 0) {
      advice.push('综合匹配度不错，可以尝试约见');
    }
    if (advice.length === 1) {
      advice.push('建议初次见面选择人少的时段，观察宠物互动');
    }
  }

  return advice;
}
