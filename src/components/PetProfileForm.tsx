import React, { useState } from 'react';
import type {
  PetProfile,
  PetType,
  Gender,
  SizeType,
  EnergyLevel,
  PersonalityTag,
  ActivityPreference,
  SocialPreference,
  VaccineStatus,
} from '../types';
import PhotoUploader from './PhotoUploader';

interface PetProfileFormProps {
  initialData?: PetProfile;
  onSubmit: (data: Partial<PetProfile>) => void;
  submitLabel?: string;
}

/** 选项配置类型 */
interface OptionItem {
  value: string;
  label: string;
}

const SPECIES_OPTIONS: OptionItem[] = [
  { value: 'dog', label: '狗' },
  { value: 'cat', label: '猫' },
  { value: 'other', label: '其他' },
];

const GENDER_OPTIONS: OptionItem[] = [
  { value: 'male', label: '公' },
  { value: 'female', label: '母' },
];

const SIZE_OPTIONS: OptionItem[] = [
  { value: 'small', label: '小型' },
  { value: 'medium', label: '中型' },
  { value: 'large', label: '大型' },
  { value: 'giant', label: '巨型' },
];

const PERSONALITY_OPTIONS: OptionItem[] = [
  { value: 'lively', label: '活泼' },
  { value: 'gentle', label: '温和' },
  { value: 'timid', label: '胆小' },
  { value: 'independent', label: '独立' },
  { value: 'clingy', label: '粘人' },
];

const ENERGY_OPTIONS: OptionItem[] = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
];

const ACTIVITY_OPTIONS: OptionItem[] = [
  { value: 'outdoor_run', label: '户外跑' },
  { value: 'walk', label: '散步' },
  { value: 'indoor_play', label: '室内玩' },
  { value: 'water', label: '水边' },
  { value: 'hiking', label: '爬山' },
];

const SOCIAL_OPTIONS: OptionItem[] = [
  { value: 'big_dogs', label: '大狗' },
  { value: 'small_dogs', label: '小狗' },
  { value: 'cats', label: '猫' },
  { value: 'quiet', label: '安静相处' },
  { value: 'chase', label: '追逐游戏' },
];

const VACCINE_OPTIONS: OptionItem[] = [
  { value: 'up_to_date', label: '齐全' },
  { value: 'partial', label: '部分' },
  { value: 'none', label: '未接种' },
];

