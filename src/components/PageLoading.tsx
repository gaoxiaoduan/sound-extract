export const PageLoading = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-96">
      <span className="loading loading-ring loading-lg" />
      <span className="text-sm text-slate-600">
        加载时间较长，请耐心等待...
      </span>
    </div>
  );
};
