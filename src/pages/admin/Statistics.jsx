import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package,
  ChevronDown,
  Download,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Statistics = () => {
  const { user } = useSelector((state) => state.auth);
  const isOwner = user?.role === 'OWNER';

  const [statsType, setStatsType] = useState(isOwner ? 'profit' : 'revenue');
  const [period, setPeriod] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      let url = '';
      const baseUrl = `${VITE_API_URL}/api/statistics`;

      if (period === 'range') {
        if (!dateRange.fromDate || !dateRange.toDate) {
          return;
        }
        url = `${baseUrl}/${statsType}/date-range?fromDate=${dateRange.fromDate}&toDate=${dateRange.toDate}`;
      } else if (period === 'week') {
        url = `${baseUrl}/${statsType}/week?date=${selectedDate}`;
      } else if (period === 'month') {
        url = `${baseUrl}/${statsType}/month?date=${selectedDate}`;
      } else if (period === 'year') {
        url = `${baseUrl}/${statsType}/year?date=${selectedDate}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeader()
      });

      const data = await response.json();

      if (data.code === 1000) {
        setStatsData(data.result);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (period === 'range' && (!dateRange.fromDate || !dateRange.toDate)) {
      return;
    }
    fetchStatistics();
  }, [statsType, period, selectedDate, dateRange]);

  const formatCurrency = (value) => {
    if (!value) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    // Nếu là định dạng YYYY-MM (cho year view)
    if (dateStr.length === 7) {
      const [year, month] = dateStr.split('-');
      return `Tháng ${month}/${year}`;
    }
    
    // Nếu là định dạng YYYY-MM-DD
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const prepareChartData = () => {
    if (!statsData?.details) return [];
    
    return statsData.details.map(item => ({
      date: formatDate(item.date),
      revenue: item.revenue || 0,
      cost: item.cost || 0,
      profit: item.profit || 0,
      orders: item.orderCount || 0,
      products: item.productCount || 0
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Thống kê {statsType === 'revenue' ? 'Doanh thu' : 'Lợi nhuận'}
          </h1>
          <p className="text-gray-600">
            Xem báo cáo chi tiết về {statsType === 'revenue' ? 'doanh thu' : 'lợi nhuận'} của cửa hàng
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Loại thống kê - Chỉ hiện cho Owner */}
            {isOwner && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại thống kê
                </label>
                <select
                  value={statsType}
                  onChange={(e) => setStatsType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="revenue">Doanh thu</option>
                  <option value="profit">Lợi nhuận</option>
                </select>
              </div>
            )}

            {/* Kỳ thống kê */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kỳ thống kê
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
                <option value="year">Theo năm</option>
                <option value="range">Khoảng thời gian</option>
              </select>
            </div>

            {/* Date selector cho week/month/year */}
            {period !== 'range' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn ngày
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {period === 'week' && 'Chọn một ngày bất kỳ trong tuần'}
                  {period === 'month' && 'Chọn một ngày bất kỳ trong tháng'}
                  {period === 'year' && 'Chọn một ngày bất kỳ trong năm'}
                </p>
              </div>
            )}

            {/* Date range cho range */}
            {period === 'range' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={dateRange.fromDate}
                    onChange={(e) => setDateRange({...dateRange, fromDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={dateRange.toDate}
                    onChange={(e) => setDateRange({...dateRange, toDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Period info */}
          {statsData && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Kỳ thống kê:</span>{' '}
                {formatDate(statsData.fromDate)} - {formatDate(statsData.toDate)}
              </p>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && statsData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Doanh thu */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Tổng doanh thu
                </h3>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(statsData.totalRevenue)}
                </p>
              </div>

              {/* Chi phí - Chỉ hiện cho Owner */}
              {isOwner && statsType === 'profit' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">
                    Tổng chi phí
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatCurrency(statsData.totalCost)}
                  </p>
                </div>
              )}

              {/* Lợi nhuận - Chỉ hiện cho Owner */}
              {isOwner && statsType === 'profit' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">
                    Lợi nhuận
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(statsData.totalProfit)}
                  </p>
                  {statsData.totalCost > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tỷ suất: {((statsData.totalProfit / statsData.totalCost) * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              )}

              {/* Đơn hàng */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Tổng đơn hàng
                </h3>
                <p className="text-2xl font-bold text-gray-800">
                  {statsData.totalOrders}
                </p>
              </div>

              {/* Sản phẩm */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <Package className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Sản phẩm đã bán
                </h3>
                <p className="text-2xl font-bold text-gray-800">
                  {statsData.totalProducts}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Biểu đồ {statsType === 'revenue' ? 'doanh thu' : 'doanh thu & chi phí'}
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Doanh thu" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    {isOwner && statsType === 'profit' && (
                      <Line 
                        type="monotone" 
                        dataKey="cost" 
                        name="Chi phí" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Profit Chart - Chỉ cho Owner */}
              {isOwner && statsType === 'profit' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Biểu đồ lợi nhuận
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="profit" 
                        name="Lợi nhuận" 
                        fill="#3b82f6" 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Orders Chart cho Admin */}
              {!isOwner || statsType === 'revenue' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Biểu đồ đơn hàng
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                      <Legend />
                      <Bar 
                        dataKey="orders" 
                        name="Số đơn hàng" 
                        fill="#8b5cf6" 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Detail Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  Chi tiết theo ngày
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">
                        Ngày
                      </th>
                      <th className="text-right py-3 px-4 text-gray-600 font-medium">
                        Doanh thu
                      </th>
                      {isOwner && statsType === 'profit' && (
                        <>
                          <th className="text-right py-3 px-4 text-gray-600 font-medium">
                            Chi phí
                          </th>
                          <th className="text-right py-3 px-4 text-gray-600 font-medium">
                            Lợi nhuận
                          </th>
                          <th className="text-right py-3 px-4 text-gray-600 font-medium">
                            Tỷ suất LN
                          </th>
                        </>
                      )}
                      <th className="text-center py-3 px-4 text-gray-600 font-medium">
                        Đơn hàng
                      </th>
                      <th className="text-center py-3 px-4 text-gray-600 font-medium">
                        Sản phẩm
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.details.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {formatDate(item.date)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {formatCurrency(item.revenue)}
                        </td>
                        {isOwner && statsType === 'profit' && (
                          <>
                            <td className="py-3 px-4 text-right text-orange-600">
                              {formatCurrency(item.cost)}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-blue-600">
                              {formatCurrency(item.profit)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                item.cost > 0 
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {item.cost > 0 
                                  ? `${((item.profit / item.cost) * 100).toFixed(1)}%`
                                  : 'N/A'}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="py-3 px-4 text-center">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {item.orderCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                            {item.productCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="py-3 px-4">Tổng cộng</td>
                      <td className="py-3 px-4 text-right text-green-600">
                        {formatCurrency(statsData.totalRevenue)}
                      </td>
                      {isOwner && statsType === 'profit' && (
                        <>
                          <td className="py-3 px-4 text-right text-orange-600">
                            {formatCurrency(statsData.totalCost)}
                          </td>
                          <td className="py-3 px-4 text-right text-blue-600">
                            {formatCurrency(statsData.totalProfit)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                              {statsData.totalCost > 0 
                                ? `${((statsData.totalProfit / statsData.totalCost) * 100).toFixed(1)}%`
                                : 'N/A'}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="py-3 px-4 text-center">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {statsData.totalOrders}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                          {statsData.totalProducts}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !statsData && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Chọn kỳ thống kê để xem báo cáo
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;