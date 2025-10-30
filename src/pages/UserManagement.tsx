import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, RefreshCw, Building2, Store } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
  return raw.replace(/\/+$/, '');
})();

type UserRole = 'superadmin' | 'admin' | 'user';
type UserType = 'warehouse' | 'company' | 'shop';

interface UserItem {
  id: number;
  username: string;
  full_name?: string | null;
  email?: string | null;
  role: UserRole;
  user_type: UserType;
  warehouse_id?: number | null;
  company_id?: number | null;
  shop_id?: number | null;
  is_active: boolean;
  created_at?: string | null;
}

interface Company {
  id: number;
  name: string;
  code: string;
  warehouse_id: number;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  tax_id?: string | null;
  is_active?: boolean;
  created_at?: string | null;
}

interface Shop {
  id: number;
  name: string;
  code: string;
  company_id: number;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface CompanyUserFormState {
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: UserRole;
  companyId: string;
}

interface CompanyFormState {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  tax_id: string;
  warehouseId: string;
}

interface ShopFormState {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  companyId: string;
}

const formatDateTime = (value: string) => {
  try {
    return new Date(value).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

const UserManagement = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);

  const [companySearch, setCompanySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [shopSearch, setShopSearch] = useState('');

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);

  const [userError, setUserError] = useState<string | null>(null);
  const [shopError, setShopError] = useState<string | null>(null);

  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);