const PetProfileForm: React.FC<PetProfileFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = '提交',
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [breed, setBreed] = useState(initialData?.breed || '');
  const [species, setSpecies] = useState<PetType>(initialData?.species || 'dog');
  const [age, setAge] = useState<number>(initialData?.age || 0);
  const [gender, setGender] = useState<Gender>(initialData?.gender || 'male');
  const [weight, setWeight] = useState<number>(initialData?.weight || 0);
  const [size, setSize] = useState<SizeType>(initialData?.size || 'medium');
  const [neutered, setNeutered] = useState(initialData?.neutered || false);
  const [personalityTags, setPersonalityTags] = useState<PersonalityTag[]>(
    initialData?.personalityTags || [],
  );
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(
    initialData?.energyLevel || 'medium',
  );
  const [activityPreferences, setActivityPreferences] = useState<ActivityPreference[]>(
    initialData?.activityPreferences || [],
  );
  const [socialPreferences, setSocialPreferences] = useState<SocialPreference[]>(
    initialData?.socialPreferences || [],
  );
  const [vaccineStatus, setVaccineStatus] = useState<VaccineStatus>(
    initialData?.vaccineStatus || 'up_to_date',
  );
  const [bio, setBio] = useState(initialData?.bio || '');
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = '宠物名字不能为空';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: Partial<PetProfile> = {
      name: name.trim(),
      breed: breed.trim(),
      species,
      age,
      gender,
      weight,
      size,
      neutered,
      personalityTags,
      energyLevel,
      activityPreferences,
      socialPreferences,
      vaccineStatus,
      bio: bio.trim(),
      photos,
    };
    onSubmit(data);
  };

  /** 单选按钮组 */
  const renderSingleSelect = (
    options: OptionItem[],
    value: string,
    onChange: (val: string) => void,
  ) => (
    <div className="pet-form__btn-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`pet-form__btn ${value === opt.value ? 'pet-form__btn--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  /** 多选按钮组 */
  const renderMultiSelect = (
    options: OptionItem[],
    values: string[],
    onChange: (vals: string[]) => void,
  ) => (
    <div className="pet-form__btn-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`pet-form__btn ${values.includes(opt.value) ? 'pet-form__btn--active' : ''}`}
          onClick={() => {
            if (values.includes(opt.value)) {
              onChange(values.filter((v) => v !== opt.value));
            } else {
              onChange([...values, opt.value]);
            }
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <form className="pet-form" onSubmit={handleSubmit}>
      {/* 照片上传 */}
      <div className="form-group">
        <label>宠物照片（最多6张，第一张为封面）</label>
        <PhotoUploader photos={photos} onChange={setPhotos} maxPhotos={6} />
      </div>

      {/* 名字 */}
      <div className="form-group">
        <label>名字 *</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入宠物名字"
        />
        {errors.name && <span className="pet-form__error">{errors.name}</span>}
      </div>

      {/* 品种 */}
      <div className="form-group">
        <label>品种</label>
        <input
          type="text"
          className="form-input"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="如：金毛、布偶猫"
        />
      </div>

      {/* 物种 */}
      <div className="form-group">
        <label>物种</label>
        {renderSingleSelect(SPECIES_OPTIONS, species, (v) => setSpecies(v as PetType))}
      </div>

      {/* 年龄 */}
      <div className="form-group">
        <label>年龄（岁）</label>
        <input
          type="number"
          className="form-input"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          min={0}
          max={30}
        />
      </div>

      {/* 性别 */}
      <div className="form-group">
        <label>性别</label>
        {renderSingleSelect(GENDER_OPTIONS, gender, (v) => setGender(v as Gender))}
      </div>

      {/* 体重 */}
      <div className="form-group">
        <label>体重（kg）</label>
        <input
          type="number"
          className="form-input"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          min={0}
          step={0.1}
        />
      </div>

      {/* 体型 */}
      <div className="form-group">
        <label>体型</label>
        {renderSingleSelect(SIZE_OPTIONS, size, (v) => setSize(v as SizeType))}
      </div>

      {/* 是否绝育 */}
      <div className="form-group">
        <label>是否绝育</label>
        <button
          type="button"
          className={`pet-form__toggle ${neutered ? 'pet-form__toggle--active' : ''}`}
          onClick={() => setNeutered(!neutered)}
        >
          <span className="pet-form__toggle-slider" />
          <span className="pet-form__toggle-label">{neutered ? '已绝育' : '未绝育'}</span>
        </button>
      </div>

      {/* 性格标签 */}
      <div className="form-group">
        <label>性格标签（多选）</label>
        {renderMultiSelect(PERSONALITY_OPTIONS, personalityTags, (vals) =>
          setPersonalityTags(vals as PersonalityTag[]),
        )}
      </div>

      {/* 能量值 */}
      <div className="form-group">
        <label>能量值</label>
        {renderSingleSelect(ENERGY_OPTIONS, energyLevel, (v) =>
          setEnergyLevel(v as EnergyLevel),
        )}
      </div>

      {/* 活动偏好 */}
      <div className="form-group">
        <label>活动偏好（多选）</label>
        {renderMultiSelect(ACTIVITY_OPTIONS, activityPreferences, (vals) =>
          setActivityPreferences(vals as ActivityPreference[]),
        )}
      </div>

      {/* 社交偏好 */}
      <div className="form-group">
        <label>社交偏好（多选）</label>
        {renderMultiSelect(SOCIAL_OPTIONS, socialPreferences, (vals) =>
          setSocialPreferences(vals as SocialPreference[]),
        )}
      </div>

      {/* 疫苗状态 */}
      <div className="form-group">
        <label>疫苗状态</label>
        {renderSingleSelect(VACCINE_OPTIONS, vaccineStatus, (v) =>
          setVaccineStatus(v as VaccineStatus),
        )}
      </div>

      {/* 简介 */}
      <div className="form-group">
        <label>简介</label>
        <textarea
          className="form-textarea"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="介绍一下你的宠物吧..."
          rows={4}
        />
      </div>

      {/* 提交按钮 */}
      <button type="submit" className="btn btn-primary pet-form__submit">
        {submitLabel}
      </button>
    </form>
  );
};

export default PetProfileForm;
