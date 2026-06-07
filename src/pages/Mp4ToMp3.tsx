import { messageApi } from "../components";
import { ChangeEvent, useRef, useState, DragEvent } from "react";
import { useForceUpdate } from "../hooks/useForceUpdate";
import { useTranslation } from "react-i18next";
import { extractAudioFromVideo } from "../utils/audioExtractor";

export const Mp4ToMp3 = () => {
  const { t } = useTranslation();
  
  const fileRef = useRef<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const resultFileNameRef = useRef<string>("");
  
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [bitrate, setBitrate] = useState<'128k' | '192k' | '320k'>('192k');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const forceUpdate = useForceUpdate();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      messageApi.error(t("error") + ": Please upload a valid video file.");
      return;
    }
    fileRef.current = file;
    resultFileNameRef.current = file.name.replace(/\.[^.]+$/, ".mp3");
    setDownloadUrl(null);
    setCurrentProgress(0);
    forceUpdate();
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (isConverting) return;
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileRef.current = null;
    setDownloadUrl(null);
    setCurrentProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    forceUpdate();
  };

  const handleConvert = async () => {
    if (!fileRef.current) return;
    
    try {
      setIsConverting(true);
      setDownloadUrl(null);
      setCurrentProgress(0);

      const file = fileRef.current;

      const mp3Blob = await extractAudioFromVideo(file, {
        bitrate,
        onProgress: (progress) => {
          setCurrentProgress(progress);
        }
      });

      const url = URL.createObjectURL(mp3Blob);
      setDownloadUrl(url);
      setCurrentProgress(100);
      setIsConverting(false);
      messageApi.success(t("success"));
    } catch (e: any) {
      console.error(e);
      setIsConverting(false);
      setCurrentProgress(0);
      messageApi.error(t("error") + (e.message ? `: ${e.message}` : ''));
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = resultFileNameRef.current;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }} className="animate-fade-in">
      {/* Title Hero */}
      <div style={{ textAlign: 'center', padding: '3.5rem 0 2.5rem 0', maxWidth: '650px' }}>
        <h2 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '3rem', 
          fontWeight: 800, 
          letterSpacing: '-0.02em', 
          marginBottom: '1rem', 
          background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}>
          {t('title')}
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Main Interactive Card */}
      <div className="dashboard-card" style={{ width: '100%', maxWidth: '680px' }}>
        
        {/* Drag and drop zone */}
        {!fileRef.current ? (
          <div 
            className={`dropzone ${isDragOver ? 'dragover' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={triggerFileSelect}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={onFileInputChange}
              accept="video/*"
            />
            <div className="dropzone-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="dropzone-title">{isDragOver ? t('drag_active') : t('drag_instructions')}</p>
              <p className="dropzone-desc" style={{ marginTop: '0.5rem' }}>{t('support_formats')}</p>
            </div>
          </div>
        ) : (
          /* File Preview Panel */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="file-preview">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z" />
              </svg>
              <div className="file-info">
                <p className="file-name">{fileRef.current.name}</p>
                <p className="file-meta">{formatSize(fileRef.current.size)}</p>
              </div>
              {!isConverting && !downloadUrl && (
                <button className="btn-icon-only" onClick={removeFile} title={t('reset')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Bitrate Selector (Only show before conversion is done) */}
            {!downloadUrl && !isConverting && (
              <div className="option-group">
                <p className="option-title">{t('bitrate')}</p>
                <div className="bitrate-options">
                  <button 
                    className={`bitrate-btn ${bitrate === '128k' ? 'active' : ''}`}
                    onClick={() => setBitrate('128k')}
                  >
                    128 kbps (Standard)
                  </button>
                  <button 
                    className={`bitrate-btn ${bitrate === '192k' ? 'active' : ''}`}
                    onClick={() => setBitrate('192k')}
                  >
                    192 kbps (High Quality)
                  </button>
                  <button 
                    className={`bitrate-btn ${bitrate === '320k' ? 'active' : ''}`}
                    onClick={() => setBitrate('320k')}
                  >
                    320 kbps (Super Quality)
                  </button>
                </div>
              </div>
            )}

            {/* Conversion status & Progress bar */}
            {isConverting && (
              <div className="progress-card">
                <div className="progress-header">
                  <span className="progress-status">
                    {t('converting')}
                  </span>
                  <span className="progress-percentage">{currentProgress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${currentProgress}%` }}></div>
                </div>
                
                <div className="waveform-loader">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
              </div>
            )}

            {/* Extracted Audio Player & Reset Option */}
            {downloadUrl && (
              <div className="audio-player-wrapper animate-fade-in">
                <span className="audio-player-title">Preview Extracted Audio</span>
                <audio controls src={downloadUrl} className="custom-audio" />
                
                <button 
                  onClick={removeFile}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginTop: '0.5rem',
                    padding: '2px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  {t('reset')}
                </button>
              </div>
            )}

            {/* Main Action Buttons */}
            <div>
              {downloadUrl ? (
                <button className="btn-success-modern" onClick={handleDownload}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t('download')}
                </button>
              ) : (
                <button
                  className="btn-modern"
                  onClick={handleConvert}
                  disabled={isConverting}
                >
                  {!isConverting && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 11a9 9 0 0 1 9 9" />
                      <path d="M4 4a16 16 0 0 1 16 16" />
                      <circle cx="5" cy="19" r="1" />
                    </svg>
                  )}
                  {isConverting ? t('converting') : t('start')}
                </button>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Security Privacy Note */}
      <div className="privacy-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>{t('privacy_note')}</span>
      </div>
    </div>
  );
};
