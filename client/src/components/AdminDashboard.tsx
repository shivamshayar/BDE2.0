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
import { Plus, Trash2, Users, Package, Activity, ClipboardList, Search, Monitor, Key, Download } from "lucide-react";
import { BarcodeDisplay } from "@/components/BarcodeDisplay";
import { downloadBarcodesAsPDF } from "@/lib/barcode-utils";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  imageUrl?: string;
}

interface BDEMachine {
  id: string;
  machineId: string;
  department?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminDashboardProps {
  users?: User[];
  partNumbers?: string[];
  orderNumbers?: string[];
  performanceIds?: string[];
  bdeMachines?: BDEMachine[];
  onAddUser?: (name: string, imageUrl: string | null) => Promise<void>;
  onAddMachine?: (machineId: string, password: string, department: string) => Promise<void>;
  onAddPartNumber?: (partNumber: string) => Promise<void>;
  onAddOrderNumber?: (orderNumber: string) => Promise<void>;
  onAddPerformanceId?: (performanceId: string) => Promise<void>;
  onResetPassword?: (machineId: string, password: string) => Promise<void>;
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
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<BDEMachine | null>(null);
  const [activeTab, setActiveTab] = useState("machines");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    machineId: "",
    password: "",
    department: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      const items = partNumbers.map(pn => ({ id: pn, value: pn }));
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
      const items = orderNumbers.map(on => ({ id: on, value: on }));
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
      const items = performanceIds.map(pid => ({ id: pid, value: pid }));
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

  const handleOpenAddDialog = () => {
    setFormData({
      name: "",
      machineId: "",
      password: "",
      department: "",
      newPassword: "",
      confirmPassword: "",
    });
    setSelectedImage(null);
    setImagePreview("");
    setShowAddDialog(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      setIsUploadingImage(true);
      const response = await fetch("/api/upload/user-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmitAdd = async () => {
    setIsSubmitting(true);
    try {
      if (activeTab === "machines") {
        if (!formData.machineId || !formData.password || !formData.department) {
          alert("Please fill all fields");
          return;
        }
        await onAddMachine?.(formData.machineId, formData.password, formData.department);
      } else if (activeTab === "users") {
        if (!formData.name) {
          alert("Please fill all fields");
          return;
        }
        
        // Upload image if selected
        let imageUrl = null;
        if (selectedImage) {
          imageUrl = await uploadImage();
          if (!imageUrl) {
            alert("Failed to upload image");
            return;
          }
        }
        
        await onAddUser?.(formData.name, imageUrl);
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
        if (!formData.name) {
          alert("Please enter a performance ID");
          return;
        }
        await onAddPerformanceId?.(formData.name);
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
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage BDE machines, users, and master data
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="machines" data-testid="tab-machines">
              <Monitor className="w-4 h-4 mr-2" />
              BDE Machines
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="parts" data-testid="tab-parts">
              <Package className="w-4 h-4 mr-2" />
              Part Numbers
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ClipboardList className="w-4 h-4 mr-2" />
              Order Numbers
            </TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">
              <Activity className="w-4 h-4 mr-2" />
              Performance IDs
            </TabsTrigger>
          </TabsList>

          {/* BDE Machines Tab */}
          <TabsContent value="machines" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>BDE Machines</CardTitle>
                    <CardDescription>Manage machine IDs and credentials</CardDescription>
                  </div>
                  <Button onClick={handleOpenAddDialog} data-testid="button-add-machine">
                    <Plus className="w-4 h-4 mr-2" />
                    Add BDE Machine
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Machine ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bdeMachines.map((machine) => (
                      <TableRow key={machine.id} data-testid={`row-machine-${machine.id}`}>
                        <TableCell className="font-mono font-medium">{machine.machineId}</TableCell>
                        <TableCell>{machine.department || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(machine.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(machine.lastLoginAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleResetPassword(machine)}
                            data-testid={`button-reset-password-${machine.id}`}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
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
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage worker profiles</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                        data-testid="input-search-users"
                      />
                    </div>
                    <Button onClick={handleOpenAddDialog} data-testid="button-add-user">
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
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
                    <CardTitle>Part Numbers</CardTitle>
                    <CardDescription>Manage part number catalog with barcodes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadPartNumberBarcodes}
                      data-testid="button-download-part-barcodes"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All Barcodes
                    </Button>
                    <Button onClick={handleOpenAddDialog} data-testid="button-add-part">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Part Number
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Barcode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partNumbers.map((pn, idx) => (
                      <TableRow key={idx} data-testid={`row-part-${idx}`}>
                        <TableCell className="font-mono">{pn}</TableCell>
                        <TableCell>
                          <BarcodeDisplay text={pn} />
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
                    <CardTitle>Order Numbers</CardTitle>
                    <CardDescription>Manage order number catalog with barcodes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadOrderNumberBarcodes}
                      data-testid="button-download-order-barcodes"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All Barcodes
                    </Button>
                    <Button onClick={handleOpenAddDialog} data-testid="button-add-order">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Order Number
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Barcode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderNumbers.map((on, idx) => (
                      <TableRow key={idx} data-testid={`row-order-${idx}`}>
                        <TableCell className="font-mono">{on}</TableCell>
                        <TableCell>
                          <BarcodeDisplay text={on} />
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
                    <CardTitle>Performance IDs</CardTitle>
                    <CardDescription>Manage performance ID catalog with barcodes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadPerformanceIdBarcodes}
                      data-testid="button-download-performance-barcodes"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All Barcodes
                    </Button>
                    <Button onClick={handleOpenAddDialog} data-testid="button-add-performance">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Performance ID
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Performance ID</TableHead>
                      <TableHead>Barcode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceIds.map((pid, idx) => (
                      <TableRow key={idx} data-testid={`row-performance-${idx}`}>
                        <TableCell className="font-mono">{pid}</TableCell>
                        <TableCell>
                          <BarcodeDisplay text={pid} />
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
                  ? "Add New BDE Machine" 
                  : activeTab === "users"
                  ? "Add New User"
                  : activeTab === "parts"
                  ? "Add New Part Number"
                  : activeTab === "orders"
                  ? "Add New Order Number"
                  : "Add New Performance ID"
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
                    <Label htmlFor="machineId">Machine ID</Label>
                    <Input 
                      id="machineId" 
                      placeholder="e.g., BDE-2" 
                      value={formData.machineId}
                      onChange={(e) => setFormData(prev => ({ ...prev, machineId: e.target.value }))}
                      data-testid="input-machine-id" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
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
                </>
              ) : activeTab === "users" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter name" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="input-add-name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Image (optional)</Label>
                    <Input 
                      id="image" 
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      data-testid="input-add-image" 
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {activeTab === "parts" 
                      ? "Part Number" 
                      : activeTab === "orders"
                      ? "Order Number"
                      : "Performance ID"
                    }
                  </Label>
                  <Input 
                    id="name" 
                    placeholder={`Enter ${activeTab === "parts" ? "part number" : activeTab === "orders" ? "order number" : "performance ID"}`}
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
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitAdd} 
                disabled={isSubmitting}
                data-testid="button-confirm-add"
              >
                {isSubmitting ? "Adding..." : "Add"}
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
                Cancel
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
      </div>
    </div>
  );
}
