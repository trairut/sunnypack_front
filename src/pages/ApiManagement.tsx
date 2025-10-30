import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Trash2, Edit, ShoppingCart, RefreshCw, Filter } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
  return raw.replace(/\/+$/, '');
})();

type Platform = 'shopee' | 'lazada' | 'tiktok';

interface ApiConfig {
  id: number;
  platform: Platform;
  shop_id: number;
  api_key: string;
  api_secret?: string | null;
  status: boolean;
  created_at?: string | null;
}

interface Shop {
  id: number;
  name: string;
  code: string;
  company_id: number;
}

const ApiManagement = () => {
  const { token, user } = useAuth();

  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ApiConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    platform: 'shopee' as Platform,
    shopId: '',
    apiKey: '',
    apiSecret: '',
  });

  const isCompanyUser = user?.user_type === 'company';
  const isShopUser = user?.user_type === 'shop';

  const resetForm = useCallback(() => {
    setFormData({
      platform: 'shopee',
      shopId: isShopUser && user?.shop_id ? String(user.shop_id) : '',
      apiKey: '',
      apiSecret: '',
    });
    setEditingConfig(null);
  }, [isShopUser, user?.shop_id]);

  const fetchShops = useCallback(async () => {
    if (!token) return;
    setLoadingShops(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/shop/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body?.detail || 'ไม่สามารถโหลดรายชื่อร้านค้าได้ กรุณาลองใหม่อีกครั้ง';
        throw new Error(message);
      }

      const data: Shop[] = await response.json();
      setShops(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูลร้านค้า';
      toast.error(message);
    } finally {
      setLoadingShops(false);
    }
  }, [token]);

  const fetchConfigs = useCallback(async () => {
    if (!token) return;
    setLoadingConfigs(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/api-config/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body?.detail || 'ไม่สามารถโหลดข้อมูล API Config ได้ กรุณาลองใหม่อีกครั้ง';
        throw new Error(message);
      }

      const data: ApiConfig[] = await response.json();
      setConfigs(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล API Config';
      toast.error(message);
    } finally {
      setLoadingConfigs(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchShops();
    fetchConfigs();
  }, [token, fetchShops, fetchConfigs]);

  useEffect(() => {
    if (isShopUser && user?.shop_id) {
      setSelectedShopFilter(String(user.shop_id));
    }
  }, [isShopUser, user?.shop_id]);

  useEffect(() => {
    if (formData.shopId) {
      return;
    }
    const defaultShop = (() => {
      if (isShopUser && user?.shop_id) {
        return shops.find((shop) => shop.id === user.shop_id);
      }
      if (shops.length > 0) {
        return shops[0];
      }
      return undefined;
    })();

    if (defaultShop) {
      setFormData((prev) => ({ ...prev, shopId: String(defaultShop.id) }));
    }
  }, [shops, isShopUser, user?.shop_id, formData.shopId]);

  const shopsMap = useMemo(() => {
    return shops.reduce<Map<number, Shop>>((acc, shop) => {
      acc.set(shop.id, shop);
      return acc;
    }, new Map());
  }, [shops]);

  const visibleConfigs = useMemo(() => {
    if (isCompanyUser && user?.company_id) {
      return configs.filter((config) => {
        const shop = shopsMap.get(config.shop_id);
        return shop?.company_id === user.company_id;
      });
    }
    if (isShopUser && user?.shop_id) {
      return configs.filter((config) => config.shop_id === user.shop_id);
    }
    return configs;
  }, [configs, isCompanyUser, isShopUser, shopsMap, user?.company_id, user?.shop_id]);

  const filteredConfigs = useMemo(() => {
    if (selectedShopFilter === 'all') {
      return visibleConfigs;
    }
    const shopId = Number(selectedShopFilter);
    return visibleConfigs.filter((config) => config.shop_id === shopId);
  }, [visibleConfigs, selectedShopFilter]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/api-config/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.detail || 'ไม่สามารถลบ API Config ได้';
        throw new Error(message);
      }

      setConfigs((current) => current.filter((config) => config.id !== id));
      toast.success('ลบ API Config สำเร็จ');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      toast.error(message);
    }
  };

  const handleEdit = (config: ApiConfig) => {
    setEditingConfig(config);
    setFormData({
      platform: config.platform,
      shopId: String(config.shop_id),
      apiKey: config.api_key,
      apiSecret: config.api_secret || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (!formData.shopId || !formData.apiKey || (!editingConfig && !formData.apiSecret)) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const shopIdNumber = Number(formData.shopId);
    if (Number.isNaN(shopIdNumber)) {
      toast.error('Shop ID ไม่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingConfig) {
        const payload: Record<string, unknown> = {};
        if (shopIdNumber !== editingConfig.shop_id) payload.shop_id = shopIdNumber;
        if (formData.apiKey.trim() !== editingConfig.api_key) payload.api_key = formData.apiKey.trim();
        if (formData.apiSecret.trim()) payload.api_secret = formData.apiSecret.trim();
        if (formData.platform !== editingConfig.platform) payload.platform = formData.platform;

        if (Object.keys(payload).length === 0) {
          toast.info('ไม่มีข้อมูลที่เปลี่ยนแปลง');
          setIsSubmitting(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/api-config/${editingConfig.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = body?.detail || 'ไม่สามารถอัปเดต API Config ได้';
          throw new Error(message);
        }

        const updated: ApiConfig = await response.json();
        setConfigs((current) =>
          current.map((config) => (config.id === updated.id ? updated : config))
        );
        toast.success('อัปเดต API Config สำเร็จ');
      } else {
        const response = await fetch(`${API_BASE_URL}/api/api-config/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            platform: formData.platform,
            shop_id: shopIdNumber,
            api_key: formData.apiKey.trim(),
            api_secret: formData.apiSecret.trim(),
            status: true,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = body?.detail || 'ไม่สามารถสร้าง API Config ได้';
          throw new Error(message);
        }

        const created: ApiConfig = await response.json();
        setConfigs((current) => [created, ...current]);
        toast.success('สร้าง API Config สำเร็จ');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'shopee':
        return 'bg-orange-500';
      case 'lazada':
        return 'bg-blue-600';
      case 'tiktok':
        return 'bg-black';
      default:
        return 'bg-primary';
    }
  };

  const maskValue = (value?: string | null) => {
    if (!value) return '-';
    if (value.length <= 4) return '••••';
    return `${value.slice(0, 4)}••••${value.slice(-2)}`;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">API Management</h1>
          <p className="text-sm text-muted-foreground">
            จัดการข้อมูลเชื่อมต่อ Marketplace ผ่าน Shop ที่ได้รับอนุญาต
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedShopFilter}
            onValueChange={setSelectedShopFilter}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="เลือก Shop">
                {selectedShopFilter === 'all'
                  ? 'Shop ทั้งหมด'
                  : shopsMap.get(Number(selectedShopFilter))?.name ?? 'Shop'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {!isShopUser && <SelectItem value="all">Shop ทั้งหมด</SelectItem>}
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={String(shop.id)}>
                  {shop.name} ({shop.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchConfigs} disabled={loadingConfigs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            โหลดใหม่
          </Button>
          <Button variant="outline" onClick={fetchShops} disabled={loadingShops}>
            <Filter className="w-4 h-4 mr-2" />
            โหลด Shop
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {editingConfig ? 'แก้ไข API Config' : 'เพิ่ม API Config'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingConfig ? 'แก้ไข API Config' : 'เพิ่ม API Config'}</DialogTitle>
                <DialogDescription>
                  กรอกข้อมูลสำหรับเชื่อมต่อ API กับแพลตฟอร์มที่ต้องการ
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value: Platform) =>
                      setFormData((prev) => ({ ...prev, platform: value }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="เลือกแพลตฟอร์ม" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopee">Shopee</SelectItem>
                      <SelectItem value="lazada">Lazada</SelectItem>
                      <SelectItem value="tiktok">TikTok Shop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopId">Shop</Label>
                  <Select
                    value={formData.shopId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, shopId: value }))}
                    disabled={isSubmitting || shops.length === 0}
                  >
                    <SelectTrigger id="shopId">
                      <SelectValue placeholder="เลือก Shop" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={String(shop.id)}>
                          {shop.name} ({shop.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    placeholder="กรอก API Key"
                    value={formData.apiKey}
                    onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    placeholder="กรอก API Secret"
                    value={formData.apiSecret}
                    onChange={(e) => setFormData((prev) => ({ ...prev, apiSecret: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col-reverse md:flex-row md:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  ยกเลิก
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'กำลังบันทึก...' : editingConfig ? 'อัปเดต' : 'สร้าง'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base md:text-lg truncate">API Configurations</CardTitle>
              <CardDescription className="text-xs md:text-sm truncate">
                รายการการเชื่อมต่อ API กับแพลตฟอร์มภายนอก
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingConfigs ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    กำลังโหลดข้อมูล...
                  </TableCell>
                </TableRow>
              ) : filteredConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    ไม่พบ API Config
                  </TableCell>
                </TableRow>
              ) : (
                filteredConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg ${getPlatformColor(
                            config.platform
                          )} flex items-center justify-center`}
                        >
                          <ShoppingCart className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium capitalize">{config.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {shopsMap.get(config.shop_id)?.name ?? `Shop #${config.shop_id}`}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {maskValue(config.api_key)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.status ? 'default' : 'secondary'}>
                        {config.status ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {config.created_at
                        ? new Date(config.created_at).toLocaleDateString('th-TH')
                        : '-'}
                    </TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiManagement;
