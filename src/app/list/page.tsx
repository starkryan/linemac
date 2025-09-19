"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AadhaarIcon } from "@/components/ui/AadhaarIcon"
import { FileText, Search, Download, Eye } from "lucide-react"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"

export default function ListPage() {
  const [searchType, setSearchType] = useState("aadhaar")
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const applications = [
    {
      id: 1,
      aadhaar: "XXXX-XXXX-1234",
      name: "Rohit Rayaan",
      type: "New Enrollment",
      date: "15-Jan-2024",
      status: "Completed",
      enrollmentId: "ENR123456789",
      operator: "OP001"
    },
    {
      id: 2,
      aadhaar: "XXXX-XXXX-5678",
      name: "Priya Sharma",
      type: "Demographic Update",
      date: "20-Jan-2024",
      status: "In Progress",
      enrollmentId: "ENR987654321",
      operator: "OP002"
    },
    {
      id: 3,
      aadhaar: "XXXX-XXXX-9012",
      name: "Amit Patel",
      type: "Photo Update",
      date: "18-Jan-2024",
      status: "Rejected",
      enrollmentId: "ENR456789123",
      operator: "OP003"
    }
  ]

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchValue === "" ||
      app.aadhaar.toLowerCase().includes(searchValue.toLowerCase()) ||
      app.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      app.enrollmentId.toLowerCase().includes(searchValue.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-100">
        <div className="p-6 max-w-7xl mx-auto">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 border border-gray-300">
            <h2 className="text-base font-semibold text-gray-800">Search Applications</h2>
          </div>
          <div className="bg-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">Search By</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="bg-white border-gray-400 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">Aadhaar Number</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="enrollment">Enrollment ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">Search Value</Label>
                <Input
                  className="bg-white border-gray-400 h-8"
                  placeholder="Enter search value..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white border-gray-400 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="bg-blue-600 text-white px-6 flex items-center gap-2 w-full">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-800">Applications ({filteredApplications.length})</h2>
            <Button variant="outline" size="sm" className="bg-white border-gray-400 h-8 px-3 text-xs flex items-center gap-2">
              <Download className="w-3 h-3" />
              Export All
            </Button>
          </div>
          <div className="bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">S.No</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Aadhaar Number</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Name</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Type</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Date</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Status</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Enrollment ID</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Operator</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((application, index) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{index + 1}</td>
                      <td className="px-4 py-2 text-gray-700">{application.aadhaar}</td>
                      <td className="px-4 py-2 text-gray-700">{application.name}</td>
                      <td className="px-4 py-2 text-gray-700">{application.type}</td>
                      <td className="px-4 py-2 text-gray-700">{application.date}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          application.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : application.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{application.enrollmentId}</td>
                      <td className="px-4 py-2 text-gray-700">{application.operator}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="bg-white border-gray-400 h-7 px-2 text-xs flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="bg-white border-gray-400 h-7 px-2 text-xs flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === "Completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === "In Progress").length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(a => a.status === "Rejected").length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="outline"
            className="bg-white border-gray-400 px-6 flex items-center gap-2"
          >
            <AadhaarIcon mirrored />
            Back
          </Button>
        </div>
      </div>
      </div>
    </AuthenticatedLayout>
  )
}