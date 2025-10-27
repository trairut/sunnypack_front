import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Trash2, Edit, ShoppingCart } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ApiConfig {
  id: string;
  platform: 'shopee' | 'lazada' | 'tiktok';
  shopId: string;
  apiKey: string;
  apiSecret: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const ApiManagement = () => {
  const [configs, setConfigs] = useState<ApiConfig[]>([
    {
      id: '1',
      platform: 'shopee',
      shopId: 'SHOP001',
      apiKey: 'sk_test_abc123...',
      apiSecret: '***hidden***',
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      platform: 'lazada',
      shopId: 'SHOP002',
      apiKey: 'lz_key_xyz789...',
      apiSecret: '***hidden***',
      status: 'active',
      createdAt: '2024-01-20',
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ApiConfig | null>(null);
  const [formData, setFormData] = useState({
    platform: 'shopee',
    shopId: '',
    apiKey: '',
    apiSecret: '',
  });

  const handleCreate = () => {
    if (!formData.shopId || !formData.apiKey || !formData.apiSecret) {
      toast.error('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    const newConfig: ApiConfig = {
      id: (configs.length + 1).toString(),
      platform: formData.platform as 'shopee' | 'lazada' | 'tiktok',
      shopId: formData.shopId,
      apiKey: formData.apiKey,
      apiSecret: '***hidden***',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setConfigs([...configs, newConfig]);
    setIsDialogOpen(false);
    resetForm();
    toast.success('เพิ่ม API Configuration สำเร็จ!');
  };

  const handleUpdate = () => {
    if (!editingConfig) return;

    setConfigs(
      configs.map((config) =>
        config.id === editingConfig.id
          ? {
              ...config,
              shopId: formData.shopId,
              apiKey: formData.apiKey,
            }
          : config
      )
    );

    setIsDialogOpen(false);
    setEditingConfig(null);
    resetForm();
    toast.success('อัปเดต API Configuration สำเร็จ!');
  };

  const handleDelete = (id: string) => {
    setConfigs(configs.filter((config) => config.id !== id));
    toast.success('ลบ API Configuration สำเร็จ!');
  };

  const handleEdit = (config: ApiConfig) => {
    setEditingConfig(config);
    setFormData({
      platform: config.platform,
      shopId: config.shopId,
      apiKey: config.apiKey,
      apiSecret: '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      platform: 'shopee',
      shopId: '',
      apiKey: '',
      apiSecret: '',
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'shopee':
        return 'bg-orange-500';
      case 'lazada':
        return 'bg-blue-500';
      case 'tiktok':
        return 'bg-black';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">API Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">จัดการ API ของ Marketplace ต่างๆ</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingConfig(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">เพิ่ม API Config</span>
              <span className="sm:hidden">เพิ่ม API</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{editingConfig ? 'แก้ไข' : 'เพิ่ม'} API Configuration</DialogTitle>
              <DialogDescription>
                กรอกข้อมูล API สำหรับเชื่อมต่อกับ Marketplace
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  disabled={!!editingConfig}
                >
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="เลือก Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopee">Shopee</SelectItem>
                    <SelectItem value="lazada">Lazada</SelectItem>
                    <SelectItem value="tiktok">TikTok Shop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopId">Shop ID</Label>
                <Input
                  id="shopId"
                  placeholder="กรอก Shop ID"
                  value={formData.shopId}
                  onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  placeholder="กรอก API Key"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="กรอก API Secret"
                  value={formData.apiSecret}
                  onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingConfig(null);
                resetForm();
              }}>
                ยกเลิก
              </Button>
              <Button onClick={editingConfig ? handleUpdate : handleCreate}>
                {editingConfig ? 'อัปเดต' : 'เพิ่ม'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base md:text-lg truncate">API Configurations</CardTitle>
              <CardDescription className="text-xs md:text-sm truncate">รายการ API ที่เชื่อมต่อทั้งหมด</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Shop ID</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${getPlatformColor(config.platform)} flex items-center justify-center`}>
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium capitalize">{config.platform}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{config.shopId}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{config.apiKey}</TableCell>
                  <TableCell>
                    <Badge variant={config.status === 'active' ? 'default' : 'secondary'}>
                      {config.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(config.createdAt).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(config)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(config.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {configs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มี API Configuration</p>
              <p className="text-sm">คลิกปุ่ม "เพิ่ม API Config" เพื่อเริ่มต้น</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiManagement;
