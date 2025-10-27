import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const { user } = useAuth();

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Profile</h1>
        <p className="text-sm md:text-base text-muted-foreground">จัดการข้อมูลส่วนตัวของคุณ</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>ข้อมูลผู้ใช้</CardTitle>
          <CardDescription>รายละเอียดบัญชีผู้ใช้งาน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                {user && getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{user?.username}</h3>
              <Badge variant="secondary" className="mt-2 capitalize">
                {user?.role}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                value={user?.username || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">สิทธิ์การใช้งาน</Label>
              <Input
                id="role"
                value={user?.role || ''}
                disabled
                className="bg-muted capitalize"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>ข้อมูลระบบ</CardTitle>
          <CardDescription>ข้อมูลการใช้งานระบบ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">เข้าสู่ระบบล่าสุด</span>
            <span className="font-medium text-foreground">{new Date().toLocaleString('th-TH')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">สถานะบัญชี</span>
            <Badge variant="default" className="bg-green-600">Active</Badge>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">วันที่สร้างบัญชี</span>
            <span className="font-medium text-foreground">1 ม.ค. 2024</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
