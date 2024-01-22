import { useLoadFfmpeg } from "../hooks/useLoadFfmpeg.ts";
import { PageLoading } from "../compoents";
import { ChangeEvent, useRef, useState } from "react";
import { useForceUpdate } from "../hooks/useForceUpdate.ts";

export const Mp4ToMp3 = () => {
  const { loading, ffmpegRef } = useLoadFfmpeg();
  const fileRef = useRef<File | null>(null); // 用于保存文件列表
  const urlRef = useRef<string | null>(null); // 用于保存blob的URL
  const resultFileNameRef = useRef<string>(""); // 用于保存转换后的文件名
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isConvertSuccess, setIsConvertSuccess] = useState(false); // 是否转换成功

  const forceUpdate = useForceUpdate();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (files.length === 0) {
      fileRef.current = null;
      forceUpdate();
      return;
    }
    fileRef.current = files?.[0];
    // 保存转换后的文件名 把文件后缀名改为mp3  /\.[^.]+$/ 匹配最后一个.后面的内容
    resultFileNameRef.current = files?.[0].name.replace(/\.[^.]+$/, ".mp3");
    forceUpdate();
  };

  const handleConvert = async () => {
    if (!fileRef.current) return;
    try {
      setIsConvertSuccess(false);
      const ffmpeg = ffmpegRef.current;
      const file = fileRef.current;
      const resultFileName = resultFileNameRef.current;
      const fileReader = new FileReader();

      // 进度条
      ffmpeg.on("progress", ({ progress }) => {
        setCurrentProgress(progress * 100);
        setIsConvertSuccess(true);
      });

      // 1. 读取文件
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = async (event) => {
        if (event.type !== "load") return;
        const fileResult = fileReader.result as ArrayBuffer;
        if (fileResult.byteLength === 0) return;
        await ffmpeg.writeFile(`${file.name}`, new Uint8Array(fileResult));

        // 2. 转换文件
        await ffmpeg.exec(["-i", `${file.name}`, `${resultFileName}`]);

        const data = await ffmpeg.readFile(`${resultFileName}`);
        const blob = new Blob([(data as Uint8Array).buffer], {
          type: "audio/mpeg",
        });
        urlRef.current = URL.createObjectURL(blob); // 保存下载blob的URL
        setIsConvertSuccess(true);
      };
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async () => {
    setCurrentProgress(0);
    setIsConvertSuccess(false);
    if (!urlRef.current) return;
    const link = document.createElement("a");
    link.href = urlRef.current;
    link.download = resultFileNameRef.current; // 设定下载文件的名称
    document.body.appendChild(link);
    link.click(); // 模拟点击
    document.body.removeChild(link); // 删除这个临时的a元素
  };

  const isSuccess = currentProgress >= 100 || isConvertSuccess;

  return loading ? (
    <PageLoading />
  ) : (
    <div className="flex flex-col items-center">
      <div className="text-center py-20">
        <h2 className="text-3xl text-red-500">声音提取器</h2>
        <span className="text-base text-slate-600">
          在线免费提取您的视频文件(mp4、mov...)为mp3文件
        </span>
      </div>

      <div className="card card-side bg-neutral-600 w-[70%] shadow-xl">
        <div className="card-body w-[70%]">
          <input
            type="file"
            className="file-input file-input-bordered w-full max-w-lg self-end"
            onChange={onChange}
            accept="video/mp4,video/*"
            disabled={currentProgress > 0 || isConvertSuccess}
          />
        </div>

        <div className="card-body w-[30%]">
          {isSuccess ? (
            <button className="btn btn-success" onClick={handleDownload}>
              下载
            </button>
          ) : (
            <button
              className={`btn ${fileRef.current ? "btn-primary" : "btn-disabled"}`}
              onClick={handleConvert}
            >
              提取
            </button>
          )}

          {currentProgress > 0 && (
            <progress
              className={`progress w-full ${isSuccess ? "progress-success" : "progress-info"}`}
              value={currentProgress}
              max="100"
            />
          )}
        </div>
      </div>
    </div>
  );
};
