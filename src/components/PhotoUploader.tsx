import { useRef, useState, useCallback } from 'react';
import { X, Plus, Star } from 'lucide-react';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUploader({
  photos,
  onChange,
  maxPhotos = 6,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remaining = maxPhotos - photos.length;
      const filesToProcess = Array.from(files).slice(0, remaining);

      const readPromises = filesToProcess.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      );

      Promise.all(readPromises).then((newPhotos) => {
        onChange([...photos, ...newPhotos]);
      });

      // Reset input so the same file can be selected again
      e.target.value = '';
    },
    [photos, onChange, maxPhotos]
  );

  const handleDelete = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const updated = [...photos];
    const [photo] = updated.splice(index, 1);
    updated.unshift(photo);
    onChange(updated);
  };

  const handlePreview = (photo: string) => {
    setPreviewPhoto(photo);
  };

  const handleClosePreview = () => {
    setPreviewPhoto(null);
  };

  const canAdd = photos.length < maxPhotos;

  return (
    <div className="photo-uploader">
      <div className="photo-uploader__grid">
        {photos.map((photo, index) => (
          <div className="photo-uploader__item" key={index}>
            <img
              className="photo-uploader__img"
              src={photo}
              alt={`照片 ${index + 1}`}
              onClick={() => handlePreview(photo)}
            />
            {index === 0 && (
              <span className="photo-uploader__cover-badge">
                <Star size={10} />
                封面
              </span>
            )}
            <button
              className="photo-uploader__delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(index);
              }}
              title="删除照片"
            >
              <X size={14} />
            </button>
            <button
              className="photo-uploader__set-cover"
              onClick={(e) => {
                e.stopPropagation();
                handleSetCover(index);
              }}
            >
              {index === 0 ? '当前封面' : '设为封面'}
            </button>
          </div>
        ))}

        {canAdd && (
          <div className="photo-uploader__add" onClick={handleAddClick}>
            <Plus size={28} />
            <span className="photo-uploader__add-text">添加照片</span>
            <span className="photo-uploader__add-count">
              {photos.length}/{maxPhotos}
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Preview Modal */}
      {previewPhoto && (
        <div className="photo-uploader__overlay" onClick={handleClosePreview}>
          <div
            className="photo-uploader__preview"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewPhoto} alt="预览" />
            <button
              className="photo-uploader__preview-close"
              onClick={handleClosePreview}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .photo-uploader {
          width: 100%;
        }
        .photo-uploader__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          max-height: 480px;
          overflow-y: auto;
          padding: 4px;
        }
        .photo-uploader__item {
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          aspect-ratio: 1;
          background: var(--bg-secondary);
        }
        .photo-uploader__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          transition: transform var(--transition-fast);
        }
        .photo-uploader__img:hover {
          transform: scale(1.03);
        }
        .photo-uploader__cover-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
          color: #ffffff;
          background: var(--primary);
          border-radius: var(--radius-full);
        }
        .photo-uploader__delete {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          color: #ffffff;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .photo-uploader__item:hover .photo-uploader__delete {
          opacity: 1;
        }
        .photo-uploader__delete:hover {
          background: var(--danger);
        }
        .photo-uploader__set-cover {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 4px;
          font-size: 11px;
          font-weight: 500;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          cursor: pointer;
          text-align: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .photo-uploader__item:hover .photo-uploader__set-cover {
          opacity: 1;
        }
        .photo-uploader__set-cover:hover {
          background: rgba(0, 0, 0, 0.7);
        }
        .photo-uploader__add {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          background: var(--bg-card);
        }
        .photo-uploader__add:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-light);
        }
        .photo-uploader__add-text {
          font-size: 13px;
          font-weight: 500;
        }
        .photo-uploader__add-count {
          font-size: 11px;
          color: var(--text-secondary);
        }

        /* Preview overlay */
        .photo-uploader__overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn var(--transition-fast) ease forwards;
        }
        .photo-uploader__preview {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
        }
        .photo-uploader__preview img {
          max-width: 100%;
          max-height: 85vh;
          object-fit: contain;
          border-radius: var(--radius-md);
        }
        .photo-uploader__preview-close {
          position: absolute;
          top: -40px;
          right: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .photo-uploader__preview-close:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}
