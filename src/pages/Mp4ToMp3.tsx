import { useLoadFfmpeg } from "../hooks/useLoadFfmpeg.ts";
import { PageLoading } from "../compoents";

export const Mp4ToMp3 = () => {
  const { loading, ffmpegRef } = useLoadFfmpeg();

  return loading ? (
    <PageLoading />
  ) : (
    <div className="flex flex-col items-center">
      <div className="text-center py-20">
        <h2 className="text-3xl text-red-500">声音提取器</h2>
        <span className="text-base text-slate-600">
          在线免费转换您的mp4文件为mp3文件
        </span>
      </div>

      <div className="card card-side bg-neutral-600 w-[70%] shadow-xl">
        <div className="card-body w-[70%]">
          <input
            type="file"
            className="file-input file-input-bordered w-full max-w-lg self-end"
          />
        </div>
        <div className="card-body w-[30%]">
          <button className="btn btn-primary">转换</button>
        </div>
      </div>
    </div>
  );
};
