import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const ChangePassword = () => {
  const { changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    const success = await changePassword(oldPassword, newPassword);
    setLoading(false);

    if (success) {
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error('เปลี่ยนรหัสผ่านไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Change Password</h1>
        <p className="text-sm md:text-base text-muted-foreground">เปลี่ยนรหัสผ่านของคุณ</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
              <CardDescription>กรอกรหัสผ่านเดิมและรหัสผ่านใหม่</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">รหัสผ่านเดิม</Label>
              <Input
                id="oldPassword"
                type="password"
                placeholder="กรอกรหัสผ่านเดิม"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                {loading ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">💡 คำแนะนำ</p>
              <ul className="list-disc list-inside space-y-1">
                <li>รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร</li>
                <li>ใช้ตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลขผสมกัน</li>
                <li>ไม่ควรใช้รหัสผ่านที่คาดเดาง่าย</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
