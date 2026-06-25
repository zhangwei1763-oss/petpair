import { supabase } from './client';
import type { PetProfile } from '../types';

// 获取所有宠物（公开列表）
export async function getAllPets(): Promise<PetProfile[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPetFromDB);
}

// 获取我的宠物
export async function getMyPets(userId: string): Promise<PetProfile[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPetFromDB);
}

// 获取宠物详情
export async function getPetById(petId: string): Promise<PetProfile | null> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single();
  if (error) throw error;
  return data ? mapPetFromDB(data) : null;
}

// 创建宠物
export async function createPet(pet: Partial<PetProfile>): Promise<PetProfile> {
  const { data, error } = await supabase
    .from('pets')
    .insert({
      name: pet.name,
      breed: pet.breed,
      species: pet.species,
      age: pet.age,
      gender: pet.gender,
      weight: pet.weight,
      size: pet.size,
      personality_tags: pet.personalityTags,
      energy_level: pet.energyLevel,
      activity_preferences: pet.activityPreferences,
      social_preferences: pet.socialPreferences,
      photos: pet.photos,
      bio: pet.bio,
      vaccine_status: pet.vaccineStatus,
      neutered: pet.neutered,
    })
    .select()
    .single();
  if (error) throw error;
  return mapPetFromDB(data);
}

// 更新宠物
export async function updatePet(petId: string, updates: Partial<PetProfile>): Promise<PetProfile> {
  const dbUpdates: Record<string, any> = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.breed) dbUpdates.breed = updates.breed;
  if (updates.species) dbUpdates.species = updates.species;
  if (updates.age !== undefined) dbUpdates.age = updates.age;
  if (updates.gender) dbUpdates.gender = updates.gender;
  if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
  if (updates.size) dbUpdates.size = updates.size;
  if (updates.personalityTags) dbUpdates.personality_tags = updates.personalityTags;
  if (updates.energyLevel) dbUpdates.energy_level = updates.energyLevel;
  if (updates.activityPreferences) dbUpdates.activity_preferences = updates.activityPreferences;
  if (updates.socialPreferences) dbUpdates.social_preferences = updates.socialPreferences;
  if (updates.photos) dbUpdates.photos = updates.photos;
  if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
  if (updates.vaccineStatus) dbUpdates.vaccine_status = updates.vaccineStatus;
  if (updates.neutered !== undefined) dbUpdates.neutered = updates.neutered;

  const { data, error } = await supabase
    .from('pets')
    .update(dbUpdates)
    .eq('id', petId)
    .select()
    .single();
  if (error) throw error;
  return mapPetFromDB(data);
}

// 删除宠物
export async function deletePet(petId: string): Promise<void> {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId);
  if (error) throw error;
}

// 数据库字段映射到前端类型
function mapPetFromDB(row: any): PetProfile {
  return {
    id: row.id,
    name: row.name,
    breed: row.breed,
    species: row.species,
    age: row.age,
    gender: row.gender,
    weight: row.weight,
    size: row.size,
    personalityTags: row.personality_tags || [],
    energyLevel: row.energy_level,
    activityPreferences: row.activity_preferences || [],
    socialPreferences: row.social_preferences || [],
    photos: row.photos || [],
    bio: row.bio || '',
    vaccineStatus: row.vaccine_status,
    neutered: row.neutered,
    ownerId: row.owner_id,
  };
}
