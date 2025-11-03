import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Users, Package, Activity, ClipboardList, Search, Monitor, Key, Download } from "lucide-react";
import { BarcodeDisplay } from "@/components/BarcodeDisplay";
import { downloadBarcodesAsPDF } from "@/lib/barcode-utils";
import { useToast } from "@/hooks/use-toast";
import { AVATAR_IMAGES } from "@/lib/avatars";
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
  id: string;
  name: string;
  imageUrl?: string;
}

interface BDEMachine {
  id: string;
  machineId: string;
  department?: string;
  isAdmin?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface MasterDataItem {
  id?: string;
  partNumber?: string;
  orderNumber?: string;
  performanceId?: string;
  performanceName?: string;
  isActive: boolean;
}

interface AdminDashboardProps {
  users?: User[];
  partNumbers?: MasterDataItem[];
  orderNumbers?: MasterDataItem[];
  performanceIds?: MasterDataItem[];
  bdeMachines?: BDEMachine[];
  onAddUser?: (name: string, imageUrl: string | null) => Promise<void>;
  onAddMachine?: (machineId: string, password: string, department: string, isAdmin: boolean) => Promise<void>;
  onAddPartNumber?: (partNumber: string) => Promise<void>;
  onAddOrderNumber?: (orderNumber: string) => Promise<void>;
  onAddPerformanceId?: (performanceId: string, performanceName: string) => Promise<void>;
  onResetPassword?: (machineId: string, password: string) => Promise<void>;
  onDeleteMachine?: (id: string) => Promise<void>;
  onDeleteUser?: (id: string) => Promise<void>;
  onDeletePartNumber?: (id: string) => Promise<void>;
  onDeleteOrderNumber?: (id: string) => Promise<void>;
  onDeletePerformanceId?: (id: string) => Promise<void>;
}

export default function AdminDashboard({
  users = [],
  partNumbers = [],
  orderNumbers = [],
  performanceIds = [],
  bdeMachines = [],
  onAddUser,
  onAddMachine,
  onAddPartNumber,
  onAddOrderNumber,
  onAddPerformanceId,
  onResetPassword,
  onDeleteMachine,
  onDeleteUser,
  onDeletePartNumber,
  onDeleteOrderNumber,
  onDeletePerformanceId,
}: AdminDashboardProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<BDEMachine | null>(null);
  const [activeTab, setActiveTab] = useState("machines");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: string; id: string; name: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    machineId: "",
    password: "",
    department: "",
    isAdmin: false,
    newPassword: "",
    confirmPassword: "",
    performanceId: "",
    performanceName: "",
  });
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(0);

  const { toast } = useToast();
  
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPartNumberBarcodes = async () => {
    if (partNumbers.length === 0) {
      toast({
        title: "No Data",
        description: "No part numbers available to download",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const items = partNumbers.map(pn => ({ id: pn.partNumber!, value: pn.partNumber! }));
      await downloadBarcodesAsPDF(items, "Part Numbers Barcodes");
      toast({
        title: "Success",
        description: "Barcodes downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleDownloadOrderNumberBarcodes = async () => {
    if (orderNumbers.length === 0) {
      toast({
        title: "No Data",
        description: "No order numbers available to download",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const items = orderNumbers.map(on => ({ id: on.orderNumber!, value: on.orderNumber! }));
      await downloadBarcodesAsPDF(items, "Order Numbers Barcodes");
      toast({
        title: "Success",
        description: "Barcodes downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPerformanceIdBarcodes = async () => {
    if (performanceIds.length === 0) {
      toast({
        title: "No Data",
        description: "No performance IDs available to download",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const items = performanceIds.map(pid => ({ 
        id: pid.performanceId!, 
        value: pid.performanceId!,
        description: pid.performanceName 
      }));
      await downloadBarcodesAsPDF(items, "Performance IDs Barcodes");
      toast({
        title: "Success",
        description: "Barcodes downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = (machine: BDEMachine) => {
    setSelectedMachine(machine);
    setShowResetPasswordDialog(true);
    setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
  };

  const handleDeleteClick = (type: string, id: string, name: string) => {
    setDeleteItem({ type, id, name });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    setIsSubmitting(true);
    try {
      switch (deleteItem.type) {
        case 'machine':
          await onDeleteMachine?.(deleteItem.id);
          break;
        case 'user':
          await onDeleteUser?.(deleteItem.id);
          break;
        case 'partNumber':
          await onDeletePartNumber?.(deleteItem.id);
          break;
        case 'orderNumber':
          await onDeleteOrderNumber?.(deleteItem.id);
          break;
        case 'performanceId':
          await onDeletePerformanceId?.(deleteItem.id);
          break;
      }

      toast({
        title: t.admin.deleteSuccess || "Deleted successfully",
        description: `${deleteItem.name} ${t.admin.deleteSuccessDescription || "has been deleted"}`,
      });

      setShowDeleteDialog(false);
      setDeleteItem(null);
    } catch (error) {
      toast({
        title: t.admin.deleteError || "Error",
        description: t.admin.deleteErrorDescription || "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddDialog = () => {
    setFormData({
      name: "",
      machineId: "",
      password: "",
      department: "",
      isAdmin: false,
      newPassword: "",
      confirmPassword: "",
      performanceId: "",
      performanceName: "",
    });
    setSelectedAvatarIndex(0);
    setShowAddDialog(true);
  };

  const handleSubmitAdd = async () => {
    setIsSubmitting(true);
    try {
      if (activeTab === "machines") {
        if (!formData.machineId || !formData.password || !formData.department) {
          alert("Please fill all fields");
          return;
        }
        await onAddMachine?.(formData.machineId, formData.password, formData.department, formData.isAdmin);
      } else if (activeTab === "users") {
        if (!formData.name) {
          alert("Please fill all fields");
          return;
        }
        
        const avatarUrl = AVATAR_IMAGES[selectedAvatarIndex];
        await onAddUser?.(formData.name, avatarUrl);
      } else if (activeTab === "parts") {
        if (!formData.name) {
          alert("Please enter a part number");
          return;
        }
        await onAddPartNumber?.(formData.name);
      } else if (activeTab === "orders") {
        if (!formData.name) {
          alert("Please enter an order number");
          return;
        }
        await onAddOrderNumber?.(formData.name);
      } else if (activeTab === "performance") {
        if (!formData.performanceId || !formData.performanceName) {
          alert("Please enter both performance ID and name");
          return;
        }
        await onAddPerformanceId?.(formData.performanceId, formData.performanceName);
      }
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResetPassword = async () => {
    if (!selectedMachine) return;
    
    if (!formData.newPassword || !formData.confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await onResetPassword?.(selectedMachine.id, formData.newPassword);
      setShowResetPasswordDialog(false);
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
            {t.admin.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage BDE machines, users, and master data
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="machines" data-testid="tab-machines">
              <Monitor className="w-4 h-4 mr-2" />
              {t.admin.machines}
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              {t.admin.users}
            </TabsTrigger>
            <TabsTrigger value="parts" data-testid="tab-parts">
              <Package className="w-4 h-4 mr-2" />
              {t.admin.partNumbers}
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ClipboardList className="w-4 h-4 mr-2" />
              {t.admin.orderNumbers}
            </TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">
              <Activity className="w-4 h-4 mr-2" />
              {t.admin.performanceIds}
            </TabsTrigger>
          </TabsList>

          {/* BDE Machines Tab */}
          <TabsContent value="machines" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>{t.admin.machines}</CardTitle>
                    <CardDescription>Manage machine IDs and credentials</CardDescription>
                  </div>
                  <Button onClick={handleOpenAddDialog} data-testid="button-add-machine">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.admin.addMachine}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.admin.machineId}</TableHead>
                      <TableHead>{t.admin.department}</TableHead>
                      <TableHead>{t.admin.admin}</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>{t.admin.lastLogin}</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bdeMachines.map((machine) => (
                      <TableRow key={machine.id} data-testid={`row-machine-${machine.id}`}>
                        <TableCell className="font-mono font-medium">{machine.machineId}</TableCell>
                        <TableCell>{machine.department || "-"}</TableCell>
                        <TableCell>
                          {machine.isAdmin ? (
                            <Badge variant="default" data-testid={`badge-admin-${machine.id}`}>{t.admin.admin}</Badge>
                          ) : (
                            <Badge variant="secondary" data-testid={`badge-user-${machine.id}`}>{t.admin.user}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(machine.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(machine.lastLoginAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleResetPassword(machine)}
                              data-testid={`button-reset-password-${machine.id}`}
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteClick('machine', machine.id, machine.machineId)}
                              data-testid={`button-delete-machine-${machine.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>{t.admin.users}</CardTitle>
                    <CardDescription>Manage worker profiles</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={`${t.search}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                        data-testid="input-search-users"
                      />
                    </div>
                    <Button onClick={handleOpenAddDialog} data-testid="button-add-user">
                      <Plus className="w-4 h-4 mr-2" />
                      {t.admin.addUser}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.admin.user}</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.imageUrl} alt={user.name} />
                              <AvatarFallback>
                                {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick('user', user.id, user.name)}
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Part Numbers Tab */}
          <TabsContent value="parts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>{t.admin.partNumbers}</CardTitle>
                    <CardDescription>Manage part number catalog with barcodes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadPartNumberBarcodes}
                      data-testid="button-download-part-barcodes"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t.admin.downloadBarcodes}
                    </Button>
                    <Button onClick={handleOpenAddDialog} data-testid="button-add-part">
                      <Plus className="w-4 h-4 mr-2" />
                      {t.admin.addPartNumber}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.tracker.partNumber}</TableHead>
                      <TableHead>{t.admin.barcode}</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partNumbers.map((pn) => (
                      <TableRow key={pn.id!} data-testid={`row-part-${pn.id}`}>
                        <TableCell className="font-mono">{pn.partNumber}</TableCell>
                        <TableCell>
                          <BarcodeDisplay text={pn.partNumber!} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick('partNumber', pn.id!, pn.partNumber!)}
                            data-testid={`button-delete-part-${pn.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order Numbers Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>{t.admin.orderNumbers}</CardTitle>
                    <CardDescription>Manage order number catalog with barcodes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadOrderNumberBarcodes}
                      data-testid="button-download-order-barcodes"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t.admin.downloadBarcodes}
                    </Button>
                    <Button onClick={handleOpenAddDialog} data-testid="button-add-order">
                      <Plus className="w-4 h-4 mr-2" />
                      {t.admin.addOrderNumber}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.tracker.orderNumber}</TableHead>
                      <TableHead>{t.admin.barcode}</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderNumbers.map((on) => (
                      <TableRow key={on.id!} data-testid={`row-order-${on.id}`}>
                        <TableCell className="font-mono">{on.orderNumber}</TableCell>
                        <TableCell>
                          <BarcodeDisplay text={on.orderNumber!} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick('orderNumber', on.id!, on.orderNumber!)}
                            data-testid={`button-delete-order-${on.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance IDs Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>{t.admin.performanceIds}</CardTitle>
                    <CardDescription>Manage performance ID catalog with barcodes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadPerformanceIdBarcodes}
                      data-testid="button-download-performance-barcodes"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t.admin.downloadBarcodes}
                    </Button>
                    <Button onClick={handleOpenAddDialog} data-testid="button-add-performance">
                      <Plus className="w-4 h-4 mr-2" />
                      {t.admin.addPerformanceId}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Performance ID</TableHead>
                      <TableHead>Performance Name</TableHead>
                      <TableHead>{t.admin.barcode}</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceIds.map((pid) => (
                      <TableRow key={pid.performanceId} data-testid={`row-performance-${pid.performanceId}`}>
                        <TableCell className="font-mono">{pid.performanceId}</TableCell>
                        <TableCell className="font-medium">{pid.performanceName}</TableCell>
                        <TableCell>
                          <BarcodeDisplay text={pid.performanceId!} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick('performanceId', pid.performanceId!, `${pid.performanceId} - ${pid.performanceName}`)}
                            data-testid={`button-delete-performance-${pid.performanceId}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {activeTab === "machines" 
                  ? t.admin.addMachine
                  : activeTab === "users"
                  ? t.admin.addUser
                  : activeTab === "parts"
                  ? t.admin.addPartNumber
                  : activeTab === "orders"
                  ? t.admin.addOrderNumber
                  : t.admin.addPerformanceId
                }
              </DialogTitle>
              <DialogDescription>
                {activeTab === "machines" 
                  ? "Create a new BDE machine with ID, password, and department"
                  : `Add a new ${activeTab === "users" ? "user" : activeTab.slice(0, -1)} to the system`
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {activeTab === "machines" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="machineId">{t.admin.machineId}</Label>
                    <Input 
                      id="machineId" 
                      placeholder="e.g., BDE-2" 
                      value={formData.machineId}
                      onChange={(e) => setFormData(prev => ({ ...prev, machineId: e.target.value }))}
                      data-testid="input-machine-id" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">{t.admin.department}</Label>
                    <Input 
                      id="department" 
                      placeholder="e.g., Production" 
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      data-testid="input-department" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Enter password" 
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      data-testid="input-password" 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isAdmin"
                      checked={formData.isAdmin}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAdmin: checked as boolean }))}
                      data-testid="checkbox-is-admin"
                    />
                    <Label 
                      htmlFor="isAdmin"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {t.admin.isAdmin}
                    </Label>
                  </div>
                </>
              ) : activeTab === "users" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.admin.name}</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter name" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="input-add-name" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>{t.admin.selectImage}</Label>
                    <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                      {AVATAR_IMAGES.map((avatar, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedAvatarIndex(index)}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all hover-elevate ${
                            selectedAvatarIndex === index 
                              ? 'border-primary ring-2 ring-primary ring-offset-2' 
                              : 'border-border'
                          }`}
                          data-testid={`button-avatar-${index}`}
                        >
                          <img 
                            src={avatar} 
                            alt={`Avatar ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="w-16 h-16 border-2">
                        <AvatarImage src={AVATAR_IMAGES[selectedAvatarIndex]} />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-semibold">Selected Avatar</p>
                        <p className="text-muted-foreground">Avatar {selectedAvatarIndex + 1} of {AVATAR_IMAGES.length}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeTab === "performance" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="performanceId">Performance ID *</Label>
                    <Input 
                      id="performanceId" 
                      placeholder="e.g., P001"
                      value={formData.performanceId}
                      onChange={(e) => setFormData(prev => ({ ...prev, performanceId: e.target.value }))}
                      data-testid="input-performance-id" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="performanceName">Performance Name *</Label>
                    <Input 
                      id="performanceName" 
                      placeholder="e.g., Assembly Line A"
                      value={formData.performanceName}
                      onChange={(e) => setFormData(prev => ({ ...prev, performanceName: e.target.value }))}
                      data-testid="input-performance-name" 
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {activeTab === "parts" 
                      ? t.tracker.partNumber
                      : t.tracker.orderNumber
                    }
                  </Label>
                  <Input 
                    id="name" 
                    placeholder={`Enter ${activeTab === "parts" ? "part number" : "order number"}`}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-add-name" 
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)} 
                disabled={isSubmitting}
                data-testid="button-cancel-add"
              >
                {t.cancel}
              </Button>
              <Button 
                onClick={handleSubmitAdd} 
                disabled={isSubmitting}
                data-testid="button-confirm-add"
              >
                {isSubmitting ? `${t.add}...` : t.add}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Reset password for {selectedMachine?.machineId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  placeholder="Enter new password" 
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  data-testid="input-new-password" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  data-testid="input-confirm-password" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowResetPasswordDialog(false)} 
                disabled={isSubmitting}
                data-testid="button-cancel-reset"
              >
                {t.cancel}
              </Button>
              <Button 
                onClick={handleSubmitResetPassword} 
                disabled={isSubmitting}
                data-testid="button-confirm-reset"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.admin.confirmDelete || "Confirm Delete"}</DialogTitle>
              <DialogDescription>
                {t.admin.deleteConfirmMessage || "Are you sure you want to delete"} "{deleteItem?.name}"?
                {t.admin.deleteWarning || " This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)} 
                disabled={isSubmitting}
                data-testid="button-cancel-delete"
              >
                {t.cancel}
              </Button>
              <Button 
                variant="destructive"
                onClick={handleConfirmDelete} 
                disabled={isSubmitting}
                data-testid="button-confirm-delete"
              >
                {isSubmitting ? (t.admin.deleting || "Deleting...") : t.delete}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
