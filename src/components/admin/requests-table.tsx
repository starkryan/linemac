"use client";

import { useState } from "react";
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
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Check,
  X,
  FileText,
  Download,
  User,
  Calendar,
  AlertTriangle
} from "lucide-react";

interface CorrectionRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  aadhaarNumber: string;
  requestType: "name" | "address" | "dob" | "phone" | "photo";
  currentData: string;
  requestedData: string;
  status: "pending" | "approved" | "rejected" | "in_review";
  priority: "low" | "medium" | "high" | "urgent";
  submittedDate: string;
  lastUpdated: string;
  assignedTo?: string;
  documents: number;
  notes?: string;
}

interface RequestsTableProps {
  className?: string;
}

export default function RequestsTable({ className }: RequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const requests: CorrectionRequest[] = [
    {
      id: "REQ-001",
      userId: "USR-001",
      userName: "Rahul Kumar",
      userAvatar: "/placeholder-avatar.jpg",
      aadhaarNumber: "XXXX-XXXX-1234",
      requestType: "name",
      currentData: "Rahul Kumar",
      requestedData: "Rahul Kumar Singh",
      status: "pending",
      priority: "high",
      submittedDate: "2024-01-20",
      lastUpdated: "2024-01-20 10:30 AM",
      assignedTo: "Admin User",
      documents: 2,
      notes: "User wants to add surname Singh"
    },
    {
      id: "REQ-002",
      userId: "USR-002",
      userName: "Priya Sharma",
      userAvatar: "/placeholder-avatar.jpg",
      aadhaarNumber: "XXXX-XXXX-5678",
      requestType: "address",
      currentData: "123 Old Street, Mumbai",
      requestedData: "456 New Road, Delhi",
      status: "in_review",
      priority: "medium",
      submittedDate: "2024-01-19",
      lastUpdated: "2024-01-19 02:45 PM",
      assignedTo: "Admin User",
      documents: 3,
      notes: "Address change due to relocation"
    },
    {
      id: "REQ-003",
      userId: "USR-003",
      userName: "Amit Patel",
      userAvatar: "/placeholder-avatar.jpg",
      aadhaarNumber: "XXXX-XXXX-9012",
      requestType: "dob",
      currentData: "15/01/1990",
      requestedData: "15/01/1989",
      status: "approved",
      priority: "low",
      submittedDate: "2024-01-18",
      lastUpdated: "2024-01-18 04:20 PM",
      assignedTo: "Admin User",
      documents: 1
    },
    {
      id: "REQ-004",
      userId: "USR-004",
      userName: "Sunita Reddy",
      userAvatar: "/placeholder-avatar.jpg",
      aadhaarNumber: "XXXX-XXXX-7890",
      requestType: "phone",
      currentData: "98765 43214",
      requestedData: "98765 43215",
      status: "rejected",
      priority: "medium",
      submittedDate: "2024-01-17",
      lastUpdated: "2024-01-17 11:15 AM",
      assignedTo: "Admin User",
      documents: 1,
      notes: "Phone number update rejected due to invalid proof"
    },
    {
      id: "REQ-005",
      userId: "USR-005",
      userName: "Vikram Singh",
      userAvatar: "/placeholder-avatar.jpg",
      aadhaarNumber: "XXXX-XXXX-3456",
      requestType: "photo",
      currentData: "Old photo",
      requestedData: "New photo",
      status: "pending",
      priority: "urgent",
      submittedDate: "2024-01-20",
      lastUpdated: "2024-01-20 09:00 AM",
      documents: 1,
      notes: "Urgent photo update for passport application"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "in_review": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case "name": return <User className="h-4 w-4" />;
      case "address": return "📍";
      case "dob": return "📅";
      case "phone": return "📞";
      case "photo": return "📷";
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.aadhaarNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    const matchesType = typeFilter === "all" || request.requestType === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const getStatusCounts = () => {
    return requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Correction Requests</span>
              </CardTitle>
              <CardDescription>
                Manage and process Aadhaar correction requests ({filteredRequests.length} requests found)
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Pending: {statusCounts.pending || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>In Review: {statusCounts.in_review || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Approved: {statusCounts.approved || 0}</span>
                </div>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by user name, Aadhaar, or request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="address">Address</SelectItem>
                  <SelectItem value="dob">Date of Birth</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Request Type</TableHead>
                  <TableHead>Current Data</TableHead>
                  <TableHead>Requested Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          {request.userName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{request.userName}</div>
                          <div className="text-xs text-gray-500">{request.aadhaarNumber}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getRequestTypeIcon(request.requestType)}
                        <span className="capitalize">{request.requestType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      <div className="text-sm" title={request.currentData}>
                        {request.currentData}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      <div className="text-sm font-medium" title={request.requestedData}>
                        {request.requestedData}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{request.submittedDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.assignedTo || "Unassigned"}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Request
                          </DropdownMenuItem>
                          {request.status === "pending" && (
                            <>
                              <DropdownMenuItem className="text-green-600">
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {request.priority === "urgent" && (
                            <DropdownMenuItem className="text-orange-600">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Mark as Urgent
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}