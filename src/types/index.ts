// ==================== 枚举类型 ====================

export type PetType = 'dog' | 'cat' | 'other';

export type Gender = 'male' | 'female';

export type SizeType = 'small' | 'medium' | 'large' | 'giant';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type PersonalityTag =
  | 'lively'
  | 'gentle'
  | 'timid'
  | 'independent'
  | 'clingy';

export type ActivityPreference =
  | 'outdoor_run'
  | 'walk'
  | 'indoor_play'
  | 'water'
  | 'hiking';

export type SocialPreference =
  | 'big_dogs'
  | 'small_dogs'
  | 'cats'
  | 'quiet'
  | 'chase';

export type VaccineStatus = 'up_to_date' | 'partial' | 'none';

// ==================== 接口定义 ====================

export interface PetProfile {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  species: PetType;
  age: number;
  gender: Gender;
  weight: number;
  size: SizeType;
  neutered: boolean;
  personalityTags: PersonalityTag[];
  energyLevel: EnergyLevel;
  activityPreferences: ActivityPreference[];
  socialPreferences: SocialPreference[];
  vaccineStatus: VaccineStatus;
  photos: string[];
  bio: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  location: {
    city: string;
    district: string;
    lat: number;
    lng: number;
  };
  pets: PetProfile[];
  createdAt: string;
}

export interface MatchResult {
  pet: PetProfile;
  score: number;
  matchReasons: string[];
  distanceKm: number;
}

export interface Invitation {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromPetId: string;
  toPetId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  proposedTime: string;
  proposedLocation: string;
  activityType: string;
  message: string;
  createdAt: string;
  respondedAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  invitationId?: string;       // 可选，关联邀约ID
  content: string;
  type: 'text' | 'image' | 'location' | 'ai';  // 支持四种消息类型
  createdAt: string;
  isAi?: boolean;               // AI 消息标记
  aiLoading?: boolean;         // AI 正在生成中
}

export interface Review {
  id: string;
  invitationId: string;
  reviewerId: string;
  revieweeId: string;
  ratings: {
    friendliness: 1 | 2 | 3 | 4 | 5;
    punctuality: 1 | 2 | 3 | 4 | 5;
    accuracy: 1 | 2 | 3 | 4 | 5;
  };
  comment: string;
  createdAt: string;
}

// ==================== V1.5 新增类型 ====================
export interface ActivityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  petId: string;
  petName: string;
  petPhoto: string;
  content: string;
  images: string[];
  likes: number;
  comments: ActivityComment[];
  createdAt: string;
  isLiked?: boolean;
}

export interface ActivityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'match' | 'invitation' | 'message' | 'system' | 'review' | 'like';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
  avatar?: string;
}

// V2.0 新增类型
export interface LeaderboardEntry {
  rank: number;
  petId: string;
  petName: string;
  petPhoto: string;
  ownerName: string;
  ownerAvatar: string;
  score: number;
  meetups: number;
  rating: number;
  breed: string;
}

export interface UserStats {
  totalMeetups: number;
  totalMatches: number;
  totalInvitations: number;
  totalReviews: number;
  avgRating: number;
  thisMonthMeetups: number;
  popularPets: { petId: string; petName: string; meetups: number }[];
  weeklyTrend: { week: string; meetups: number }[];
}
