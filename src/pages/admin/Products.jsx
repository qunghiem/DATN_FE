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
    costPrice: "",
    discountPercent: 0,
    brandId: "",
    categoryIds: [],
    labelIds: [],
    images: [], // Array of File objects
    imageAltTexts: [""], // Array of alt texts
    imagePreviews: [], // Array of preview URLs
  });

  // Variant Form Data
  const [variants, setVariants] = useState([
    {
      colorId: "",
      sizeId: "",
      stock: "",
      images: [], // Array of File objects
      imagePreviews: [], // Array of preview URLs
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
        setVariants([{ 
          colorId: "", 
          sizeId: "", 
          stock: "", 
          images: [],
          imagePreviews: []
        }]);
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
      images: [],
      imageAltTexts: [""],
      imagePreviews: [],
    });
    setVariants([{ 
      colorId: "", 
      sizeId: "", 
      stock: "", 
      images: [],
      imagePreviews: []
    }]);
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
          costPrice: productDetail.price?.cost_price || "",
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
          images: [],
          imageAltTexts: productDetail.images?.map((img) => img.alt_text || "") || [""],
          imagePreviews: productDetail.images?.map((img) => img.image_url || "") || [],
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

  // Xử lý upload ảnh sản phẩm
  const handleProductImageChange = (index, file) => {
    if (file && file.type.startsWith('image/')) {
      const newImages = [...productForm.images];
      const newPreviews = [...productForm.imagePreviews];
      
      newImages[index] = file;
      newPreviews[index] = URL.createObjectURL(file);
      
      setProductForm({ 
        ...productForm, 
        images: newImages,
        imagePreviews: newPreviews
      });
    } else {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
    }
  };

  const handleAltTextChange = (index, value) => {
    const newAltTexts = [...productForm.imageAltTexts];
    newAltTexts[index] = value;
    setProductForm({ ...productForm, imageAltTexts: newAltTexts });
  };

  const addImageField = () => {
    setProductForm({
      ...productForm,
      images: [...productForm.images, null],
      imageAltTexts: [...productForm.imageAltTexts, ""],
      imagePreviews: [...productForm.imagePreviews, ""],
    });
  };

  const removeImageField = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    const newAltTexts = productForm.imageAltTexts.filter((_, i) => i !== index);
    const newPreviews = productForm.imagePreviews.filter((_, i) => i !== index);
    
    // Revoke URL để tránh memory leak
    if (productForm.imagePreviews[index]) {
      URL.revokeObjectURL(productForm.imagePreviews[index]);
    }
    
    setProductForm({ 
      ...productForm, 
      images: newImages,
      imageAltTexts: newAltTexts,
      imagePreviews: newPreviews
    });
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

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!productForm.brandId) {
      toast.error("Vui lòng chọn thương hiệu");
      return;
    }
    if (productForm.categoryIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 danh mục");
      return;
    }

    // Validate ảnh (ít nhất 1 ảnh cho sản phẩm mới)
    if (!isEditMode && productForm.images.filter(img => img !== null).length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 ảnh sản phẩm");
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
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      discountPercent: Number(productForm.discountPercent),
      brandId: Number(productForm.brandId),
      categoryIds: productForm.categoryIds.map(Number),
      labelIds: productForm.labelIds.map(Number),
      images: productForm.images.filter(img => img !== null), // Gửi File objects trực tiếp
      imageAltTexts: productForm.imageAltTexts,
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

  // Xử lý upload ảnh variant
  const handleVariantImageAdd = (variantIndex, file) => {
    if (file && file.type.startsWith('image/')) {
      const newVariants = [...variants];
      newVariants[variantIndex].images.push(file);
      newVariants[variantIndex].imagePreviews.push(URL.createObjectURL(file));
      setVariants(newVariants);
    } else {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
    }
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    const newVariants = [...variants];
    
    // Revoke URL để tránh memory leak
    if (newVariants[variantIndex].imagePreviews[imageIndex]) {
      URL.revokeObjectURL(newVariants[variantIndex].imagePreviews[imageIndex]);
    }
    
    newVariants[variantIndex].images = newVariants[variantIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    newVariants[variantIndex].imagePreviews = newVariants[variantIndex].imagePreviews.filter(
      (_, i) => i !== imageIndex
    );
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { 
        colorId: "", 
        sizeId: "", 
        stock: "", 
        images: [],
        imagePreviews: []
      },
    ]);
  };

  const removeVariant = (index) => {
    // Revoke tất cả preview URLs của variant này
    variants[index].imagePreviews.forEach(preview => {
      if (preview) URL.revokeObjectURL(preview);
    });
    
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
      images: variant.images, // Gửi File objects trực tiếp
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
      images: formData.images, // Gửi File objects hoặc string (tên file cũ) trực tiếp
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
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isOwner ? "6" : "5"}
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
      {showModal && modalStep === 1 && (
        <ProductFormModal
          productForm={productForm}
          handleProductChange={handleProductChange}
          handleProductImageChange={handleProductImageChange}
          handleAltTextChange={handleAltTextChange}
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
          handleVariantImageAdd={handleVariantImageAdd}
          removeVariantImage={removeVariantImage}
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
          handleCreateVariant={(variantFormData) => {
            const payload = {
              productId: currentProduct.id,
              colorId: Number(variantFormData.colorId),
              sizeId: Number(variantFormData.sizeId),
              stock: Number(variantFormData.stock),
              images: variantFormData.images,
            };
            dispatch(createProductVariant(payload)).then((result) => {
              if (result.type === "adminProducts/createVariant/fulfilled") {
                dispatch(fetchProductVariants(currentProduct.id));
              }
            });
          }}
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
  handleProductImageChange,
  handleAltTextChange,
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
                  Number(productForm.price - (productForm.price * productForm.discountPercent) / 100) - 
                  Number(productForm.costPrice)
                ).toLocaleString()}{" "}
                ₫ (
                {(
                  ((Number(productForm.price - (productForm.price * productForm.discountPercent) / 100) - 
                    Number(productForm.costPrice)) /
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
          {productForm.imageAltTexts.map((altText, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Chọn ảnh {index + 1}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProductImageChange(index, e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Alt text
                  </label>
                  <input
                    type="text"
                    placeholder="Mô tả ảnh"
                    value={altText}
                    onChange={(e) => handleAltTextChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                {productForm.imageAltTexts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded self-end"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Preview ảnh */}
              {productForm.imagePreviews[index] && (
                <div className="mt-2">
                  <img
                    src={productForm.imagePreviews[index]}
                    alt={`Preview ${index + 1}`}
                    className="w-32 h-32 object-cover rounded border border-gray-300"
                  />
                </div>
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
  handleVariantImageAdd,
  removeVariantImage,
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
              <div className="space-y-2">
                {variant.imagePreviews.map((preview, imageIndex) => (
                  <div key={imageIndex} className="flex items-center gap-2">
                    <img
                      src={preview}
                      alt={`Preview ${imageIndex + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariantImage(variantIndex, imageIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <input
                  key={`variant-${variantIndex}-${variant.images.length}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleVariantImageAdd(variantIndex, e.target.files[0]);
                    e.target.value = ''; // Reset input sau khi thêm
                  }}
                  className="text-sm"
                />
              </div>
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

// Component con cho Edit Variants Modal
const EditVariantsModal = ({
  currentProduct,
  productVariants,
  colors,
  sizes,
  handleUpdateVariant,
  handleDeleteVariant,
  handleCreateVariant,
  isLoading,
  onClose,
}) => {
  const [editingVariant, setEditingVariant] = useState(null);
  const [editForm, setEditForm] = useState({
    colorId: "",
    sizeId: "",
    stock: "",
    images: [],
    imagePreviews: [],
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVariantForm, setNewVariantForm] = useState({
    colorId: "",
    sizeId: "",
    stock: "",
    images: [],
    imagePreviews: [],
  });

  const startEdit = (variant) => {
    setEditingVariant(variant.id);
    setEditForm({
      colorId: variant.color?.id || "",
      sizeId: variant.size?.id || "",
      stock: variant.stock || "",
      images: variant.images || [],
      imagePreviews: variant.images || [],
    });
  };

  const cancelEdit = () => {
    setEditingVariant(null);
    setEditForm({
      colorId: "",
      sizeId: "",
      stock: "",
      images: [],
      imagePreviews: [],
    });
  };

  const saveEdit = (variantId) => {
    handleUpdateVariant(variantId, editForm);
    cancelEdit();
  };

  const handleImageAdd = (file) => {
    if (file && file.type.startsWith('image/')) {
      setEditForm({
        ...editForm,
        images: [...editForm.images, file],
        imagePreviews: [...editForm.imagePreviews, URL.createObjectURL(file)],
      });
    }
  };

  const removeImage = (index) => {
    const newImages = editForm.images.filter((_, i) => i !== index);
    const newPreviews = editForm.imagePreviews.filter((_, i) => i !== index);
    
    if (editForm.imagePreviews[index] && typeof editForm.imagePreviews[index] === 'string' && 
        editForm.imagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(editForm.imagePreviews[index]);
    }
    
    setEditForm({ 
      ...editForm, 
      images: newImages,
      imagePreviews: newPreviews
    });
  };

  // Functions for adding new variant
  const startAddNew = () => {
    setIsAddingNew(true);
    setNewVariantForm({
      colorId: "",
      sizeId: "",
      stock: "",
      images: [],
      imagePreviews: [],
    });
  };

  const cancelAddNew = () => {
    setIsAddingNew(false);
    // Clean up preview URLs
    newVariantForm.imagePreviews.forEach(preview => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    setNewVariantForm({
      colorId: "",
      sizeId: "",
      stock: "",
      images: [],
      imagePreviews: [],
    });
  };

  const saveNewVariant = () => {
    if (!newVariantForm.colorId || !newVariantForm.sizeId || !newVariantForm.stock) {
      alert("Vui lòng điền đầy đủ thông tin biến thể");
      return;
    }
    handleCreateVariant(newVariantForm);
    cancelAddNew();
  };

  const handleNewVariantImageAdd = (file) => {
    if (file && file.type.startsWith('image/')) {
      setNewVariantForm({
        ...newVariantForm,
        images: [...newVariantForm.images, file],
        imagePreviews: [...newVariantForm.imagePreviews, URL.createObjectURL(file)],
      });
    }
  };

  const removeNewVariantImage = (index) => {
    const newImages = newVariantForm.images.filter((_, i) => i !== index);
    const newPreviews = newVariantForm.imagePreviews.filter((_, i) => i !== index);
    
    if (newVariantForm.imagePreviews[index] && newVariantForm.imagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(newVariantForm.imagePreviews[index]);
    }
    
    setNewVariantForm({ 
      ...newVariantForm, 
      images: newImages,
      imagePreviews: newPreviews
    });
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
          {/* Nút thêm biến thể mới */}
          {!isAddingNew && (
            <button
              type="button"
              onClick={startAddNew}
              className="w-full px-4 py-3 border-2 border-dashed border-sky-400 rounded-lg text-sky-600 hover:border-sky-500 hover:bg-sky-50 transition flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Thêm biến thể mới
            </button>
          )}

          {/* Form thêm biến thể mới */}
          {isAddingNew && (
            <div className="border-2 border-sky-300 rounded-lg p-5 bg-sky-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-sky-700">
                  Thêm biến thể mới
                </h3>
                <button
                  type="button"
                  onClick={cancelAddNew}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu sắc *
                    </label>
                    <select
                      value={newVariantForm.colorId}
                      onChange={(e) =>
                        setNewVariantForm({
                          ...newVariantForm,
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
                      value={newVariantForm.sizeId}
                      onChange={(e) =>
                        setNewVariantForm({
                          ...newVariantForm,
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
                      value={newVariantForm.stock}
                      onChange={(e) =>
                        setNewVariantForm({
                          ...newVariantForm,
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
                  <div className="space-y-2 mb-2">
                    {newVariantForm.imagePreviews.map((preview, imageIndex) => (
                      <div key={imageIndex} className="flex items-center gap-2">
                        <img
                          src={preview}
                          alt={`Preview ${imageIndex + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewVariantImage(imageIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    key={`new-variant-${newVariantForm.images.length}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleNewVariantImageAdd(e.target.files[0]);
                      e.target.value = '';
                    }}
                    className="text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={cancelAddNew}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={saveNewVariant}
                    disabled={isLoading}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {isLoading ? "Đang lưu..." : "Lưu biến thể"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Danh sách biến thể hiện có */}
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
                        <div className="space-y-2 mb-2">
                          {editForm.imagePreviews.map((preview, imageIndex) => (
                            <div key={imageIndex} className="flex items-center gap-2">
                              <img
                                src={preview}
                                alt={`Preview ${imageIndex + 1}`}
                                className="w-20 h-20 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(imageIndex)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <input
                          key={`edit-variant-${editingVariant}-${editForm.images.length}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleImageAdd(e.target.files[0]);
                            e.target.value = ''; // Reset input sau khi thêm
                          }}
                          className="text-sm"
                        />
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