import { useEffect, useState } from "react";

function DeleteCustomerModal({ isOpen, onClose, onConfirm, customer }) {
  const [reason, setReason] = useState("");
  const [approver, setApprover] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setApprover("");
      setConfirmChecked(true);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer?.cifNumber) {
      setError("Thiếu mã CIF khách hàng");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onConfirm({
        cifNumber: customer.cifNumber,
        lyDoXoa: reason || "Khách hàng yêu cầu xóa",
        nguoiDuyet: approver || "Branch Manager",
        xacNhan: confirmChecked,
      });
    } catch (err) {
      setError(err?.message || "Xóa khách hàng thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold">Xóa khách hàng</h3>
          <button onClick={onClose} className="p-1 hover:opacity-90">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
          <div className="text-sm text-gray-700">
            Bạn có chắc chắn muốn xóa khách hàng
            <span className="font-semibold"> {customer?.hoTen}</span> với mã CIF
            <span className="font-semibold"> {customer?.cifNumber}</span>?
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do xóa
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Nhập lý do xóa..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người duyệt
            </label>
            <input
              type="text"
              value={approver}
              onChange={(e) => setApprover(e.target.value)}
              placeholder="VD: Branch Manager"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <label className="inline-flex items-center text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-red-600 border-gray-300 rounded"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
            />
            Tôi xác nhận muốn xóa khách hàng này
          </label>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
        </form>

        <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {submitting && (
              <svg
                className="animate-spin h-4 w-4 text-white mr-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            Xóa khách hàng
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteCustomerModal;
