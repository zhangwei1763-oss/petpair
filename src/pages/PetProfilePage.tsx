import { useState, useEffect } from 'react';
import type { PetProfile } from '../types';
import { getCurrentUser } from '../data/mockData';
import { getMyPets, createPet, updatePet, deletePet } from '../api/pets';
import { isSupabaseConfigured } from '../api/client';
import PetProfileForm from '../components/PetProfileForm';
import AIPersonalityAnalyzer from '../components/AIPersonalityAnalyzer';
import type { AIPersonalityAnalysis } from '../api/ai';
import { Plus, Edit, Trash2, Sparkles } from 'lucide-react';

const personalityLabelMap: Record<string, string> = {
  lively: '活泼',
  gentle: '温顺',
  timid: '胆小',
  independent: '独立',
  clingy: '粘人',
};

export default function PetProfilePage() {
  const currentUser = getCurrentUser();
  const [pets, setPets] = useState<PetProfile[]>(currentUser.pets);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [analyzingPetId, setAnalyzingPetId] = useState<string | null>(null);

  // 从 API 加载宠物列表
  useEffect(() => {
    if (isSupabaseConfigured) {
      // Supabase 模式下需要 user.id，从 localStorage 或全局状态获取
      // 这里通过 currentUser.id 作为 fallback
      const userId = getCurrentUser().id;
      if (userId) {
        getMyPets(userId).then(setPets);
      }
    }
  }, [isSupabaseConfigured]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSave = async (data: Partial<PetProfile>) => {
    if (isSupabaseConfigured) {
      if (editingPet) {
        const updated = await updatePet(editingPet.id, data);
        setPets(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await createPet(data);
        setPets(prev => [...prev, created]);
      }
    } else {
      // Mock 模式
      if (editingPet) {
        setPets((prev) =>
          prev.map((p) => (p.id === editingPet.id ? { ...p, ...data } : p))
        );
      } else {
        const newPet: PetProfile = {
          id: `pet_${Date.now()}`,
          ownerId: getCurrentUser().id,
          name: data.name || '',
          breed: data.breed || '',
          species: data.species || 'dog',
          age: data.age || 0,
          gender: data.gender || 'male',
          weight: data.weight || 0,
          size: data.size || 'medium',
          neutered: data.neutered || false,
          personalityTags: data.personalityTags || [],
          energyLevel: data.energyLevel || 'medium',
          activityPreferences: data.activityPreferences || [],
          socialPreferences: data.socialPreferences || [],
          vaccineStatus: data.vaccineStatus || 'up_to_date',
          photos: data.photos && data.photos.length > 0
            ? data.photos
            : ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop'],
          bio: data.bio || '',
        };
        setPets((prev) => [...prev, newPet]);
      }
    }
    setEditingPet(null);
    setIsAdding(false);
    showSuccess('保存成功！');
  };

  const handleDelete = async (petId: string) => {
    if (confirm('确定要删除这个宠物档案吗？')) {
      if (isSupabaseConfigured) {
        await deletePet(petId);
      }
      setPets((prev) => prev.filter((p) => p.id !== petId));
      showSuccess('已删除');
    }
  };

  const handleAIAnalysisComplete = (petId: string, analysis: AIPersonalityAnalysis) => {
    // 将 AI 分析结果更新到宠物档案
    setPets((prev) =>
      prev.map((p) => {
        if (p.id !== petId) return p;

        // 将中文标签映射为英文 key
        const tagMap: Record<string, string> = {
          '活泼': 'lively',
          '温顺': 'gentle',
          '胆小': 'timid',
          '独立': 'independent',
          '粘人': 'clingy',
          '友好': 'lively',
          '好奇': 'lively',
          '警觉': 'independent',
          '稳重': 'gentle',
          '调皮': 'lively',
          '安静': 'gentle',
          '聪明': 'independent',
          '忠诚': 'clingy',
          '勇敢': 'lively',
          '敏感': 'timid',
        };

        const mappedTags = analysis.personalityTags
          .map((tag) => tagMap[tag] || 'lively')
          .filter((tag): tag is ('lively' | 'gentle' | 'timid' | 'independent' | 'clingy') =>
            ['lively', 'gentle', 'timid', 'independent', 'clingy'].includes(tag)
          );

        return {
          ...p,
          personalityTags: mappedTags.length > 0 ? mappedTags : ['lively'],
          energyLevel: analysis.energyLevel,
          bio: analysis.description,
        };
      })
    );
    showSuccess('AI 分析结果已应用到档案！');
    setAnalyzingPetId(null);
  };

  return (
    <div className="pet-profile-page container">
      <div className="pet-profile-page__header">
        <h1>宠物档案管理</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setIsAdding(true);
            setEditingPet(null);
          }}
        >
          <Plus size={16} />
          添加新宠物
        </button>
      </div>

      {successMsg && (
        <div className="pet-profile-page__success">
          {successMsg}
        </div>
      )}

      {/* Pet List */}
      <div className="pet-profile-page__list">
        {pets.map((pet) => (
          <div key={pet.id} className="card pet-profile-page__card">
            <div className="pet-profile-page__card-header">
              <img
                className="avatar-lg"
                src={pet.photos[0]}
                alt={pet.name}
              />
              <div className="pet-profile-page__card-info">
                <h3>{pet.name}</h3>
                <p className="pet-profile-page__card-breed">
                  {pet.breed} · {pet.gender === 'male' ? '公' : '母'} · {pet.age}岁 · {pet.weight}kg
                </p>
                <div className="pet-profile-page__card-tags">
                  {pet.personalityTags.map((tag) => (
                    <span className="tag" key={tag}>
                      {personalityLabelMap[tag] || tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pet-profile-page__card-actions">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    setEditingPet(pet);
                    setIsAdding(false);
                  }}
                >
                  <Edit size={14} />
                  编辑
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  style={{
                    background: 'linear-gradient(135deg, #9b7edc 0%, #c4785a 100%)',
                    color: '#fff',
                    border: 'none',
                  }}
                  onClick={() => {
                    setAnalyzingPetId(analyzingPetId === pet.id ? null : pet.id);
                    setEditingPet(null);
                    setIsAdding(false);
                  }}
                >
                  <Sparkles size={14} />
                  AI分析
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(pet.id)}
                >
                  <Trash2 size={14} />
                  删除
                </button>
              </div>
            </div>

            {pet.bio && (
              <p className="pet-profile-page__card-bio">{pet.bio}</p>
            )}

            {/* Inline Edit Form */}
            {editingPet && editingPet.id === pet.id && (
              <div className="pet-profile-page__form-wrapper">
                <PetProfileForm
                  initialData={editingPet}
                  onSubmit={handleSave}
                  submitLabel="保存"
                />
              </div>
            )}

            {/* AI Personality Analyzer */}
            {analyzingPetId === pet.id && (
              <div className="pet-profile-page__form-wrapper">
                <AIPersonalityAnalyzer
                  petName={pet.name}
                  species={pet.species}
                  existingPhotos={pet.photos}
                  onAnalysisComplete={(analysis) =>
                    handleAIAnalysisComplete(pet.id, analysis)
                  }
                />
              </div>
            )}
          </div>
        ))}

        {pets.length === 0 && !isAdding && (
          <div className="empty-state">
            <Plus size={64} />
            <h3>还没有宠物档案</h3>
            <p>点击上方"添加新宠物"按钮，为你的宠物创建档案</p>
          </div>
        )}
      </div>

      {/* Add New Pet Form */}
      {isAdding && (
        <div className="card pet-profile-page__add-form">
          <h3 style={{ marginBottom: 20 }}>添加新宠物</h3>
          <PetProfileForm
            onSubmit={handleSave}
            submitLabel="添加"
          />
        </div>
      )}

      <style>{`
        .pet-profile-page {
          padding-top: 24px;
          padding-bottom: 40px;
        }
        .pet-profile-page__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .pet-profile-page__success {
          padding: 12px 16px;
          background: var(--success);
          color: #fff;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
          animation: fadeIn var(--transition-normal) ease;
        }
        .pet-profile-page__list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pet-profile-page__card-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .pet-profile-page__card-info {
          flex: 1;
          min-width: 0;
        }
        .pet-profile-page__card-info h3 {
          font-size: 16px;
          margin-bottom: 4px;
        }
        .pet-profile-page__card-breed {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .pet-profile-page__card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .pet-profile-page__card-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .pet-profile-page__card-bio {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 12px;
          margin-bottom: 0;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .pet-profile-page__form-wrapper {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .pet-profile-page__add-form {
          margin-top: 24px;
        }
        @media (max-width: 768px) {
          .pet-profile-page__card-header {
            flex-wrap: wrap;
          }
          .pet-profile-page__card-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
