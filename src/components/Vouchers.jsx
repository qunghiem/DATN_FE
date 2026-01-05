import { useState, useEffect } from "react";
import { FiCopy, FiCheck, FiInfo } from "react-icons/fi";
import { FaTruck, FaPercent, FaTicketAlt } from "react-icons/fa";

export default function Vouchers() {
  const [copied, setCopied] = useState(null);
  const [saved, setSaved] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      // Thêm tham số status=ACTIVE vào API call
      const response = await fetch(`${VITE_API_URL}/api/vouchers?status=ACTIVE`);
      const data = await response.json();
      
      if (data.code === 0) {
        // Server đã lọc voucher ACTIVE cho chúng ta, không cần filter client-side nữa
        // Transform API data to component format
        const transformedVouchers = data.result.map((v) => ({
          id: v.id,
          code: v.code,
          discountType: v.discountType,
          discountValue: v.discountValue,
          minOrderValue: v.minOrderValue,
          maxDiscountValue: v.maxDiscountValue,
          endDate: v.endDate,
          remainingUses: v.remainingUses,
          isActive: v.isActive,
          icon: getIcon(v.discountType),
          title: getTitle(v),
          desc: getDescription(v),
          expiry: formatDate(v.endDate),
        }));
        setVouchers(transformedVouchers);
      }
    } catch (err) {
      setError("Không thể tải danh sách voucher");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "FREESHIP":
        return <FaTruck />;
      case "PERCENTAGE":
        return <FaPercent />;
      case "FIXED_AMOUNT":
        return <FaTicketAlt />;
      default:
        return <FaTicketAlt />;
    }
  };

  const getTitle = (voucher) => {
    if (voucher.discountType === "FREESHIP") {
      return "MIỄN PHÍ VẬN CHUYỂN";
    } else if (voucher.discountType === "PERCENTAGE") {
      return `GIẢM ${voucher.discountValue}%`;
    } else {
      return `GIẢM ${formatMoney(voucher.discountValue)}`;
    }
  };

  const getDescription = (voucher) => {
    const minOrder = formatMoney(voucher.minOrderValue);
    if (voucher.discountType === "FREESHIP") {
      return `Freeship cho đơn từ ${minOrder}`;
    } else if (voucher.discountType === "PERCENTAGE") {
      const maxDiscount = voucher.maxDiscountValue 
        ? `, tối đa ${formatMoney(voucher.maxDiscountValue)}` 
        : "";
      return `Áp dụng đơn từ ${minOrder}${maxDiscount}`;
    } else {
      return `Áp dụng đơn từ ${minOrder}`;
    }
  };

  const formatMoney = (amount) => {
    if (!amount) return "0đ";
    return `${(amount / 1000).toFixed(0)}k`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không có HSD";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleSave = (id) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
        🎟️ Danh sách mã giảm giá
      </h1>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Đang tải danh sách voucher...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && vouchers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không có voucher nào
        </div>
      )}

      {/* Vouchers list */}
      {!loading && !error && vouchers.length > 0 && (
        <>
          {/* Desktop: Grid bình thường (>= 992px) */}
          <div className="hidden lg:grid grid-cols-4 gap-4">
            {vouchers.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                copied={copied}
                saved={saved}
                onCopy={handleCopy}
                // onSave={handleSave}
              />
            ))}
          </div>

          {/* Tablet: Hiển thị 2.5 voucher (768px - 991px) */}
          <div className="hidden md:block lg:hidden overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-4 w-fit">
              {vouchers.map((v) => (
                <div key={v.id} className="min-w-[calc(40%-12px)]">
                  <VoucherCard
                    voucher={v}
                    copied={copied}
                    saved={saved}
                    onCopy={handleCopy}
                    // onSave={handleSave}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Hiển thị 1.5 voucher (< 768px) */}
          <div className="block md:hidden overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-3 w-fit">
              {vouchers.map((v) => (
                <div key={v.id} className="min-w-[calc(66.666%-8px)]">
                  <VoucherCard
                    voucher={v}
                    copied={copied}
                    saved={saved}
                    onCopy={handleCopy}
                    // onSave={handleSave}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Component Voucher Card tách riêng để tái sử dụng cho 3 kích thước màn hình
function VoucherCard({ voucher: v, copied, onCopy }) {
  return (
    <div className="rounded-xl shadow-sm hover:shadow-md transition transform hover:-translate-y-1 bg-white">
      {/* Icon */}
      <div className="bg-[#EAF1FB] p-4 flex justify-center items-center rounded-t-xl text-[#3A6FB5] text-2xl">
        {v.icon}
      </div>

      {/* Nội dung */}
      <div className="p-3 flex flex-col text-sm">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h2 className="font-semibold text-gray-800 text-xs sm:text-sm uppercase">
              {v.title}
            </h2>
            <p className="text-gray-600 text-xs mt-0.5">{v.desc}</p>
          </div>
          <FiInfo className="text-gray-400 text-sm" />
        </div>

        <p className="text-xs text-gray-500 mt-1">
          Mã: <span className="font-semibold text-[#3A6FB5]">{v.code}</span>
        </p>
        <p className="text-xs text-gray-400">HSD: {v.expiry}</p>

        {/* Nút */}
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={() => onCopy(v.code)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-[#3A6FB5] text-white rounded-md hover:bg-[#2E5C99] transition"
          >
            {copied === v.code ? <><FiCheck /> Đã sao chép</> : <><FiCopy /> Sao chép</>}
          </button>

        </div>
      </div>
    </div>
  );
}