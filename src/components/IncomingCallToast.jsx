import { useEffect, useRef, useState } from "react";

function IncomingCallToast({
  isOpen,
  callData,
  onAccept,
  onDecline,
  durationMs = 20000,
}) {
  const [remaining, setRemaining] = useState(durationMs);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setRemaining(durationMs);
    const startedAt = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const rem = Math.max(0, durationMs - elapsed);
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(intervalRef.current);
        onDecline?.();
      }
    }, 200);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, durationMs, onDecline]);

  if (!isOpen) return null;

  const progress = Math.max(0, Math.min(100, (remaining / durationMs) * 100));

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in-right">
      <div className="w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Cuộc gọi đến</p>
              <p className="text-xs text-blue-100">
                Thời gian còn: {Math.ceil(remaining / 1000)}s
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
              {(callData?.hoTen || callData?.name || "KH")
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {callData?.hoTen || callData?.name || "Khách hàng"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {callData?.soDienThoai || callData?.phone} • CIF:{" "}
                {callData?.cifNumber || callData?.cif}
              </p>
            </div>
          </div>
          {callData?.note && (
            <p className="mt-2 text-xs text-gray-600 line-clamp-2">
              {callData.note}
            </p>
          )}
          <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={onDecline}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6.225 12.225l11.55-11.55M17.775 12.225l-11.55-11.55"
                />
              </svg>
              Từ chối
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-4.553a1.5 1.5 0 012.121 0l1 1a1.5 1.5 0 010 2.121L18 13m-3-3l-6 6a2.121 2.121 0 01-3 0l-2-2a2.121 2.121 0 013-3l1 1 5-5"
                />
              </svg>
              Nhận cuộc gọi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallToast;
