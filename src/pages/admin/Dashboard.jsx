import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../features/admin/adminRevenueSlice';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp,
  ShoppingCart 
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardData, isLoading } = useSelector((state) => state.adminRevenue);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Tổng doanh thu',
      value: `${dashboardData?.totalRevenue?.toLocaleString() || 0} ₫`,
      icon: DollarSign,
      bgColor: 'bg-green-500',
      trend: '+12.5%',
    },
    {
      title: 'Đơn hàng',
      value: dashboardData?.totalOrders || 0,
      icon: ShoppingCart,
      bgColor: 'bg-blue-500',
      trend: '+8.2%',
    },
    {
      title: 'Khách hàng',
      value: dashboardData?.totalCustomers || 0,
      icon: Users,
      bgColor: 'bg-purple-500',
      trend: '+5.7%',
    },
    {
      title: 'Sản phẩm',
      value: dashboardData?.totalProducts || 0,
      icon: Package,
      bgColor: 'bg-orange-500',
      trend: '+3.1%',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn hàng gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Mã đơn</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Khách hàng</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Tổng tiền</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentOrders?.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">#{order.id}</td>
                  <td className="py-3 px-4">{order.customerName}</td>
                  <td className="py-3 px-4">{order.total.toLocaleString()} ₫</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sản phẩm bán chạy</h2>
        <div className="space-y-4">
          {dashboardData?.topProducts?.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                <div>
                  <h4 className="font-medium text-gray-800">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.sold} đã bán</p>
                </div>
              </div>
              <span className="font-bold text-gray-800">{product.revenue.toLocaleString()} ₫</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;