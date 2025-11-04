import { useState } from "react";
import { FiCopy, FiCheck, FiInfo } from "react-icons/fi";
import { FaTruck, FaPercent, FaTicketAlt } from "react-icons/fa";

export default function Vouchers() {
  const [copied, setCopied] = useState(null);
  const [saved, setSaved] = useState([]);

  const vouchers = [
    { id: 1, icon: <FaTruck />, title: "MIỄN PHÍ VẬN CHUYỂN", desc: "Freeship cho đơn từ 500k", code: "FREESHIP", expiry: "30/12/2025" },
    { id: 2, icon: <FaTicketAlt />, title: "GIẢM 50K", desc: "Áp dụng đơn từ 600k", code: "GIAM50K", expiry: "06/12/2025" },
    { id: 3, icon: <FaPercent />, title: "GIẢM 10%", desc: "Áp dụng đơn từ 1000k", code: "GIAM10", expiry: "09/12/2025" },
    { id: 4, icon: <FaPercent />, title: "GIẢM 15%", desc: "Áp dụng đơn từ 2000k", code: "GIAM15", expiry: "20/12/2025" },
  ];

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

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
        {vouchers.map((v) => (
          <div
            key={v.id}
            className="rounded-xl shadow-sm hover:shadow-md transition transform hover:-translate-y-1 bg-white"
          >
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
                  onClick={() => handleCopy(v.code)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-[#3A6FB5] text-white rounded-md hover:bg-[#2E5C99] transition"
                >
                  {copied === v.code ? <><FiCheck /> Đã sao chép</> : <><FiCopy /> Sao chép</>}
                </button>

                <button
                  onClick={() => handleSave(v.id)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded-md border transition ${
                    saved.includes(v.id)
                      ? "bg-green-100 border-green-400 text-green-600"
                      : "border-gray-300 hover:border-[#3A6FB5] text-gray-600"
                  }`}
                >
                  {saved.includes(v.id) ? "Đã lưu" : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