  const [isSubmittingCompanyUser, setIsSubmittingCompanyUser] = useState(false);
  const [isCompanyCreateDialogOpen, setIsCompanyCreateDialogOpen] = useState(false);
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);
  const [isSubmittingShop, setIsSubmittingShop] = useState(false);

  const [companyUserForm, setCompanyUserForm] = useState<CompanyUserFormState>({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'admin',
    companyId: user?.company_id ? String(user.company_id) : '',
  });

  const [companyForm, setCompanyForm] = useState<CompanyFormState>({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    tax_id: '',
    warehouseId: user?.warehouse_id ? String(user.warehouse_id) : '',
  });

  const [shopForm, setShopForm] = useState<ShopFormState>({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    companyId: user?.company_id ? String(user.company_id) : '',
  });

  const companyMap = useMemo(() => {
    return companies.reduce<Map<number, Company>>((acc, company) => {
      acc.set(company.id, company);
      return acc;
    }, new Map());
  }, [companies]);

  const isWarehouseUser = user?.user_type === 'warehouse';
  const isWarehouseAdmin =
    isWarehouseUser && (user?.role === 'superadmin' || user?.role === 'admin');
  const isCompanyUser = user?.user_type === 'company';
  const showAddCompany = isWarehouseAdmin;
  const showAddShop = !isCompanyUser;

  const visibleCompanies = useMemo(() => {
    if (isWarehouseAdmin) {
      return companies;
    }
    if (isCompanyUser && user?.company_id) {
      return companies.filter((company) => company.id === user.company_id);
    }
    return companies;
  }, [companies, isCompanyUser, isWarehouseAdmin, user?.company_id]);

  const filteredCompanies = useMemo(() => {
    const term = companySearch.trim().toLowerCase();
    if (!term) {
      return visibleCompanies;
    }
    return visibleCompanies.filter((company) => {
      return (
        company.name.toLowerCase().includes(term) ||
        company.code.toLowerCase().includes(term) ||
        company.tax_id?.toLowerCase().includes(term) ||
        (company.address?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [companySearch, visibleCompanies]);

  const filteredCompanyUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    const source = users.filter((user) => user.user_type === 'company');
    if (!term) {
      return source;
    }
    return source.filter((user) => {
      return (
        user.username.toLowerCase().includes(term) ||
        user.full_name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        (user.company_id &&
          companyMap.get(user.company_id)?.name.toLowerCase().includes(term))
      );
    });
  }, [users, userSearch, companyMap]);

  const visibleShops = useMemo(() => {
    if (isCompanyUser && user?.company_id) {
      return shops.filter((shop) => shop.company_id === user.company_id);
    }
    return shops;
  }, [shops, isCompanyUser, user?.company_id]);

  const filteredShops = useMemo(() => {
    const term = shopSearch.trim().toLowerCase();
    if (!term) {
      return visibleShops;
    }
    return visibleShops.filter((shop) => {
      return (
        shop.name.toLowerCase().includes(term) ||
        shop.code.toLowerCase().includes(term) ||
        (companyMap.get(shop.company_id)?.name.toLowerCase().includes(term) ?? false)
      );
    });
  }, [visibleShops, shopSearch, companyMap]);

  const resetCompanyUserForm = useCallback(() => {
    setCompanyUserForm({
      username: '',
      password: '',
      full_name: '',
      email: '',
      role: 'admin',
      companyId: user?.company_id ? String(user.company_id) : '',
    });
  }, [user?.company_id]);

  const resetCompanyForm = useCallback(() => {
    setCompanyForm({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      tax_id: '',
      warehouseId: user?.warehouse_id ? String(user.warehouse_id) : '',
    });
  }, [user?.warehouse_id]);

  const resetShopForm = useCallback(() => {
    setShopForm({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      companyId: user?.company_id ? String(user.company_id) : '',
    });
  }, []);

  useEffect(() => {
    setCompanyForm((prev) => ({
      ...prev,
      warehouseId: user?.warehouse_id ? String(user.warehouse_id) : '',
    }));
  }, [user?.warehouse_id]);

  useEffect(() => {
    setCompanyUserForm((prev) => ({
      ...prev,
      companyId: prev.companyId || (user?.company_id ? String(user.company_id) : ''),
    }));
  }, [user?.company_id]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoadingUsers(true);
    setUserError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body?.detail || 'Unable to load users. Please try again.';
        throw new Error(message);
      }

      const data: UserItem[] = await response.json();
      setUsers(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error while loading users.';
      setUserError(message);
      toast({
        title: 'Failed to load users',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoadingUsers(false);
    }
  }, [token, toast]);

  const fetchCompanies = useCallback(async () => {
    if (!token) return;
    setLoadingCompanies(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body?.detail || 'Unable to load companies. Please try again.';
        throw new Error(message);
      }

      const data: Company[] = await response.json();
      setCompanies(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error while loading companies.';
      toast({
        title: 'Failed to load companies',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoadingCompanies(false);
    }
  }, [token, toast]);

  const fetchShops = useCallback(async () => {
    if (!token) return;
    setLoadingShops(true);
    setShopError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/shop/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body?.detail || 'Unable to load shops. Please try again.';
        throw new Error(message);
      }

      const data: Shop[] = await response.json();
      setShops(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error while loading shops.';
      setShopError(message);
      toast({
        title: 'Failed to load shops',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoadingShops(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    fetchCompanies();
    fetchShops();
  }, [token, fetchUsers, fetchCompanies, fetchShops]);

  const handleCreateCompanyUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast({
        title: 'Session expired',
        description: 'Please sign in again to manage users.',
        variant: 'destructive',
      });
      return;
    }

    if (!companyUserForm.companyId) {
      toast({
        title: 'Company required',
        description: 'Select a company before creating a company user.',
        variant: 'destructive',
      });
      return;
    }

    if (!companyUserForm.username.trim() || !companyUserForm.password.trim()) {
      toast({
        title: 'Incomplete form',
        description: 'Username and password are required.',
        variant: 'destructive',
      });
      return;
    }

    const selectedCompany = companyMap.get(Number(companyUserForm.companyId));
    if (!selectedCompany) {
      toast({
        title: 'Invalid company',
        description: 'Selected company no longer exists. Please refresh and try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingCompanyUser(true);
    try {
      const payload: Record<string, unknown> = {
        username: companyUserForm.username.trim(),
        password: companyUserForm.password,
        user_type: 'company',
        role: companyUserForm.role,
        company_id: selectedCompany.id,
        warehouse_id: selectedCompany.warehouse_id,
      };

      if (companyUserForm.full_name.trim()) {
        payload.full_name = companyUserForm.full_name.trim();
      }
      if (companyUserForm.email.trim()) {
        payload.email = companyUserForm.email.trim();
      }

      const response = await fetch(`${API_BASE_URL}/api/user/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.detail || 'Unable to create company user.';
        throw new Error(message);
      }

      const created: UserItem = await response.json();
      setUsers((current) => [created, ...current]);
      toast({
        title: 'Company user created',
        description: `User ${created.username} has been added successfully.`,
      });
      setIsCompanyDialogOpen(false);
      resetCompanyUserForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error while creating user.';
      toast({
        title: 'Failed to create user',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingCompanyUser(false);
    }
  };

  const handleCreateCompany = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast({
        title: 'Session expired',
        description: 'Please sign in again to manage companies.',
        variant: 'destructive',
      });
      return;
    }

    if (!companyForm.name.trim() || !companyForm.code.trim()) {
      toast({
        title: 'Incomplete form',
        description: 'Company name and company code are required.',
        variant: 'destructive',
      });
      return;
    }

    if (!companyForm.warehouseId.trim()) {
      toast({
        title: 'Warehouse required',
        description: 'Please specify a warehouse ID for the company.',
        variant: 'destructive',
      });
      return;
    }

    const warehouseIdNumber = Number(companyForm.warehouseId);
    if (Number.isNaN(warehouseIdNumber)) {
      toast({
        title: 'Invalid warehouse',
        description: 'Warehouse ID must be a valid number.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingCompany(true);
    try {
      const payload: Record<string, unknown> = {
        name: companyForm.name.trim(),
        code: companyForm.code.trim(),
        warehouse_id: warehouseIdNumber,
      };

      if (companyForm.address.trim()) payload.address = companyForm.address.trim();
      if (companyForm.phone.trim()) payload.phone = companyForm.phone.trim();
      if (companyForm.email.trim()) payload.email = companyForm.email.trim();
      if (companyForm.tax_id.trim()) payload.tax_id = companyForm.tax_id.trim();

      const response = await fetch(`${API_BASE_URL}/api/company/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.detail || 'Unable to create company.';
        throw new Error(message);
      }

      const created: Company = await response.json();
      setCompanies((current) => [created, ...current]);
      toast({
        title: 'Company created',
        description: `Company ${created.name} has been added successfully.`,
      });
      setIsCompanyCreateDialogOpen(false);
      resetCompanyForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error while creating company.';
      toast({
        title: 'Failed to create company',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  const handleCreateShop = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast({
        title: 'Session expired',
        description: 'Please sign in again to manage shops.',
        variant: 'destructive',
      });
      return;
    }

    if (!shopForm.companyId) {
      toast({
        title: 'Company required',
        description: 'Select a company before creating a shop.',
        variant: 'destructive',
      });
      return;
    }

    if (!shopForm.name.trim() || !shopForm.code.trim()) {
      toast({
        title: 'Incomplete form',
        description: 'Shop name and shop code are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingShop(true);
    try {
      const payload: Record<string, unknown> = {
        name: shopForm.name.trim(),
        code: shopForm.code.trim(),
        company_id: Number(shopForm.companyId),
      };

      if (shopForm.address.trim()) payload.address = shopForm.address.trim();
      if (shopForm.phone.trim()) payload.phone = shopForm.phone.trim();
      if (shopForm.email.trim()) payload.email = shopForm.email.trim();

      const response = await fetch(`${API_BASE_URL}/api/shop/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.detail || 'Unable to create shop.';
        throw new Error(message);
      }

      const created: Shop = await response.json();
      setShops((current) => [created, ...current]);
      toast({
        title: 'Shop created',
        description: `Shop ${created.name} has been added successfully.`,
      });
      setIsShopDialogOpen(false);
      resetShopForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error while creating shop.';
      toast({
        title: 'Failed to create shop',
        description: message,
        variant: 'destructive',
      });
  } finally {
    setIsSubmittingShop(false);
  }
};

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h1>
        </div>
        <p className="text-muted-foreground">
          Manage company-level users and shops according to the permissions configured in the backend.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Companies
            </CardTitle>
            <CardDescription>
              Organise companies under each warehouse and keep company contact information current.
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <Input
              placeholder="Search by name, code, address, or tax ID"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="w-full md:w-72"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchCompanies} disabled={loadingCompanies}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {showAddCompany && (
                <Dialog
                  open={isCompanyCreateDialogOpen}
                  onOpenChange={(open) => {
                    setIsCompanyCreateDialogOpen(open);
                    if (!open) resetCompanyForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Building2 className="w-4 h-4 mr-2" />
                      Add Company
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Company</DialogTitle>
                      <DialogDescription>
                        Provide company details and link it to the corresponding warehouse.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCompany} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="company_name">Company name</Label>
                          <Input
                            id="company_name"
                            value={companyForm.name}
                            onChange={(e) =>
                              setCompanyForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            required
                            disabled={isSubmittingCompany}
                          />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="company_code">Company code</Label>
                          <Input
                            id="company_code"
                            value={companyForm.code}
                            onChange={(e) =>
                              setCompanyForm((prev) => ({ ...prev, code: e.target.value }))
                            }
                            required
                            disabled={isSubmittingCompany}
                          />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="company_tax">Tax ID</Label>
                          <Input
                            id="company_tax"
                            value={companyForm.tax_id}
                            onChange={(e) =>
                              setCompanyForm((prev) => ({ ...prev, tax_id: e.target.value }))
                            }
                            disabled={isSubmittingCompany}
                          />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="company_address">Address</Label>
                          <Input
                            id="company_address"
                            value={companyForm.address}
                            onChange={(e) =>
                              setCompanyForm((prev) => ({ ...prev, address: e.target.value }))
                            }
                            disabled={isSubmittingCompany}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="company_phone">Phone</Label>
                          <Input
                            id="company_phone"
                            value={companyForm.phone}
                            onChange={(e) =>
                              setCompanyForm((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            disabled={isSubmittingCompany}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="company_email">Email</Label>
                          <Input
                            id="company_email"
                            type="email"
                            value={companyForm.email}
                            onChange={(e) =>
                              setCompanyForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                            disabled={isSubmittingCompany}
                          />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="company_warehouse">Warehouse ID</Label>
                          <Input
                            id="company_warehouse"
                            type="number"
                            value={companyForm.warehouseId}
                            onChange={(e) =>
                              setCompanyForm((prev) => ({ ...prev, warehouseId: e.target.value }))
                            }
                            disabled={isSubmittingCompany || (!!user?.warehouse_id && user.user_type === 'warehouse')}
                            required
                          />
                        </div>
                      </div>

                      <DialogFooter className="flex flex-col-reverse md:flex-row md:justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCompanyCreateDialogOpen(false);
                            resetCompanyForm();
                          }}
                          disabled={isSubmittingCompany}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmittingCompany}>
                          {isSubmittingCompany ? 'Creating...' : 'Create Company'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Tax ID</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCompanies ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading companies...
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No companies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.code}</TableCell>
                      <TableCell>Warehouse #{company.warehouse_id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{company.phone || '-'}</span>
                          <span className="text-muted-foreground">{company.email || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{company.tax_id || '-'}</TableCell>
                      <TableCell>{company.created_at ? formatDateTime(company.created_at) : '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Company Users
            </CardTitle>
            <CardDescription>
              View registered company users or onboard new ones for the selected organisation.
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <Input
              placeholder="Search by username, email, or company"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full md:w-72"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchUsers} disabled={loadingUsers}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Dialog
                open={isCompanyDialogOpen}
                onOpenChange={(open) => {
                  setIsCompanyDialogOpen(open);
                  if (!open) resetCompanyUserForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Company User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Company User</DialogTitle>
                    <DialogDescription>
                      Provide credentials and associate the user with the target company.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCompanyUser} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="company">Company</Label>
                        <Select
                          value={companyUserForm.companyId}
                          onValueChange={(value) =>
                            setCompanyUserForm((prev) => ({ ...prev, companyId: value }))
                          }
                          disabled={isSubmittingCompanyUser || loadingCompanies}
                        >
                          <SelectTrigger id="company">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={String(company.id)}>
                                {company.name} ({company.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={companyUserForm.role}
                          onValueChange={(value: UserRole) =>
                            setCompanyUserForm((prev) => ({ ...prev, role: value }))
                          }
                          disabled={isSubmittingCompanyUser}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={companyUserForm.username}
                          onChange={(e) =>
                            setCompanyUserForm((prev) => ({ ...prev, username: e.target.value }))
                          }
                          required
                          disabled={isSubmittingCompanyUser}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={companyUserForm.password}
                          onChange={(e) =>
                            setCompanyUserForm((prev) => ({ ...prev, password: e.target.value }))
                          }
                          required
                          disabled={isSubmittingCompanyUser}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="full_name">Full name</Label>
                        <Input
                          id="full_name"
                          value={companyUserForm.full_name}
                          onChange={(e) =>
                            setCompanyUserForm((prev) => ({ ...prev, full_name: e.target.value }))
                          }
                          disabled={isSubmittingCompanyUser}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={companyUserForm.email}
                          onChange={(e) =>
                            setCompanyUserForm((prev) => ({ ...prev, email: e.target.value }))
                          }
                          disabled={isSubmittingCompanyUser}
                        />
                      </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse md:flex-row md:justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCompanyDialogOpen(false);
                          resetCompanyUserForm();
                        }}
                        disabled={isSubmittingCompanyUser}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmittingCompanyUser}>
                        {isSubmittingCompanyUser ? 'Creating...' : 'Create User'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingUsers ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : userError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-destructive">
                      {userError}
                    </TableCell>
                  </TableRow>
                ) : filteredCompanyUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No company users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanyUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.full_name || '-'}</TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.company_id
                          ? companyMap.get(user.company_id)?.name ?? `Company #${user.company_id}`
                          : '-'}
                      </TableCell>
                      <TableCell>{formatDateTime(user.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Shops
            </CardTitle>
            <CardDescription>
              Create and maintain shop information for each company.
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <Input
              placeholder="Search by shop name, code, or company"
              value={shopSearch}
              onChange={(e) => setShopSearch(e.target.value)}
              className="w-full md:w-72"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchShops} disabled={loadingShops}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {showAddShop && (
                <Dialog
                  open={isShopDialogOpen}
                  onOpenChange={(open) => {
                    setIsShopDialogOpen(open);
                    if (!open) resetShopForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Store className="w-4 h-4 mr-2" />
                      Add Shop
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Shop</DialogTitle>
                      <DialogDescription>
                        Provide shop details and assign the shop to a company.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateShop} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="shop_company">Company</Label>
                          <Select
                            value={shopForm.companyId}
                            onValueChange={(value) =>
                              setShopForm((prev) => ({ ...prev, companyId: value }))
                            }
                            disabled={isSubmittingShop || loadingCompanies}
                          >
                            <SelectTrigger id="shop_company">
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={String(company.id)}>
                                  {company.name} ({company.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="shop_name">Shop name</Label>
                          <Input
                            id="shop_name"
                            value={shopForm.name}
                            onChange={(e) =>
                              setShopForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            required
                            disabled={isSubmittingShop}
                          />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="shop_code">Shop code</Label>
                          <Input
                            id="shop_code"
                            value={shopForm.code}
                            onChange={(e) =>
                              setShopForm((prev) => ({ ...prev, code: e.target.value }))
                            }
                            required
                            disabled={isSubmittingShop}
                          />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor="shop_address">Address</Label>
                          <Input
                            id="shop_address"
                            value={shopForm.address}
                            onChange={(e) =>
                              setShopForm((prev) => ({ ...prev, address: e.target.value }))
                            }
                            disabled={isSubmittingShop}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="shop_phone">Phone</Label>
                          <Input
                            id="shop_phone"
                            value={shopForm.phone}
                            onChange={(e) =>
                              setShopForm((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            disabled={isSubmittingShop}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="shop_email">Email</Label>
                          <Input
                            id="shop_email"
                            type="email"
                            value={shopForm.email}
                            onChange={(e) =>
                              setShopForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                            disabled={isSubmittingShop}
                          />
                        </div>
                      </div>

                      <DialogFooter className="flex flex-col-reverse md:flex-row md:justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsShopDialogOpen(false);
                            resetShopForm();
                          }}
                          disabled={isSubmittingShop}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmittingShop}>
                          {isSubmittingShop ? 'Creating...' : 'Create Shop'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingShops ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading shops...
                    </TableCell>
                  </TableRow>
                ) : shopError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-destructive">
                      {shopError}
                    </TableCell>
                  </TableRow>
                ) : filteredShops.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No shops found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.code}</TableCell>
                      <TableCell>
                        {companyMap.get(shop.company_id)?.name ?? `Company #${shop.company_id}`}
                      </TableCell>
                      <TableCell>{shop.phone || '-'}</TableCell>
                      <TableCell>{shop.email || '-'}</TableCell>
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

export default UserManagement;

