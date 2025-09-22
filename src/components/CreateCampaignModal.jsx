import { useEffect, useMemo, useState } from "react";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function CreateCampaignModal({ isOpen, onClose, onSaved, prefillCustomer }) {
  const [form, setForm] = useState({
    name: "",
    channel: "Inbound",
    priority: "Normal",
    status: "New",
    customerCif: "",
    customerName: "",
    phone: "",
    branch: "",
    segment: "",
    category: "General",
    product: "",
    assignedTo: "",
    startTime: "",
    dueTime: "",
    description: "",
    tags: "",
    source: "CallCenter",
    slaHours: 24,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    // Prefill from customer if provided
    const newForm = { ...form };
    if (prefillCustomer) {
      newForm.customerCif =
        prefillCustomer.cifNumber || prefillCustomer.cif || "";
      newForm.customerName =
        prefillCustomer.hoTen || prefillCustomer.name || "";
      newForm.phone =
        prefillCustomer.soDienThoai || prefillCustomer.phone || "";
      newForm.branch = prefillCustomer.chiNhanh || "";
      newForm.segment = prefillCustomer.segmentKH || "";
    }
    setForm(newForm);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Bắt buộc";
    if (!form.channel) e.channel = "Bắt buộc";
    if (!form.priority) e.priority = "Bắt buộc";
    if (!form.status) e.status = "Bắt buộc";
    if (!form.customerCif && !form.phone)
      e.customerCif = "CIF hoặc SĐT là bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name,
      channel: form.channel,
      priority: form.priority,
      status: form.status,
      customer: {
        cifNumber: form.customerCif || null,
        name: form.customerName || null,
        phone: form.phone || null,
        branch: form.branch || null,
        segment: form.segment || null,
      },
      classification: {
        category: form.category || null,
        product: form.product || null,
      },
      assignedTo: form.assignedTo || null,
      schedule: {
        startTime: form.startTime || null,
        dueTime: form.dueTime || null,
        slaHours: Number(form.slaHours) || 0,
      },
      description: form.description || "",
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      source: form.source || "CallCenter",
    };
    onSaved?.(payload);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            Tạo campaign (Ticket)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
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
        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-auto p-5 space-y-4"
        >
          {/* Basic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tên campaign" required>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  errors.name ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="VD: Inbound - Ưu đãi thẻ 09/2025"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </Field>
            <Field label="Kênh" required>
              <select
                value={form.channel}
                onChange={(e) => handleChange("channel", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  errors.channel ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option>Inbound</option>
                <option>Outbound</option>
                <option>Digital</option>
              </select>
            </Field>
            <Field label="Độ ưu tiên" required>
              <select
                value={form.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  errors.priority ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </Field>
            <Field label="Trạng thái" required>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  errors.status ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option>New</option>
                <option>In Progress</option>
                <option>Pending</option>
                <option>Closed</option>
              </select>
            </Field>
          </div>

          {/* Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="CIF khách hàng">
              <input
                value={form.customerCif}
                onChange={(e) => handleChange("customerCif", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  errors.customerCif ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="CIF001234567"
              />
              {errors.customerCif && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.customerCif}
                </p>
              )}
            </Field>
            <Field label="Tên khách hàng">
              <input
                value={form.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Nguyễn Văn A"
              />
            </Field>
            <Field label="Số điện thoại">
              <input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="09xxxxxxxx"
              />
            </Field>
            <Field label="Chi nhánh">
              <input
                value={form.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="CN Cầu Giấy"
              />
            </Field>
            <Field label="Segment">
              <select
                value={form.segment}
                onChange={(e) => handleChange("segment", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">—</option>
                <option>VIP</option>
                <option>Premium</option>
                <option>Standard</option>
                <option>Basic</option>
              </select>
            </Field>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Nhóm (category)">
              <input
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="General / Complaint / Request"
              />
            </Field>
            <Field label="Sản phẩm (product)">
              <input
                value={form.product}
                onChange={(e) => handleChange("product", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Thẻ tín dụng / Vay / TKTT ..."
              />
            </Field>
            <Field label="Phân công (assigned to)">
              <input
                value={form.assignedTo}
                onChange={(e) => handleChange("assignedTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="username / team"
              />
            </Field>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Bắt đầu">
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </Field>
            <Field label="Hạn xử lý">
              <input
                type="datetime-local"
                value={form.dueTime}
                onChange={(e) => handleChange("dueTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </Field>
            <Field label="SLA (giờ)">
              <input
                type="number"
                min={0}
                value={form.slaHours}
                onChange={(e) => handleChange("slaHours", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </Field>
          </div>

          {/* Description + Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Field label="Mô tả / Nội dung">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                  placeholder="Mô tả ngắn về campaign / ticket"
                />
              </Field>
            </div>
            <Field label="Tags (phân tách bằng dấu phẩy)">
              <input
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="vip, inbound, uu-dai"
              />
            </Field>
          </div>

          {/* Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Nguồn (source)">
              <select
                value={form.source}
                onChange={(e) => handleChange("source", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option>CallCenter</option>
                <option>Web</option>
                <option>Mobile</option>
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Lưu campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCampaignModal;
