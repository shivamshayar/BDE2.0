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
import { Plus, Pencil, Trash2, Users, Package, Activity, ClipboardList, Search } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
}

interface AdminDashboardProps {
  users?: User[];
  partNumbers?: string[];
  orderNumbers?: string[];
  performanceIds?: string[];
}

export default function AdminDashboard({
  users = [],
  partNumbers = [],
  orderNumbers = [],
  performanceIds = [],
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage users and master data for the BDE system
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
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

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage worker profiles and roles</CardDescription>
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
                    <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-user">
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
                      <TableHead>Role</TableHead>
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
                        <TableCell>
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => console.log("Edit user:", user.id)}
                              data-testid={`button-edit-${user.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => console.log("Delete user:", user.id)}
                              data-testid={`button-delete-${user.id}`}
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

          {/* Part Numbers Tab */}
          <TabsContent value="parts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Part Numbers</CardTitle>
                    <CardDescription>Manage part number catalog</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-part">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Part Number
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partNumbers.map((pn, idx) => (
                      <TableRow key={idx} data-testid={`row-part-${idx}`}>
                        <TableCell className="font-mono">{pn}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => console.log("Edit part:", pn)}
                              data-testid={`button-edit-part-${idx}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => console.log("Delete part:", pn)}
                              data-testid={`button-delete-part-${idx}`}
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

          {/* Order Numbers Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Order Numbers</CardTitle>
                    <CardDescription>Manage order number catalog</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-order">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Order Number
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderNumbers.map((on, idx) => (
                      <TableRow key={idx} data-testid={`row-order-${idx}`}>
                        <TableCell className="font-mono">{on}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => console.log("Edit order:", on)}
                              data-testid={`button-edit-order-${idx}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => console.log("Delete order:", on)}
                              data-testid={`button-delete-order-${idx}`}
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

          {/* Performance IDs Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Performance IDs</CardTitle>
                    <CardDescription>Manage performance ID catalog</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-performance">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Performance ID
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Performance ID</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceIds.map((pid, idx) => (
                      <TableRow key={idx} data-testid={`row-performance-${idx}`}>
                        <TableCell className="font-mono">{pid}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => console.log("Edit performance:", pid)}
                              data-testid={`button-edit-performance-${idx}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => console.log("Delete performance:", pid)}
                              data-testid={`button-delete-performance-${idx}`}
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
        </Tabs>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Add a new {activeTab === "users" ? "user" : activeTab.slice(0, -1)} to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter name" data-testid="input-add-name" />
              </div>
              {activeTab === "users" && (
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Enter role" data-testid="input-add-role" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)} data-testid="button-cancel-add">
                Cancel
              </Button>
              <Button onClick={() => {
                console.log("Add new item");
                setShowAddDialog(false);
              }} data-testid="button-confirm-add">
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
