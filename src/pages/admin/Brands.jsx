import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands } from '../../features/admin/metadataSlice';
import { Plus, Edit, Trash2, Search, X, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const Brands = () => {
  const dispatch = useDispatch();
  const { brands = [], isLoading } = useSelector((state) => state.metadata || {});

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return { Authorization: `Bearer ${token}` };
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditMode(false);
    setCurrentBrand(null);
  };

  const handleEdit = (brand) => {
    setEditMode(true);
    setCurrentBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;

    try {
      await axios.delete(`${API_URL}/brands/${id}`, {
        headers: getAuthHeader(),
      });
      toast.success('Xóa thương hiệu thành công');
      dispatch(fetchBrands());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editMode && currentBrand) {
        await axios.put(`${API_URL}/brands/${currentBrand.id}`, formData, {
          headers: getAuthHeader(),
        });
        toast.success('Cập nhật thương hiệu thành công');
      } else {
        await axios.post(`${API_URL}/brands`, formData, {
          headers: getAuthHeader(),
        });
        toast.success('Thêm thương hiệu thành công');
      }
      setShowModal(false);
      resetForm();
      dispatch(fetchBrands());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý thương hiệu</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm thương hiệu
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm thương hiệu..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium w-16">#</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Tên thương hiệu</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Mô tả</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium w-32">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Không tìm thấy thương hiệu nào</p>
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand, index) => (
                    <tr key={brand.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800">{brand.name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {brand.description || <span className="text-gray-400 italic">Chưa có mô tả</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(brand)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total Count */}
      {filteredBrands.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{filteredBrands.length}</span> thương hiệu
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editMode ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên thương hiệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                  placeholder="Ví dụ: Nike, Adidas, Puma..."
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition resize-none"
                  rows="4"
                  placeholder="Nhập mô tả về thương hiệu..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} ký tự
                </p>
              </div>

              {/* Preview */}
              {formData.name && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2 font-medium">Preview:</p>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800">{formData.name}</h4>
                    {formData.description && (
                      <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>{editMode ? 'Cập nhật' : 'Thêm mới'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;