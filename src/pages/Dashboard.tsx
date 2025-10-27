import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'ออเดอร์ทั้งหมด',
      value: '1,234',
      change: '+12.5%',
      icon: ShoppingCart,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'สินค้าในคลัง',
      value: '5,678',
      change: '+5.2%',
      icon: Package,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'ยอดขายวันนี้',
      value: '฿45,678',
      change: '+8.1%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
    {
      title: 'ลูกค้าทั้งหมด',
      value: '892',
      change: '+3.2%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">ภาพรวมระบบ WMS Fulfillment</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-card hover:shadow-elegant transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">{stat.change} จากเดือนที่แล้ว</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>ออเดอร์ล่าสุด</CardTitle>
            <CardDescription>รายการออเดอร์ที่เข้ามาล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">ORD-{1000 + i}</p>
                      <p className="text-sm text-muted-foreground">Shopee Order</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">฿{(Math.random() * 1000 + 500).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">{i} ชม. ที่แล้ว</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>สถานะ API</CardTitle>
            <CardDescription>สถานะการเชื่อมต่อ Marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Shopee', 'Lazada', 'TikTok Shop'].map((platform) => (
                <div key={platform} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{platform}</p>
                      <p className="text-sm text-muted-foreground">API Connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
