import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
  return raw.replace(/\/+$/, '');
})();

interface Material {
  id: number;
  name: string;
  barcode?: string | null;
  product_type?: string | null;
  sku_number?: string | null;
  sku_id?: string | null;
  product_id?: string | null;
  description?: string | null;
  shop_id: number;
  is_active: boolean;
  created_at: string;
}

interface MaterialForm {
  name: string;
  barcode: string;
  product_type: string;
  sku_number: string;
  sku_id: string;
  product_id: string;
  shop_id: string;
}

interface Shop {
  id: number;
  name: string;
  code: string;
}

const MaterialMaster = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();

  const isShopUser = user?.user_type === 'shop';
  const userShopId = user?.shop_id ? String(user.shop_id) : '';

  const [materials, setMaterials] = useState<Material[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [formData, setFormData] = useState<MaterialForm>({
    name: '',
    barcode: '',
    product_type: '',
    sku_number: '',
    sku_id: '',
    product_id: '',
    shop_id: userShopId,
  });

  const shopMap = useMemo(() => {
    return shops.reduce<Map<number, Shop>>((acc, shop) => {
      acc.set(shop.id, shop);
      return acc;
    }, new Map());
  }, [shops]);

  const filteredMaterials = useMemo(() => {
    if (!searchTerm.trim()) {
      return materials;
    }
    const term = searchTerm.trim().toLowerCase();
    return materials.filter((material) => {
      return (
        material.name?.toLowerCase().includes(term) ||
        material.barcode?.toLowerCase().includes(term) ||
        material.sku_number?.toLowerCase().includes(term)
      );
    });
  }, [materials, searchTerm]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      barcode: '',
      product_type: '',
      sku_number: '',
      sku_id: '',
      product_id: '',
      shop_id: isShopUser ? userShopId : '',
    });
    setEditingMaterial(null);
  }, [isShopUser, userShopId]);

  useEffect(() => {
    if (isShopUser) {
      setFormData((prev) => ({ ...prev, shop_id: userShopId }));
    }
  }, [isShopUser, userShopId]);

  const fetchMaterials = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/material/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.detail ||
          'ไม่สามารถโหลดรายการสินค้าได้ กรุณาลองใหม่อีกครั้ง';
        throw new Error(message);
      }

      const data: Material[] = await response.json();
      setMaterials(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'ไม่สามารถโหลดรายการสินค้าได้ กรุณาลองใหม่อีกครั้ง';
      setFetchError(message);
      toast({
        title: 'โหลดรายการสินค้าไม่สำเร็จ',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  const fetchShops = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/shop/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.detail ||
          'ไม่สามารถโหลดข้อมูลร้านค้าได้ กรุณาลองใหม่อีกครั้ง';
        throw new Error(message);
      }

      const data: Shop[] = await response.json();
      setShops(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'ไม่สามารถโหลดข้อมูลร้านค้าได้ กรุณาลองใหม่อีกครั้ง';
      toast({
        title: 'โหลดข้อมูลร้านค้าไม่สำเร็จ',
        description: message,
        variant: 'destructive',
      });
    }
  }, [token, toast]);

  useEffect(() => {
    if (!token) {
      return;
    }
    fetchMaterials();
    fetchShops();
  }, [token, fetchMaterials, fetchShops]);

  const buildPayload = (includeShop = false) => {
    const trimmed = {
      name: formData.name.trim(),
      barcode: formData.barcode.trim(),
      product_type: formData.product_type.trim(),
      sku_number: formData.sku_number.trim(),
      sku_id: formData.sku_id.trim(),
      product_id: formData.product_id.trim(),
    };

    const payload: Record<string, unknown> = {
      name: trimmed.name,
    };

    if (trimmed.barcode) payload.barcode = trimmed.barcode;
    if (trimmed.product_type) payload.product_type = trimmed.product_type;
    if (trimmed.sku_number) payload.sku_number = trimmed.sku_number;
    if (trimmed.sku_id) payload.sku_id = trimmed.sku_id;
    if (trimmed.product_id) payload.product_id = trimmed.product_id;

    if (includeShop) {
      payload.shop_id = Number(formData.shop_id);
    }

    return payload;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast({
        title: 'ยังไม่ได้เข้าสู่ระบบ',
        description: 'กรุณาเข้าสู่ระบบอีกครั้งเพื่อจัดการข้อมูลสินค้า',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: 'กรุณากรอกชื่อสินค้า',
        description: 'จำเป็นต้องระบุชื่อสินค้าอย่างน้อย 1 ค่า',
        variant: 'destructive',
      });
      return;
    }

    if (!editingMaterial && !formData.shop_id) {
      toast({
        title: 'กรุณาเลือก Shop',
        description: 'ต้องเลือก Shop สำหรับสินค้าที่ต้องการบันทึก',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingMaterial) {
        const response = await fetch(
          `${API_BASE_URL}/api/material/${editingMaterial.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(buildPayload(false)),
          }
        );

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          const message =
            errorBody?.detail || 'ไม่สามารถอัปเดตข้อมูลสินค้าได้';
          throw new Error(message);
        }

        const updated: Material = await response.json();
        setMaterials((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );
        toast({
          title: 'อัปเดตข้อมูลสินค้าเรียบร้อย',
          description: `แก้ไขข้อมูล ${updated.name} สำเร็จ`,
        });
      } else {
        const response = await fetch(`${API_BASE_URL}/api/material/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(buildPayload(true)),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          const message =
            errorBody?.detail || 'ไม่สามารถเพิ่มข้อมูลสินค้าได้';
          throw new Error(message);
        }

        const created: Material = await response.json();
        setMaterials((current) => [created, ...current]);
        toast({
          title: 'เพิ่มข้อมูลสินค้าเรียบร้อย',
          description: `เพิ่มสินค้า ${created.name} สำเร็จ`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      toast({
        title: 'บันทึกข้อมูลไม่สำเร็จ',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name ?? '',
      barcode: material.barcode ?? '',
      product_type: material.product_type ?? '',
      sku_number: material.sku_number ?? '',
      sku_id: material.sku_id ?? '',
      product_id: material.product_id ?? '',
      shop_id: String(material.shop_id),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) {
      toast({
        title: 'ยังไม่ได้เข้าสู่ระบบ',
        description: 'กรุณาเข้าสู่ระบบอีกครั้งเพื่อจัดการข้อมูลสินค้า',
        variant: 'destructive',
      });
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/material/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.detail || 'ไม่สามารถลบข้อมูลสินค้าได้';
        throw new Error(message);
      }

      setMaterials((current) => current.filter((item) => item.id !== id));

      toast({
        title: 'ลบข้อมูลสินค้าเรียบร้อย',
        description: 'รายการสินค้าถูกลบออกจากระบบแล้ว',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      toast({
        title: 'ลบข้อมูลไม่สำเร็จ',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-xl md:text-2xl text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Material Master
          </CardTitle>
          <CardDescription>
            จัดการข้อมูลสินค้าในระบบคลัง พร้อมเชื่อมต่อข้อมูลจริงจากระบบหลังบ้าน
          </CardDescription>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
              }}
              className="w-full md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มสินค้า
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มข้อมูลสินค้า'}
              </DialogTitle>
              <DialogDescription>
                {editingMaterial
                  ? 'ปรับปรุงรายละเอียดของสินค้าที่เลือกในระบบคลังสินค้า'
                  : 'ระบุรายละเอียดสินค้าเพื่อบันทึกลงระบบคลังสินค้า'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isShopUser && (
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="shop">Shop</Label>
                    <Select
                      value={formData.shop_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, shop_id: value }))
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="shop">
                        <SelectValue placeholder="เลือก Shop สำหรับสินค้า" />
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
                )}

                {isShopUser && (
                  <div className="grid gap-2 md:col-span-2">
                    <Label>Shop</Label>
                    <Input
                      value={
                        shopMap.get(Number(formData.shop_id))?.name ??
                        'Shop ของคุณ'
                      }
                      disabled
                    />
                  </div>
                )}

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="name">ชื่อสินค้า</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        barcode: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="product_type">ประเภทสินค้า</Label>
                  <Input
                    id="product_type"
                    value={formData.product_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        product_type: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sku_number">SKU Number</Label>
                  <Input
                    id="sku_number"
                    value={formData.sku_number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sku_number: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sku_id">SKU ID</Label>
                  <Input
                    id="sku_id"
                    value={formData.sku_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sku_id: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="product_id">Product ID</Label>
                  <Input
                    id="product_id"
                    value={formData.product_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        product_id: e.target.value,
                      }))
                    }
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'กำลังบันทึก...'
                    : editingMaterial
                    ? 'อัปเดตสินค้า'
                    : 'เพิ่มสินค้า'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-80">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาจากชื่อสินค้า Barcode หรือ SKU"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchMaterials} disabled={isLoading}>
              รีเฟรชข้อมูล
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>ประเภทสินค้า</TableHead>
                  <TableHead>SKU Number</TableHead>
                  <TableHead>SKU ID</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      กำลังโหลดข้อมูลสินค้า...
                    </TableCell>
                  </TableRow>
                ) : fetchError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-destructive">
                      {fetchError}
                    </TableCell>
                  </TableRow>
                ) : filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      ไม่พบข้อมูลสินค้า
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {material.name}
                      </TableCell>
                      <TableCell>{material.barcode || '-'}</TableCell>
                      <TableCell>{material.product_type || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {material.sku_number || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {material.sku_id || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {material.product_id || '-'}
                      </TableCell>
                      <TableCell>
                        {shopMap.get(material.shop_id)?.name || `Shop #${material.shop_id}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(material)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(material.id)}
                            disabled={deletingId === material.id}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialMaster;
