import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Material {
  id: string;
  productName: string;
  productBarcode: string;
  productType: string;
  skuNumber: string;
  skuId: string;
  productId: string;
}

const mockMaterials: Material[] = [
  {
    id: '1',
    productName: 'BZU BZU HEAD-TO-TOE BABY WASH Claiming Scent - 600 ML',
    productBarcode: '9551003520022',
    productType: 'Consumer Goods',
    skuNumber: 'BW_CS_9551003520022',
    skuId: '1731715559173686725',
    productId: '1731715114133915077',
  },
  {
    id: '2',
    productName: 'BZU BZU HAPPY KIDS BODY WASH - 600 ML',
    productBarcode: '9551003520183',
    productType: 'Consumer Goods',
    skuNumber: 'BW_HP_9551003520183',
    skuId: '1731747858472601029',
    productId: '1731747130534626757',
  },
  {
    id: '3',
    productName: 'DR.G PH CLEANSING GEL FOAM 200ML',
    productBarcode: '8809695365898',
    productType: 'Cosmetics',
    skuNumber: 'PHGELFOAM200ML_8809695365898',
    skuId: '21395731018',
    productId: '5064634648',
  },
  {
    id: '4',
    productName: 'DR.G GREEN DEEP CLEANSING OIL 210ML',
    productBarcode: '8809695365362',
    productType: 'Cosmetics',
    skuNumber: 'GREENOIL210ML_8809695365362',
    skuId: '21395570265',
    productId: '5064694036',
  },
];

const MaterialMaster = () => {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    productName: '',
    productBarcode: '',
    productType: '',
    skuNumber: '',
    skuId: '',
    productId: '',
  });

  const filteredMaterials = materials.filter(
    (material) =>
      material.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.productBarcode.includes(searchTerm) ||
      material.skuNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMaterial) {
      setMaterials(
        materials.map((m) =>
          m.id === editingMaterial.id ? { ...formData, id: m.id } : m
        )
      );
      toast({
        title: 'อัปเดตสำเร็จ',
        description: 'ข้อมูลสินค้าถูกอัปเดตเรียบร้อยแล้ว',
      });
    } else {
      const newMaterial: Material = {
        ...formData,
        id: Date.now().toString(),
      };
      setMaterials([...materials, newMaterial]);
      toast({
        title: 'เพิ่มสำเร็จ',
        description: 'เพิ่มข้อมูลสินค้าเรียบร้อยแล้ว',
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      productName: material.productName,
      productBarcode: material.productBarcode,
      productType: material.productType,
      skuNumber: material.skuNumber,
      skuId: material.skuId,
      productId: material.productId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
    toast({
      title: 'ลบสำเร็จ',
      description: 'ลบข้อมูลสินค้าเรียบร้อยแล้ว',
      variant: 'destructive',
    });
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      productBarcode: '',
      productType: '',
      skuNumber: '',
      skuId: '',
      productId: '',
    });
    setEditingMaterial(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Material Master</h1>
            <p className="text-xs md:text-sm text-muted-foreground">จัดการข้อมูลสินค้าและ SKU</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มสินค้า
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มข้อมูลสินค้า'}
              </DialogTitle>
              <DialogDescription>
                กรอกข้อมูลสินค้าและ SKU ให้ครบถ้วน
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="productName">ชื่อสินค้า</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productBarcode">Product Barcode</Label>
                  <Input
                    id="productBarcode"
                    value={formData.productBarcode}
                    onChange={(e) =>
                      setFormData({ ...formData, productBarcode: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productType">Product Type</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, productType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภทสินค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consumer Goods">Consumer Goods</SelectItem>
                      <SelectItem value="Cosmetics">Cosmetics</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skuNumber">เลขSKU/SKUผู้ขาย</Label>
                  <Input
                    id="skuNumber"
                    value={formData.skuNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, skuNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skuId">SKU ID/รหัสตัวเลือกสินค้า</Label>
                  <Input
                    id="skuId"
                    value={formData.skuId}
                    onChange={(e) =>
                      setFormData({ ...formData, skuId: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productId">Product ID/รหัสสินค้า</Label>
                  <Input
                    id="productId"
                    value={formData.productId}
                    onChange={(e) =>
                      setFormData({ ...formData, productId: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  ยกเลิก
                </Button>
                <Button type="submit">
                  {editingMaterial ? 'อัปเดต' : 'เพิ่ม'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาด้วยชื่อสินค้า, Barcode หรือ SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Product Type</TableHead>
                  <TableHead>SKU Number</TableHead>
                  <TableHead>SKU ID</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {material.productName}
                      </TableCell>
                      <TableCell>{material.productBarcode}</TableCell>
                      <TableCell>{material.productType}</TableCell>
                      <TableCell className="font-mono text-xs">{material.skuNumber}</TableCell>
                      <TableCell className="font-mono text-xs">{material.skuId}</TableCell>
                      <TableCell className="font-mono text-xs">{material.productId}</TableCell>
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
