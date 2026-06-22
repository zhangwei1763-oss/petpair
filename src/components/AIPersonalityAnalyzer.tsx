import { useState, useRef } from 'react';
import { Sparkles, Camera, Loader2, Wand2, RefreshCw } from 'lucide-react';
import { analyzePetPersonality, type AIPersonalityAnalysis, isAIConfigured } from '../api/ai';

interface AIPersonalityAnalyzerProps {
  petName: string;
  species: 'dog' | 'cat' | 'other';
  existingPhotos?: string[];
  onAnalysisComplete?: (analysis: AIPersonalityAnalysis) => void;
}

export default function AIPersonalityAnalyzer({
  petName,
  species,
  existingPhotos,
  onAnalysisComplete,
}: AIPersonalityAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIPersonalityAnalysis | null>(null);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 转换为 base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setAnalysis(null);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    let imageToAnalyze = selectedImage;

    // 如果没有选择新图片，尝试使用现有照片
    if (!imageToAnalyze && existingPhotos && existingPhotos.length > 0) {
      imageToAnalyze = existingPhotos[0];
    }

    if (!imageToAnalyze) {
      setError('请先上传宠物照片');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await analyzePetPersonality(imageToAnalyze, petName, species);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseExistingPhoto = (photoUrl: string) => {
    setSelectedImage(photoUrl);
    setAnalysis(null);
    setError('');
  };

  if (!isAIConfigured()) {
    return (
      <div className="ai-analyzer ai-analyzer--disabled">
        <div className="ai-analyzer__icon">
          <Sparkles size={32} />
        </div>
        <p>AI 功能未配置</p>
        <span>请配置 AI API Key 以使用此功能</span>
      </div>
    );
  }

  return (
    <div className="ai-analyzer">
      <div className="ai-analyzer__header">
        <Sparkles size={20} className="ai-analyzer__sparkle" />
        <h3>AI 性格分析</h3>
        <span className="ai-analyzer__badge">AI</span>
      </div>

      <p className="ai-analyzer__desc">
        上传宠物照片，AI 将自动分析性格特征、能量水平和适合的玩伴类型
      </p>

      {/* 照片选择区域 */}
      <div className="ai-analyzer__photo-section">
        {existingPhotos && existingPhotos.length > 0 && (
          <div className="ai-analyzer__existing-photos">
            <p className="ai-analyzer__label">选择现有照片：</p>
            <div className="ai-analyzer__photo-grid">
              {existingPhotos.map((photo, index) => (
                <button
                  key={index}
                  className={`ai-analyzer__photo-btn ${selectedImage === photo ? 'ai-analyzer__photo-btn--selected' : ''}`}
                  onClick={() => handleUseExistingPhoto(photo)}
                >
                  <img src={photo} alt={`照片 ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="ai-analyzer__upload">
          <p className="ai-analyzer__label">或上传新照片：</p>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            className="btn btn--secondary ai-analyzer__upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={16} />
            选择照片
          </button>
        </div>
      </div>

      {/* 选中的照片预览 */}
      {selectedImage && (
        <div className="ai-analyzer__preview">
          <img src={selectedImage} alt="选中的照片" />
        </div>
      )}

      {/* 分析按钮 */}
      <button
        className="btn btn--primary ai-analyzer__analyze-btn"
        onClick={handleAnalyze}
        disabled={isAnalyzing || !selectedImage}
      >
        {isAnalyzing ? (
          <>
            <Loader2 size={16} className="spin" />
            AI 分析中...
          </>
        ) : (
          <>
            <Wand2 size={16} />
            开始 AI 分析
          </>
        )}
      </button>

      {/* 错误提示 */}
      {error && (
        <div className="ai-analyzer__error">
          {error}
        </div>
      )}

      {/* 分析结果 */}
      {analysis && (
        <div className="ai-analyzer__result">
          <div className="ai-analyzer__result-header">
            <Sparkles size={16} />
            <span>分析结果</span>
            <span className="ai-analyzer__confidence">
              置信度: {Math.round(analysis.confidence * 100)}%
            </span>
          </div>

          <div className="ai-analyzer__result-content">
            {/* 性格标签 */}
            <div className="ai-analyzer__section">
              <h4>性格标签</h4>
              <div className="ai-analyzer__tags">
                {analysis.personalityTags.map((tag, index) => (
                  <span key={index} className="tag tag--ai">{tag}</span>
                ))}
              </div>
            </div>

            {/* 能量水平 */}
            <div className="ai-analyzer__section">
              <h4>能量水平</h4>
              <div className={`ai-analyzer__energy ai-analyzer__energy--${analysis.energyLevel}`}>
                <span className="ai-analyzer__energy-label">
                  {analysis.energyLevel === 'high' ? '高能量' : analysis.energyLevel === 'medium' ? '中能量' : '低能量'}
                </span>
                <div className="ai-analyzer__energy-bar">
                  <div
                    className="ai-analyzer__energy-fill"
                    style={{
                      width: analysis.energyLevel === 'high' ? '100%' : analysis.energyLevel === 'medium' ? '60%' : '30%',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 推荐活动 */}
            <div className="ai-analyzer__section">
              <h4>推荐活动</h4>
              <div className="ai-analyzer__activities">
                {analysis.suggestedActivities.map((activity, index) => (
                  <span key={index} className="ai-analyzer__activity">{activity}</span>
                ))}
              </div>
            </div>

            {/* 适合玩伴 */}
            <div className="ai-analyzer__section">
              <h4>适合的玩伴</h4>
              <div className="ai-analyzer__compatible">
                {analysis.compatibleTypes.map((type, index) => (
                  <span key={index} className="ai-analyzer__compatible-type">{type}</span>
                ))}
              </div>
            </div>

            {/* 性格描述 */}
            <div className="ai-analyzer__section">
              <h4>性格描述</h4>
              <p className="ai-analyzer__description">{analysis.description}</p>
            </div>
          </div>

          <button
            className="btn btn--secondary ai-analyzer__retry"
            onClick={() => {
              setAnalysis(null);
              setSelectedImage(null);
            }}
          >
            <RefreshCw size={14} />
            重新分析
          </button>
        </div>
      )}
    </div>
  );
}
