import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
  return raw.replace(/\/+$/, '');
})();

interface Location {
  id: number;
  location_code: string;
  zone?: string | null;
  area?: string | null;
  rack?: string | null;
  level?: string | null;
  position?: string | null;
  is_active: boolean;
  warehouse_id: number;
  created_at?: string | null;
}

interface FormState {
  locationCode: string;
  zone: string;
  area: string;
  rack: string;
  level: string;
  position: string;
  isActive: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  locationCode: '',
  zone: '',
  area: '',
  rack: '',
  level: '',
  position: '',
  isActive: true,
};

const LocationMaster: React.FC = () => {
  const { toast } = useToast();
  const { token, user } = useAuth();

  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM_STATE);

  const isWarehouseUser = user?.user_type === 'warehouse';
  const warehouseId = user?.warehouse_id ?? null;
  const canManageLocations = isWarehouseUser && warehouseId !== null;

  const showErrorToast = useCallback(
    (description: string, title = 'Error') => {
      toast({
        variant: 'destructive',
        title,
        description,
      });
    },
    [toast]
  );

  const showSuccessToast = useCallback(
    (description: string, title = 'Success') => {
      toast({
        title,
        description,
      });
    },
    [toast]
  );

  const resetForm = useCallback(() => {
    setFormData({ ...INITIAL_FORM_STATE });
    setEditingLocation(null);
  }, []);

  const fetchLocations = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/location/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body?.detail || 'Unable to load locations. Please try again.';
        throw new Error(message);
      }

      const data: Location[] = await response.json();
      setLocations(
        data.sort((a, b) => a.location_code.localeCompare(b.location_code))
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected error while loading locations.';
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, showErrorToast]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const filteredLocations = useMemo(() => {
    if (!searchTerm.trim()) {
      return locations;
    }

    const term = searchTerm.trim().toLowerCase();
    return locations.filter((location) => {
      return (
        location.location_code.toLowerCase().includes(term) ||
        location.zone?.toLowerCase().includes(term) ||
        location.area?.toLowerCase().includes(term) ||
        location.rack?.toLowerCase().includes(term) ||
        location.level?.toLowerCase().includes(term) ||
        location.position?.toLowerCase().includes(term)
      );
    });
  }, [locations, searchTerm]);

  const handleDialogToggle = (open: boolean) => {
    if (open && !canManageLocations) {
      showErrorToast('Only warehouse users can create or edit locations.');
      return;
    }

    if (!open) {
      resetForm();
    }

    setIsDialogOpen(open);
  };

  const handleEdit = (location: Location) => {
    if (!canManageLocations) {
      return;
    }

    setEditingLocation(location);
    setFormData({
      locationCode: location.location_code,
      zone: location.zone ?? '',
      area: location.area ?? '',
      rack: location.rack ?? '',
      level: location.level ?? '',
      position: location.position ?? '',
      isActive: location.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (locationId: number) => {
    if (!canManageLocations) {
      return;
    }

    if (!token) {
      showErrorToast('Please sign in to continue.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/location/${locationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.detail || 'Unable to delete the location.';
        throw new Error(message);
      }

      setLocations((current) =>
        current.filter((location) => location.id !== locationId)
      );
      showSuccessToast('Location deleted successfully.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected error while deleting.';
      showErrorToast(message);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      showErrorToast('Please sign in to continue.');
      return;
    }

    if (!formData.locationCode.trim()) {
      showErrorToast('Please enter a location code.');
      return;
    }

    if (!canManageLocations) {
      showErrorToast('Only warehouse users can manage locations.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingLocation) {
        if (formData.locationCode.trim() !== editingLocation.location_code) {
          showErrorToast(
            'Location code cannot be changed. Please create a new location instead.'
          );
          return;
        }

        const payload = {
          zone: formData.zone.trim() || null,
          area: formData.area.trim() || null,
          rack: formData.rack.trim() || null,
          level: formData.level.trim() || null,
          position: formData.position.trim() || null,
          is_active: formData.isActive,
        };

        const response = await fetch(
          `${API_BASE_URL}/api/location/${editingLocation.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const responseBody = await response.json().catch(() => null);
          const message =
            responseBody?.detail || 'Unable to update the location.';
          throw new Error(message);
        }

        const updated: Location = await response.json();
        setLocations((current) =>
          current
            .map((item) => (item.id === updated.id ? updated : item))
            .sort((a, b) => a.location_code.localeCompare(b.location_code))
        );
        showSuccessToast('Location updated successfully.');
      } else {
        if (!warehouseId) {
          throw new Error(
            'Warehouse information is required to create a location.'
          );
        }

        const createBody = {
          location_code: formData.locationCode.trim(),
          zone: formData.zone.trim() || null,
          area: formData.area.trim() || null,
          rack: formData.rack.trim() || null,
          level: formData.level.trim() || null,
          position: formData.position.trim() || null,
          warehouse_id: warehouseId,
          is_active: formData.isActive,
        };

        const response = await fetch(`${API_BASE_URL}/api/location/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createBody),
        });

        if (!response.ok) {
          const responseBody = await response.json().catch(() => null);
          const message =
            responseBody?.detail || 'Unable to create the location.';
          throw new Error(message);
        }

        const created: Location = await response.json();
        setLocations((current) =>
          [created, ...current].sort((a, b) =>
            a.location_code.localeCompare(b.location_code)
          )
        );
        showSuccessToast('Location created successfully.');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected error while saving location.';
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-700">
          Active
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-600">
        Inactive
      </Badge>
    );
  };

  const modalTitle = editingLocation ? 'Edit location' : 'Add location';
  const modalDescription = editingLocation
    ? 'Update zone, rack, or availability for this storage location.'
    : 'Create a new storage location and configure its availability.';
  const submitLabel = editingLocation ? 'Save changes' : 'Create location';

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Location Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage warehouse locations, track availability, and keep your storage map up to date.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={fetchLocations} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogToggle}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="capitalize">{modalTitle}</DialogTitle>
                <DialogDescription>{modalDescription}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationCode">Location Code</Label>
                    <Input
                      id="locationCode"
                      placeholder="e.g. 1AP_A10204"
                      value={formData.locationCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          locationCode: e.target.value.toUpperCase(),
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zone">Zone</Label>
                    <Input
                      id="zone"
                      placeholder="e.g. Zone A"
                      value={formData.zone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, zone: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      placeholder="e.g. Area 12"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, area: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rack">Rack</Label>
                    <Input
                      id="rack"
                      placeholder="e.g. Rack B"
                      value={formData.rack}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, rack: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Input
                      id="level"
                      placeholder="e.g. Level 3"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, level: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      placeholder="Optional notes (e.g. aisle, bay)"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, position: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: value === 'active',
                        }))
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : submitLabel}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by location code, zone, area, rack, or level"
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading locations...
                    </TableCell>
                  </TableRow>
                ) : filteredLocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No locations found for the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-mono font-medium">
                        {location.location_code}
                      </TableCell>
                      <TableCell>{location.zone || '-'}</TableCell>
                      <TableCell>{location.area || '-'}</TableCell>
                      <TableCell>{location.rack || '-'}</TableCell>
                      <TableCell>{location.level || '-'}</TableCell>
                      <TableCell>{location.position || '-'}</TableCell>
                      <TableCell>{getStatusBadge(location.is_active)}</TableCell>
                      <TableCell className="text-right">
                        {canManageLocations ? (
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
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">View only</span>
                        )}
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
