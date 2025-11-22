import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllProducts,
  fetchProductVariants,
  createProduct,
  createProductVariant,
  updateProduct,
  updateProductVariant,
  deleteProduct,
  deleteProductVariant,
  clearMessages,
  setCurrentProduct,
  clearProductVariants,
} from "../../features/admin/adminProductsSlice";
import {
  fetchBrands,
  fetchCategories,
  fetchLabels,
  fetchColors,
  fetchSizes,
} from "../../features/admin/metadataSlice";
import { Plus, Edit, Trash2, Search, X, ImagePlus, Trash } from "lucide-react";
import { toast } from "react-toastify";

const Products = () => {
  const dispatch = useDispatch();
  const {
    products = [],
    currentProduct,
    productVariants = [],
    isLoading,
    error,
    success,
  } = useSelector((state) => state.adminProducts || {});
  const {
    brands = [],
    categories = [],
    labels = [],
    colors = [],
    sizes = [],
  } = useSelector((state) => state.metadata || {});

  // Lấy thông tin user để check role
  const { user } = useSelector((state) => state.auth);
  const isOwner = user?.role === "OWNER";

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);

  // Product Form Data
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "", // Giá gốc - chỉ cho OWNER
    discountPercent: 0,
    brandId: "",
    categoryIds: [],
    labelIds: [],
    images: [{ imageUrl: "", altText: "" }],
  });

  // Variant Form Data
  const [variants, setVariants] = useState([
    {
      colorId: "",
      sizeId: "",
      stock: "",
      images: [""],
    },
  ]);

  const [editingVariants, setEditingVariants] = useState({});

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchBrands());
    dispatch(fetchCategories());
    dispatch(fetchLabels());
    dispatch(fetchColors());
    dispatch(fetchSizes());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearMessages());

      if (success.includes("Tạo sản phẩm thành công") && currentProduct) {
        setModalStep(2);
      }

      if (success.includes("Thêm biến thể thành công")) {
        setVariants([{ colorId: "", sizeId: "", stock: "", images: [""] }]);
      }

      if (success.includes("Cập nhật tồn kho thành công")) {
        if (currentProduct) {
          dispatch(fetchProductVariants(currentProduct.id));
        }
        setEditingVariants({});
      }
    }
  }, [error, success, dispatch, currentProduct]);

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      costPrice: "",
      discountPercent: 0,
      brandId: "",
      categoryIds: [],
      labelIds: [],
      images: [{ imageUrl: "", altText: "" }],
    });
    setVariants([{ colorId: "", sizeId: "", stock: "", images: [""] }]);
    setEditingVariants({});
    setModalStep(1);
    setIsEditMode(false);
    dispatch(setCurrentProduct(null));
    dispatch(clearProductVariants());
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      dispatch(deleteProduct(id));
    }
  };

  const handleEdit = async (product) => {
    try {
      const token = localStorage.getItem("access_token"); 
      const response = await fetch(
        `http://localhost:8080/api/products/${product.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.code === 1000) {
        const productDetail = data.result;

        setProductForm({
          name: productDetail.name || "",
          description: productDetail.description || "",
          price: productDetail.price?.price || 0,
          costPrice: productDetail.price?.cost_price || "", // ← Đúng rồi
          discountPercent: productDetail.price?.discount_percent || 0,
          brandId: productDetail.brandId || productDetail.brand?.id || "",
          categoryIds:
            productDetail.categoryIds ||
            productDetail.categories?.map((c) => c.id) ||
            [],
          labelIds:
            productDetail.labelIds ||
            productDetail.labels?.map((l) => l.id) ||
            [],
          images: productDetail.images?.map((img) => ({
            id: img.id || null,
            imageUrl: img.image_url || "",
            altText: img.alt_text || "",
          })) || [{ imageUrl: "", altText: "" }],
        });

        dispatch(setCurrentProduct(productDetail));
        setIsEditMode(true);
        setModalStep(1);
        setShowModal(true);
      } else {
        toast.error(data.message || "Không thể lấy thông tin sản phẩm");
      }
    } catch (error) {
      console.error("Error fetching product detail:", error);
      toast.error("Lỗi khi lấy thông tin sản phẩm");
    }
  };

  const handleEditVariants = (product) => {
    dispatch(setCurrentProduct(product));
    dispatch(fetchProductVariants(product.id));
    setIsEditMode(true);
    setModalStep(3);
    setShowModal(true);
  };

  const handleProductChange = (field, value) => {
    setProductForm({ ...productForm, [field]: value });
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...productForm.images];
    newImages[index][field] = value;
    setProductForm({ ...productForm, images: newImages });
  };

  const addImageField = () => {
    setProductForm({
      ...productForm,
      images: [...productForm.images, { imageUrl: "", altText: "" }],
    });
  };

  const removeImageField = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages });
  };

  const handleCategoryToggle = (categoryId) => {
    const newCategories = productForm.categoryIds.includes(categoryId)
      ? productForm.categoryIds.filter((id) => id !== categoryId)
      : [...productForm.categoryIds, categoryId];
    setProductForm({ ...productForm, categoryIds: newCategories });
  };

  const handleLabelToggle = (labelId) => {
    const newLabels = productForm.labelIds.includes(labelId)
      ? productForm.labelIds.filter((id) => id !== labelId)
      : [...productForm.labelIds, labelId];
    setProductForm({ ...productForm, labelIds: newLabels });
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();

    if (!productForm.brandId) {
      toast.error("Vui lòng chọn thương hiệu");
      return;
    }
    if (productForm.categoryIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 danh mục");
      return;
    }

    // Validate giá gốc cho OWNER
    if (
      isOwner &&
      (!productForm.costPrice || Number(productForm.costPrice) <= 0)
    ) {
      toast.error("Vui lòng nhập giá gốc hợp lệ");
      return;
    }

    // Validate giá bán phải lớn hơn giá gốc (nếu là OWNER)
    if (isOwner && Number(productForm.price) <= Number(productForm.costPrice)) {
      toast.error("Giá bán phải lớn hơn giá gốc");
      return;
    }

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      discountPercent: Number(productForm.discountPercent),
      brandId: Number(productForm.brandId),
      categoryIds: productForm.categoryIds.map(Number),
      labelIds: productForm.labelIds.map(Number),
    };

    // Chỉ thêm costPrice nếu là OWNER
    if (isOwner) {
      payload.costPrice = Number(productForm.costPrice);
    }

    if (!currentProduct || !isEditMode) {
      dispatch(createProduct(payload));
    } else {
      dispatch(updateProduct({ id: currentProduct.id, ...payload })).then(
        () => {
          setShowModal(false);
          resetForm();
          dispatch(fetchAllProducts());
        }
      );
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleVariantImageChange = (variantIndex, imageIndex, value) => {
    const newVariants = [...variants];
    newVariants[variantIndex].images[imageIndex] = value;
    setVariants(newVariants);
  };

  const addVariantImageField = (variantIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].images.push("");
    setVariants(newVariants);
  };

  const removeVariantImageField = (variantIndex, imageIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].images = newVariants[variantIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { colorId: "", sizeId: "", stock: "", images: [""] },
    ]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantSubmit = (variantIndex) => {
    const variant = variants[variantIndex];

    if (!variant.colorId || !variant.sizeId || !variant.stock) {
      toast.error("Vui lòng điền đầy đủ thông tin biến thể");
      return;
    }

    const payload = {
      productId: currentProduct.id,
      colorId: Number(variant.colorId),
      sizeId: Number(variant.sizeId),
      stock: Number(variant.stock),
      images: variant.images.filter((img) => img.trim() !== ""),
    };

    dispatch(createProductVariant(payload));
  };

  const handleUpdateVariant = (variantId, formData) => {
    if (!formData.colorId || !formData.sizeId || !formData.stock) {
      toast.error("Vui lòng điền đầy đủ thông tin biến thể");
      return;
    }

    if (Number(formData.stock) < 0) {
      toast.error("Số lượng tồn kho không thể âm");
      return;
    }

    const payload = {
      variantId,
      colorId: Number(formData.colorId),
      sizeId: Number(formData.sizeId),
      stock: Number(formData.stock),
      images: formData.images.filter((img) => img.trim() !== ""),
    };

    dispatch(updateProductVariant(payload)).then((result) => {
      if (result.type === "adminProducts/updateVariant/fulfilled") {
        if (currentProduct) {
          dispatch(fetchProductVariants(currentProduct.id));
        }
      }
    });
  };

  const handleDeleteVariant = (variantId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa biến thể này?")) {
      dispatch(deleteProductVariant(variantId));
    }
  };

  const finishAddingProduct = () => {
    toast.success("Hoàn tất thêm sản phẩm!");
    setShowModal(false);
    resetForm();
    dispatch(fetchAllProducts());
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Quản lý sản phẩm{" "}
          {isOwner && <span className="text-sm text-blue-600">(Owner)</span>}
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm sản phẩm
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
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading && !showModal ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Tên sản phẩm
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Thương hiệu
                  </th>
                  {isOwner && (
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Giá gốc
                    </th>
                  )}
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Giá bán
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Giảm giá
                  </th>
                  {/* {isOwner && (
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Lợi nhuận
                    </th>
                  )} */}
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isOwner ? "7" : "5"}
                      className="text-center py-12 text-gray-500"
                    >
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
filteredProducts.map((product) => {
  const price = product.price?.price || 0;
  const costPrice = product.price?.cost_price || 0;

  return (
    <tr key={product.id} className="border-b hover:bg-gray-50">
      <td className="py-3 px-4 font-medium">{product.name}</td>
      <td className="py-3 px-4">{product.brand?.name || "N/A"}</td>
      
      {isOwner && (
        <td className="py-3 px-4 text-gray-600">
          {costPrice > 0 ? costPrice.toLocaleString() : "N/A"} ₫
        </td>
      )}
      
      <td className="py-3 px-4 font-semibold">
        {price.toLocaleString()} ₫
      </td>
      
      <td className="py-3 px-4">
        {product.price?.discount_percent || 0}%
      </td>
      
      <td className="py-3 px-4 flex gap-2">
        <button
          onClick={() => handleEdit(product)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
          title="Sửa sản phẩm"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleEditVariants(product)}
          className="p-2 text-green-600 hover:bg-green-50 rounded transition"
          title="Sửa biến thể"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleDelete(product.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
          title="Xóa sản phẩm"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
})
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Step 1: Product Info */}
      {showModal && modalStep === 1 && productForm.images.length > 0 && (
        <ProductFormModal
          productForm={productForm}
          handleProductChange={handleProductChange}
          handleImageChange={handleImageChange}
          addImageField={addImageField}
          removeImageField={removeImageField}
          handleCategoryToggle={handleCategoryToggle}
          handleLabelToggle={handleLabelToggle}
          handleProductSubmit={handleProductSubmit}
          brands={brands}
          categories={categories}
          labels={labels}
          isLoading={isLoading}
          isEditMode={isEditMode}
          isOwner={isOwner}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
        />
      )}

      {/* Modal - Step 2: Variants (Thêm mới) */}
      {showModal && modalStep === 2 && currentProduct && (
        <VariantFormModal
          currentProduct={currentProduct}
          variants={variants}
          handleVariantChange={handleVariantChange}
          handleVariantImageChange={handleVariantImageChange}
          addVariantImageField={addVariantImageField}
          removeVariantImageField={removeVariantImageField}
          addVariant={addVariant}
          removeVariant={removeVariant}
          handleVariantSubmit={handleVariantSubmit}
          colors={colors}
          sizes={sizes}
          isLoading={isLoading}
          onFinish={finishAddingProduct}
        />
      )}

      {/* Modal - Step 3: Edit Variants */}
      {showModal && modalStep === 3 && currentProduct && (
        <EditVariantsModal
          currentProduct={currentProduct}
          productVariants={productVariants}
          colors={colors}
          sizes={sizes}
          handleUpdateVariant={handleUpdateVariant}
          handleDeleteVariant={handleDeleteVariant}
          isLoading={isLoading}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
        />
      )}
    </div>
  );
};

// Component con cho Product Form Modal
const ProductFormModal = ({
  productForm,
  handleProductChange,
  handleImageChange,
  addImageField,
  removeImageField,
  handleCategoryToggle,
  handleLabelToggle,
  handleProductSubmit,
  brands,
  categories,
  labels,
  isLoading,
  isEditMode,
  isOwner,
  onClose,
}) => (
  <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
        <h2 className="text-2xl font-bold">
          {isEditMode ? "Sửa sản phẩm" : "Bước 1: Thông tin sản phẩm"}
          {isOwner && (
            <span className="text-sm text-blue-600 ml-2">(Owner Mode)</span>
          )}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => handleProductChange("name", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={productForm.description}
              onChange={(e) =>
                handleProductChange("description", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              rows="3"
            />
          </div>

          {/* Giá gốc - CHỈ hiển thị cho OWNER */}
          {isOwner && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá gốc (Giá nhập) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={productForm.costPrice}
                  onChange={(e) =>
                    handleProductChange("costPrice", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50"
                  required
                  min="0"
                  placeholder="Nhập giá nhập vào"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  ₫
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Giá nhập sản phẩm từ nhà cung cấp
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá bán *{" "}
              {isOwner && (
                <span className="text-xs text-gray-500">
                  (phải lớn hơn giá gốc)
                </span>
              )}
            </label>
            <input
              type="number"
              value={productForm.price}
              onChange={(e) => handleProductChange("price", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              required
              min={isOwner ? Number(productForm.costPrice) + 1 : 0}
            />
            {isOwner && productForm.costPrice && productForm.price && (
              <p className="text-xs text-green-600 mt-1">
                Lợi nhuận dự kiến:{" "}
                {(
                  // (giá bán - giá bán * giảm giá) - giá nhập
                  Number(productForm.price- (productForm.price*productForm.discountPercent)/100) - Number(productForm.costPrice)
                ).toLocaleString()}{" "}
                ₫ (
                {(
                  // (lợi nhuận / giá nhập) * 100
                  ((Number(productForm.price- (productForm.price*productForm.discountPercent)/100) - Number(productForm.costPrice)) /
                    Number(productForm.costPrice)) *
                  100
                ).toFixed(1)}
                %)
              </p>
            )}
          </div>

          <div className={isOwner ? "md:col-span-2" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giảm giá (%)
            </label>
            <input
              type="number"
              value={productForm.discountPercent}
              onChange={(e) =>
                handleProductChange("discountPercent", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              min="0"
              max="100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thương hiệu *
            </label>
            <select
              value={productForm.brandId}
              onChange={(e) => handleProductChange("brandId", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              required
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục * (chọn ít nhất 1)
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.id)}
                className={`px-4 py-2 rounded-lg border transition ${
                  productForm.categoryIds.includes(category.id)
                    ? "bg-sky-500 text-white border-sky-500"
                    : "bg-white text-gray-700 border-gray-300 hover:border-sky-500"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhãn (tùy chọn)
          </label>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => handleLabelToggle(label.id)}
                className={`px-4 py-2 rounded-lg border transition ${
                  productForm.labelIds.includes(label.id)
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-white text-gray-700 border-gray-300 hover:border-purple-500"
                }`}
              >
                {label.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh sản phẩm *
          </label>
          {productForm.images.map((image, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="URL hình ảnh"
                value={image.imageUrl}
                onChange={(e) =>
                  handleImageChange(index, "imageUrl", e.target.value)
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
              <input
                type="text"
                placeholder="Alt text"
                value={image.altText}
                onChange={(e) =>
                  handleImageChange(index, "altText", e.target.value)
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
              {productForm.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="flex items-center text-sky-600 hover:text-sky-700 text-sm"
          >
            <ImagePlus className="w-4 h-4 mr-1" />
            Thêm hình ảnh
          </button>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition disabled:opacity-50"
          >
            {isLoading
              ? "Đang xử lý..."
              : isEditMode
              ? "Cập nhật"
              : "Tiếp theo: Thêm biến thể"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Component con cho Variant Form Modal (Thêm mới)
const VariantFormModal = ({
  currentProduct,
  variants,
  handleVariantChange,
  handleVariantImageChange,
  addVariantImageField,
  removeVariantImageField,
  addVariant,
  removeVariant,
  handleVariantSubmit,
  colors,
  sizes,
  isLoading,
  onFinish,
}) => (
  <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-2xl font-bold">Bước 2: Thêm biến thể</h2>
          <p className="text-sm text-gray-600 mt-1">
            Sản phẩm: <span className="font-medium">{currentProduct.name}</span>
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Bạn có muốn kết thúc và đóng modal?")) {
              onFinish();
            }
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {variants.map((variant, variantIndex) => (
          <div
            key={variantIndex}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Biến thể #{variantIndex + 1}
              </h3>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(variantIndex)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded"
                >
                  <Trash className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc *
                </label>
                <select
                  value={variant.colorId}
                  onChange={(e) =>
                    handleVariantChange(variantIndex, "colorId", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                >
                  <option value="">Chọn màu</option>
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kích thước *
                </label>
                <select
                  value={variant.sizeId}
                  onChange={(e) =>
                    handleVariantChange(variantIndex, "sizeId", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                >
                  <option value="">Chọn size</option>
                  {sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tồn kho *
                </label>
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) =>
                    handleVariantChange(variantIndex, "stock", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh biến thể
              </label>
              {variant.images.map((image, imageIndex) => (
                <div key={imageIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="URL hình ảnh biến thể"
                    value={image}
                    onChange={(e) =>
                      handleVariantImageChange(
                        variantIndex,
                        imageIndex,
                        e.target.value
                      )
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                  {variant.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeVariantImageField(variantIndex, imageIndex)
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addVariantImageField(variantIndex)}
                className="flex items-center text-sky-600 hover:text-sky-700 text-sm"
              >
                <ImagePlus className="w-4 h-4 mr-1" />
                Thêm hình ảnh
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => handleVariantSubmit(variantIndex)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {isLoading ? "Đang lưu..." : "Lưu biến thể này"}
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-sky-500 hover:text-sky-500 transition"
        >
          + Thêm biến thể mới
        </button>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onFinish}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Component con cho Edit Variants Modal (Sửa biến thể có sẵn)
const EditVariantsModal = ({
  currentProduct,
  productVariants,
  colors,
  sizes,
  handleUpdateVariant,
  handleDeleteVariant,
  isLoading,
  onClose,
}) => {
  const [editingVariant, setEditingVariant] = useState(null);
  const [editForm, setEditForm] = useState({
    colorId: "",
    sizeId: "",
    stock: "",
    images: [],
  });

  const startEdit = (variant) => {
    setEditingVariant(variant.id);
    setEditForm({
      colorId: variant.color?.id || "",
      sizeId: variant.size?.id || "",
      stock: variant.stock || "",
      images: variant.images || [],
    });
  };

  const cancelEdit = () => {
    setEditingVariant(null);
    setEditForm({
      colorId: "",
      sizeId: "",
      stock: "",
      images: [],
    });
  };

  const saveEdit = (variantId) => {
    handleUpdateVariant(variantId, editForm);
    cancelEdit();
  };

  const handleImageChange = (index, value) => {
    const newImages = [...editForm.images];
    newImages[index] = value;
    setEditForm({ ...editForm, images: newImages });
  };

  const addImage = () => {
    setEditForm({ ...editForm, images: [...editForm.images, ""] });
  };

  const removeImage = (index) => {
    const newImages = editForm.images.filter((_, i) => i !== index);
    setEditForm({ ...editForm, images: newImages });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold">Quản lý biến thể sản phẩm</h2>
            <p className="text-sm text-gray-600 mt-1">
              Sản phẩm:{" "}
              <span className="font-medium">{currentProduct.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {productVariants.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có biến thể nào cho sản phẩm này</p>
            </div>
          ) : (
            productVariants.map((variant) => {
              const isEditing = editingVariant === variant.id;

              return (
                <div
                  key={variant.id}
                  className="border border-gray-200 rounded-lg p-5 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {variant.color?.name || "N/A"} -{" "}
                        {variant.size?.name || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Mã: #{variant.id} | Tồn kho:{" "}
                        <span className="font-semibold text-blue-600">
                          {variant.stock}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(variant)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                            title="Sửa biến thể"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded"
                            title="Xóa biến thể"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Màu sắc *
                          </label>
                          <select
                            value={editForm.colorId}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                colorId: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                          >
                            <option value="">Chọn màu</option>
                            {colors.map((color) => (
                              <option key={color.id} value={color.id}>
                                {color.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kích thước *
                          </label>
                          <select
                            value={editForm.sizeId}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                sizeId: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                          >
                            <option value="">Chọn size</option>
                            {sizes.map((size) => (
                              <option key={size.id} value={size.id}>
                                {size.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tồn kho *
                          </label>
                          <input
                            type="number"
                            value={editForm.stock}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                stock: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hình ảnh biến thể
                        </label>
                        {editForm.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="URL hình ảnh"
                              value={image}
                              onChange={(e) =>
                                handleImageChange(imageIndex, e.target.value)
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                            {editForm.images.length > 0 && (
                              <button
                                type="button"
                                onClick={() => removeImage(imageIndex)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addImage}
                          className="flex items-center text-sky-600 hover:text-sky-700 text-sm mt-2"
                        >
                          <ImagePlus className="w-4 h-4 mr-1" />
                          Thêm hình ảnh
                        </button>
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(variant.id)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        >
                          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Màu sắc
                          </label>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{
                                backgroundColor:
                                  variant.color?.hexCode || "#ccc",
                              }}
                            />
                            <span className="text-gray-800 font-medium">
                              {variant.color?.name || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Kích thước
                          </label>
                          <span className="text-gray-800 font-medium">
                            {variant.size?.name || "N/A"}
                          </span>
                        </div>
                      </div>

                      {variant.images && variant.images.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh biến thể
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {variant.images.map((image, idx) => (
                              <div
                                key={idx}
                                className="relative w-24 h-24 border rounded overflow-hidden bg-gray-100"
                              >
                                <img
                                  src={`${image}`}
                                  alt={`Variant ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/96?text=No+Image";
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
