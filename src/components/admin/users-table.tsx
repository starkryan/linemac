"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Users,
  UserPlus,
  Download,
  Loader2,
  Key
} from "lucide-react";
import CreateUserModal from "./create-user-modal";
import UserDetailsModal from "./user-details-modal";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  aadhaar_number?: string;
  status: "active" | "inactive" | "pending" | "suspended";
  role: "admin" | "supervisor" | "operator";
  createdAt: string;
  updatedAt: string;
  created_by?: string;
  balance?: number;
  is_blocked?: boolean;
  image?: string;
  operator_uid?: string;
  operator_name?: string;
}

interface UsersTableProps {
  className?: string;
}

export default function UsersTable({ className }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (roleFilter !== "all") {
        params.append("role", roleFilter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-orange-100 text-orange-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "supervisor": return "bg-purple-100 text-purple-800";
      case "operator": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Mask Aadhaar number for privacy
  const maskAadhaar = (aadhaar?: string) => {
    if (!aadhaar || aadhaar.length < 4) return aadhaar || 'N/A';
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Users Management</span>
              </CardTitle>
              <CardDescription>
                Manage and monitor user accounts ({totalUsers} total users)
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or Aadhaar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <img
                src="/loader.gif"
                alt="Loading users..."
                width={32}
                height={32}
                className="animate-pulse"
              />
              <span className="ml-2 text-sm text-gray-500">Loading users...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading users</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <Button onClick={fetchUsers} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Important Fields</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Aadhaar</TableHead>
                      <TableHead>Status & Role</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                              <AvatarFallback>
                                {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {/* ID */}
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="text-xs text-blue-600 font-medium">ID</div>
                              <div className="text-xs font-mono text-blue-900">{user.id}</div>
                            </div>
                            {/* Operator Name */}
                            {user.operator_name && (
                              <div className="p-2 bg-green-50 rounded border border-green-200">
                                <div className="text-xs text-green-600 font-medium">Operator</div>
                                <div className="text-xs font-medium text-green-900 truncate">{user.operator_name}</div>
                              </div>
                            )}
                            {/* Operator UID */}
                            {user.operator_uid && (
                              <div className="p-2 bg-purple-50 rounded border border-purple-200">
                                <div className="text-xs text-purple-600 font-medium">UID</div>
                                <div className="text-xs font-mono text-purple-900 truncate">{user.operator_uid}</div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {maskAadhaar(user.aadhaar_number)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">₹{user.balance || 0}</div>
                            <div className="text-xs text-gray-500">balance</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                <Key className="mr-2 h-4 w-4" />
                                Change Password
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onUserCreated={fetchUsers}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        user={selectedUser}
        onPasswordChanged={fetchUsers}
      />
    </div>
  );
}