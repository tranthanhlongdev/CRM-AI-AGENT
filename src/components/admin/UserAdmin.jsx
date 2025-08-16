import { useEffect, useMemo, useState } from "react";
import userService from "../../services/userService";

function UserAdmin() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "user",
    isActive: true,
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    role: "user",
    isActive: true,
  });
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // Load users từ API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const isActiveFilter = status === "all" ? "" : status === "active";
        const roleFilter = role === "all" ? "" : role;
        const res = await userService.listUsers({
          page: 1,
          limit: 10,
          search,
          role: roleFilter,
          isActive: isActiveFilter,
        });
        if (!mounted) return;
        setUsers(res?.data?.users || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Không tải được danh sách người dùng");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [search, role, status]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const okSearch = `${u.username} ${u.fullName} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const okRole = role === "all" || u.role === role;
      const okStatus =
        status === "all" || (status === "active" ? u.isActive : !u.isActive);
      return okSearch && okRole && okStatus;
    });
  }, [users, search, role, status]);

  const openView = (u) => {
    setSelectedUser(u);
    setForm({
      fullName: u.fullName || "",
      email: u.email || "",
      role: u.role || "user",
      isActive: !!u.isActive,
      password: "",
    });
    setModalMode("view");
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (u) => {
    setSelectedUser(u);
    setForm({
      fullName: u.fullName || "",
      email: u.email || "",
      role: u.role || "user",
      isActive: !!u.isActive,
      password: "",
    });
    setModalMode("edit");
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormErrors({});
    setSaving(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (formErrors[name]) setFormErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Email không hợp lệ";
    }
    if (form.password && form.password.length < 6) {
      errs.password = "Mật khẩu tối thiểu 6 ký tự";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const refreshList = async () => {
    try {
      setLoading(true);
      const isActiveFilter = status === "all" ? "" : status === "active";
      const roleFilter = role === "all" ? "" : role;
      const res = await userService.listUsers({
        page: 1,
        limit: 10,
        search,
        role: roleFilter,
        isActive: isActiveFilter,
      });
      setUsers(res?.data?.users || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        role: form.role,
        isActive: form.isActive,
      };
      if (form.password) payload.password = form.password;
      const res = await userService.updateUser(selectedUser.id, payload);
      if (res?.success) {
        await refreshList();
        closeModal();
      } else {
        setFormErrors({ general: res?.message || "Cập nhật thất bại" });
      }
    } catch (e) {
      setFormErrors({ general: e?.message || "Cập nhật thất bại" });
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (u) => {
    setSelectedUser(u);
    setShowDeleteConfirm(true);
  };

  const closeDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await userService.deleteUser(selectedUser.id);
      if (res?.success) {
        await refreshList();
        closeDelete();
      } else {
        setError(res?.message || "Xóa thất bại");
      }
    } catch (e) {
      setError(e?.message || "Xóa thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters + Actions */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo username, tên, email"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-2.5 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Kích hoạt</option>
            <option value="inactive">Khóa</option>
          </select>
          <div className="flex md:justify-end">
            <button
              onClick={() => {
                setCreateForm({ username: "", password: "", fullName: "", email: "", role: "user", isActive: true });
                setCreateErrors({});
                setShowCreate(true);
              }}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Tạo user
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                USERNAME
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                HỌ TÊN
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                EMAIL
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                VAI TRÒ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                TRẠNG THÁI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                HÀNH ĐỘNG
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(loading ? users : filtered).map((u) => (
              <tr key={u.username} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-blue-600">
                  {u.username}
                </td>
                <td className="px-4 py-3">{u.fullName}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      u.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      u.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {u.isActive ? "Kích hoạt" : "Khóa"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openView(u)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Xem"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openEdit(u)}
                      className="text-green-600 hover:text-green-800"
                      title="Sửa"
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
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDelete(u)}
                      className="text-red-600 hover:text-red-800"
                      title="Xóa"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && filtered.length === 0 && (
        <div className="text-center text-sm text-gray-500">
          Không có người dùng phù hợp
        </div>
      )}

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Tạo người dùng</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const errs = {};
                if (!createForm.username) errs.username = "Username bắt buộc";
                if (!createForm.password) errs.password = "Password bắt buộc";
                if (createForm.password && createForm.password.length < 6) errs.password = "Mật khẩu ≥ 6 ký tự";
                if (createForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) errs.email = "Email không hợp lệ";
                setCreateErrors(errs);
                if (Object.keys(errs).length > 0) return;
                setCreating(true);
                try {
                  const res = await userService.createUser(createForm);
                  if (res?.success) {
                    await refreshList();
                    setShowCreate(false);
                  } else {
                    setCreateErrors({ general: res?.message || "Tạo user thất bại" });
                  }
                } catch (e) {
                  setCreateErrors({ general: e?.message || "Tạo user thất bại" });
                } finally {
                  setCreating(false);
                }
              }}
              className="p-5 space-y-4"
            >
              {createErrors.general && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{createErrors.general}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    value={createForm.username}
                    onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${createErrors.username ? "border-red-500" : "border-gray-300"}`}
                  />
                  {createErrors.username && <p className="text-xs text-red-600 mt-1">{createErrors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${createErrors.password ? "border-red-500" : "border-gray-300"}`}
                  />
                  {createErrors.password && <p className="text-xs text-red-600 mt-1">{createErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${createErrors.email ? "border-red-500" : "border-gray-300"}`}
                  />
                  {createErrors.email && <p className="text-xs text-red-600 mt-1">{createErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center text-sm text-gray-700 select-none">
                    <input
                      type="checkbox"
                      checked={createForm.isActive}
                      onChange={(e) => setCreateForm((p) => ({ ...p, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                    />
                    Kích hoạt
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">Hủy</button>
                <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{creating ? "Đang tạo..." : "Tạo user"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === "view"
                    ? "Thông tin người dùng"
                    : "Chỉnh sửa người dùng"}
                </h3>
                <p className="text-xs text-gray-500">
                  Username: {selectedUser?.username}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded"
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
            <div className="p-5 space-y-4">
              {formErrors.general && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {formErrors.general}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  {modalMode === "view" ? (
                    <p className="text-gray-900 py-2">{form.fullName || "-"}</p>
                  ) : (
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {modalMode === "view" ? (
                    <p className="text-gray-900 py-2">{form.email || "-"}</p>
                  ) : (
                    <>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formErrors.email && (
                        <p className="text-xs text-red-600 mt-1">
                          {formErrors.email}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò
                  </label>
                  {modalMode === "view" ? (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        form.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {form.role}
                    </span>
                  ) : (
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </div>
                <div className="flex items-center sm:items-end justify-between">
                  <label className="inline-flex items-center text-sm text-gray-700 select-none">
                    <input
                      disabled={modalMode === "view"}
                      name="isActive"
                      type="checkbox"
                      checked={form.isActive}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                    />
                    Kích hoạt
                  </label>
                </div>
                {modalMode === "edit" && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đặt lại mật khẩu (tùy chọn)
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleFormChange}
                      placeholder="Để trống nếu không đổi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formErrors.password && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.password}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Đóng
              </button>
              {modalMode === "edit" && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b bg-red-50">
              <h3 className="text-base font-semibold text-red-700">
                Xác nhận xóa
              </h3>
            </div>
            <div className="p-5 text-sm text-gray-700">
              Bạn có chắc chắn muốn xóa user {selectedUser?.username}?
            </div>
            <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={closeDelete}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAdmin;
