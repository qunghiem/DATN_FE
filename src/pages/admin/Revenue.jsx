import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenueStats, clearMessages } from '../../features/admin/adminRevenueSlice';
import { Calendar, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Revenue = () => {
  const dispatch = useDispatch();
  const { stats, isLoading, error } = useSelector((state) => state.adminRevenue || {});

  const [period, setPeriod] = useState('month'); // 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  useEffect(() => {
    if (period === 'custom' && startDate && endDate) {
      dispatch(fetchRevenueStats({ period, startDate, endDate }));
    } else if (period !== 'custom') {
      dispatch(fetchRevenueStats({ period }));
    }
  }, [dispatch, period, startDate, endDate]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setShowCustomDate(newPeriod === 'custom');
    if (newPeriod !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Sample data for charts (sẽ được thay thế bằng data từ API)
  const revenueData = stats?.chartData || [
    { name: 'T1', revenue: 24000000, orders: 120 },
    { name: 'T2', revenue: 31000000, orders: 150 },
    { name: 'T3', revenue: 28000000, orders: 140 },
    { name: 'T4', revenue: 35000000, orders: 175 },
    { name: 'T5', revenue: 42000000, orders: 200 },
    { name: 'T6', revenue: 38000000, orders: 190 },
  ];

  const categoryData = stats?.categoryData || [
    { name: 'Áo', value: 15000000 },
    { name: 'Quần', value: 12000000 },
    { name: 'Giày', value: 10000000 },
    { name: 'Phụ kiện', value: 5000000 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Thống kê doanh thu</h1>

      {/* Period Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-4 py-2 rounded-lg transition ${
                period === 'week'
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-4 py-2 rounded-lg transition ${
                period === 'month'
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => handlePeriodChange('custom')}
              className={`px-4 py-2 rounded-lg transition ${
                period === 'custom'
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tùy chỉnh
            </button>
          </div>

          {showCustomDate && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <span className="text-gray-600">đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              +15.3%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Tổng doanh thu</h3>
          <p className="text-2xl font-bold text-gray-800">
            {(stats?.totalRevenue || 168000000).toLocaleString()} ₫
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              +8.5%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Tổng đơn hàng</h3>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 975}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12.8%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Giá trị TB đơn hàng</h3>
          <p className="text-2xl font-bold text-gray-800">
            {(stats?.avgOrderValue || 172308).toLocaleString()} ₫
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              +5.2%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Đơn hàng/ngày</h3>
          <p className="text-2xl font-bold text-gray-800">{stats?.ordersPerDay || 32}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Biểu đồ doanh thu</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => `${value.toLocaleString()} ₫`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Biểu đồ đơn hàng</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend />
              <Bar dataKey="orders" name="Số đơn hàng" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Revenue */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Doanh thu theo danh mục</h2>
        <div className="space-y-4">
          {categoryData.map((category, index) => {
            const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
            const percentage = ((category.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{category.name}</span>
                  <span className="text-gray-600">
                    {category.value.toLocaleString()} ₫ ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Revenue;