import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface Location {
  id: string;
  locationCode: string;
  zone: string;
  area: string;
  rack: string;
  level: string;
  position: string;
  status: 'active' | 'inactive' | 'maintenance';
}

const mockLocations: Location[] = [
  {
    id: '1',
    locationCode: '1AP_A10204',
    zone: '1',
    area: 'AP',
    rack: 'A102',
    level: '04',
    position: 'A',
    status: 'active',
  },
  {
    id: '2',
    locationCode: '1AP_A20205',
    zone: '1',
    area: 'AP',
    rack: 'A202',
    level: '05',
    position: 'B',
    status: 'active',
  },
  {
    id: '3',
    locationCode: '1AR_B10101',
    zone: '1',
    area: 'AR',
    rack: 'B101',
    level: '01',
    position: 'A',
    status: 'active',
  },
  {
    id: '4',
    locationCode: '1AR_B10102',
    zone: '1',
    area: 'AR',
    rack: 'B101',
    level: '02',
    position: 'B',
    status: 'active',
  },
  {
    id: '5',
    locationCode: '1CR_D30401',
    zone: '1',
    area: 'CR',
    rack: 'D304',
    level: '01',
    position: 'A',
    status: 'maintenance',
  },
  {
    id: '6',
    locationCode: '2AP_A10204',
    zone: '2',
    area: 'AP',
    rack: 'A102',
    level: '04',
    position: 'A',
    status: 'active',
  },
];

const LocationMaster = () => {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    locationCode: '',
    zone: '',
    area: '',
    rack: '',
    level: '',
    position: '',
    status: 'active' as Location['status'],
  });

  const filteredLocations = locations.filter(
    (location) =>
      location.locationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.zone.includes(searchTerm) ||
      location.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLocation) {
      setLocations(
        locations.map((l) =>
          l.id === editingLocation.id ? { ...formData, id: l.id } : l
        )
      );
      toast({
        title: 'อัปเดตสำเร็จ',
        description: 'ข้อมูลตำแหน่งถูกอัปเดตเรียบร้อยแล้ว',
      });
    } else {
      const newLocation: Location = {
        ...formData,
        id: Date.now().toString(),
      };
      setLocations([...locations, newLocation]);
      toast({
        title: 'เพิ่มสำเร็จ',
        description: 'เพิ่มข้อมูลตำแหน่งเรียบร้อยแล้ว',
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      locationCode: location.locationCode,
      zone: location.zone,
      area: location.area,
      rack: location.rack,
      level: location.level,
      position: location.position,
      status: location.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLocations(locations.filter((l) => l.id !== id));
    toast({
      title: 'ลบสำเร็จ',
      description: 'ลบข้อมูลตำแหน่งเรียบร้อยแล้ว',
      variant: 'destructive',
    });
  };

  const resetForm = () => {
    setFormData({
      locationCode: '',
      zone: '',
      area: '',
      rack: '',
      level: '',
      position: '',
      status: 'active',
    });
    setEditingLocation(null);
  };

  const getStatusBadge = (status: Location['status']) => {
    const variants: Record<Location['status'], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: 'default', label: 'ใช้งาน' },
      inactive: { variant: 'secondary', label: 'ไม่ใช้งาน' },
      maintenance: { variant: 'destructive', label: 'ซ่อมบำรุง' },
    };
    
    return (
      <Badge variant={variants[status].variant}>
        {variants[status].label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Location Master</h1>
            <p className="text-xs md:text-sm text-muted-foreground">จัดการรหัสตำแหน่งจัดเก็บสินค้า</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มตำแหน่ง
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? 'แก้ไขข้อมูลตำแหน่ง' : 'เพิ่มข้อมูลตำแหน่ง'}
              </DialogTitle>
              <DialogDescription>
                กรอกข้อมูลตำแหน่งจัดเก็บให้ครบถ้วน
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="locationCode">Location Code</Label>
                  <Input
                    id="locationCode"
                    placeholder="เช่น 1AP_A10204"
                    value={formData.locationCode}
                    onChange={(e) =>
                      setFormData({ ...formData, locationCode: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="zone">Zone (โซน)</Label>
                    <Input
                      id="zone"
                      placeholder="เช่น 1, 2, 3"
                      value={formData.zone}
                      onChange={(e) =>
                        setFormData({ ...formData, zone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="area">Area (พื้นที่)</Label>
                    <Input
                      id="area"
                      placeholder="เช่น AP, AR, CR"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rack">Rack (ชั้นวาง)</Label>
                    <Input
                      id="rack"
                      placeholder="เช่น A102"
                      value={formData.rack}
                      onChange={(e) =>
                        setFormData({ ...formData, rack: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level">Level (ระดับ)</Label>
                    <Input
                      id="level"
                      placeholder="เช่น 01, 02"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="position">Position (ตำแหน่ง)</Label>
                    <Input
                      id="position"
                      placeholder="เช่น A, B"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">สถานะ</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Location['status']) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                      <SelectItem value="maintenance">ซ่อมบำรุง</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {editingLocation ? 'อัปเดต' : 'เพิ่ม'}
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
              placeholder="ค้นหาด้วย Location Code, Zone หรือ Area..."
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
                  <TableHead>Location Code</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Rack</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-mono font-medium">
                        {location.locationCode}
                      </TableCell>
                      <TableCell>{location.zone}</TableCell>
                      <TableCell>{location.area}</TableCell>
                      <TableCell>{location.rack}</TableCell>
                      <TableCell>{location.level}</TableCell>
                      <TableCell>{location.position}</TableCell>
                      <TableCell>{getStatusBadge(location.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(location)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(location.id)}
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

export default LocationMaster;
