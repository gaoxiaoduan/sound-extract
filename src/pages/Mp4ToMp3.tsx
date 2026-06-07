import { useLoadFfmpeg } from "../hooks/useLoadFfmpeg";
import { messageApi } from "../components";
import { ChangeEvent, useRef, useState } from "react";
import { useForceUpdate } from "../hooks/useForceUpdate";
import { useTranslation } from "react-i18next";

export const Mp4ToMp3 = () => {
  const { t } = useTranslation();
  const { loading, loaded, loadFfmpeg, ffmpegRef } = useLoadFfmpeg();
  const fileRef = useRef<File | null>(null);
  const urlRef = useRef<string | null>(null);
  const resultFileNameRef = useRef<string>("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isConvertSuccess, setIsConvertSuccess] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const forceUpdate = useForceUpdate();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      fileRef.current = null;
      forceUpdate();
      return;
    }
    fileRef.current = files[0];
    resultFileNameRef.current = files[0].name.replace(/\.[^.]+$/, ".mp3");
    forceUpdate();
  };

  const handleConvert = async () => {
    if (!fileRef.current) return;
    
    try {
      setIsConverting(true);
      setIsConvertSuccess(false);

      if (!loaded) {
        await loadFfmpeg();
      }

      const ffmpeg = ffmpegRef.current;
      const file = fileRef.current;
      const resultFileName = resultFileNameRef.current;
      const fileReader = new FileReader();

      ffmpeg.on("progress", ({ progress }) => {
        const progressValue = progress * 100;
        setCurrentProgress(progressValue);
        if (progressValue >= 100) {
          setIsConverting(false);
        }
      });

      fileReader.readAsArrayBuffer(file);
      fileReader.onload = async (event) => {
        try {
          if (event.type !== "load") return;
          const fileResult = fileReader.result as ArrayBuffer;
          if (fileResult.byteLength === 0) return;
          await ffmpeg.writeFile(`${file.name}`, new Uint8Array(fileResult));

          await ffmpeg.exec(["-i", `${file.name}`, `${resultFileName}`]);

          const data = await ffmpeg.readFile(`${resultFileName}`);
          const blob = new Blob([data as any], {
            type: "audio/mpeg",
          });
          urlRef.current = URL.createObjectURL(blob);
          setCurrentProgress(100);
          setIsConvertSuccess(true);
          messageApi.success(t("success"));
        } catch (e) {
          console.error(e);
          setIsConverting(false);
          setCurrentProgress(0);
          setIsConvertSuccess(false);
          messageApi.error(t("error"));
        }
      };
    } catch (e) {
      console.error(e);
      setIsConverting(false);
      setCurrentProgress(0);
      setIsConvertSuccess(false);
      messageApi.error(t("error"));
    }
  };

  const handleDownload = () => {
    setIsConverting(false);
    setCurrentProgress(0);
    setIsConvertSuccess(false);
    if (!urlRef.current) return;
    const link = document.createElement("a");
    link.href = urlRef.current;
    link.download = resultFileNameRef.current;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isSuccess = currentProgress >= 100 || isConvertSuccess;
  const isBusy = isConverting || loading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }} className="animate-fade-in">
      <div style={{ textAlign: 'center', padding: '4rem 0', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('title')}
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          {t('subtitle')}
        </p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexWrap: 'wrap', padding: '2rem', gap: '2rem' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <input
            type="file"
            className="file-input"
            onChange={onChange}
            accept="video/*"
            disabled={currentProgress > 0 || isConvertSuccess || isBusy}
          />
        </div>

        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
          {isSuccess ? (
            <button className="btn btn-success" onClick={handleDownload}>
              {t('download')}
            </button>
          ) : (
            <button
              className={`btn ${fileRef.current && !isBusy ? "btn-primary" : ""}`}
              style={{ width: '100%' }}
              onClick={handleConvert}
              disabled={isBusy || !fileRef.current}
            >
              {loading ? t('loading', '加载引擎中...') : isConverting ? t('converting') : t('start')}
            </button>
          )}

          {currentProgress > 0 && (
            <div className="progress-container">
              <div 
                className={`progress-bar ${currentProgress >= 100 ? 'success' : ''}`} 
                style={{ width: `${currentProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
