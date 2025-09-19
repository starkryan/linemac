"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AadhaarIcon } from "@/components/ui/AadhaarIcon"
import { FileText, Search, Download, Eye, Baby } from "lucide-react"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"

export default function ChildListPage() {
  const [searchType, setSearchType] = useState("aadhaar")
  const [searchValue, setSearchValue] = useState("")
  const [ageFilter, setAgeFilter] = useState("all")

  const childApplications = [
    {
      id: 1,
      aadhaar: "XXXX-XXXX-1234",
      name: "Aryan Kumar",
      age: 3,
      gender: "Male",
      parentName: "Rajesh Kumar",
      parentAadhaar: "XXXX-XXXX-5678",
      type: "New Child Enrollment",
      date: "15-Jan-2024",
      status: "Completed",
      enrollmentId: "ENR123456789"
    },
    {
      id: 2,
      aadhaar: "XXXX-XXXX-9012",
      name: "Priya Singh",
      age: 4,
      gender: "Female",
      parentName: "Anita Singh",
      parentAadhaar: "XXXX-XXXX-3456",
      type: "Child Enrollment with Biometrics",
      date: "20-Jan-2024",
      status: "In Progress",
      enrollmentId: "ENR987654321"
    },
    {
      id: 3,
      aadhaar: "XXXX-XXXX-7890",
      name: "Rahul Verma",
      age: 1,
      gender: "Male",
      parentName: "Sunita Verma",
      parentAadhaar: "XXXX-XXXX-7890",
      type: "New Child Enrollment",
      date: "18-Jan-2024",
      status: "Pending",
      enrollmentId: "ENR456789123"
    }
  ]

  const filteredApplications = childApplications.filter(app => {
    const matchesSearch = searchValue === "" ||
      app.aadhaar.toLowerCase().includes(searchValue.toLowerCase()) ||
      app.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      app.parentName.toLowerCase().includes(searchValue.toLowerCase())

    const matchesAge = ageFilter === "all" ||
      (ageFilter === "0-2" && app.age <= 2) ||
      (ageFilter === "3-5" && app.age >= 3 && app.age <= 5)

    return matchesSearch && matchesAge
  })

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-100">
        <div className="p-6 max-w-7xl mx-auto">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 border border-gray-300">
            <h2 className="text-base font-semibold text-gray-800">Search Child Applications</h2>
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
                    <SelectItem value="aadhaar">Child Aadhaar</SelectItem>
                    <SelectItem value="name">Child Name</SelectItem>
                    <SelectItem value="parent">Parent Name</SelectItem>
                    <SelectItem value="parentAadhaar">Parent Aadhaar</SelectItem>
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
                <Label className="text-sm text-gray-700 mb-2 block">Age Group</Label>
                <Select value={ageFilter} onValueChange={setAgeFilter}>
                  <SelectTrigger className="bg-white border-gray-400 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="0-2">0-2 years (Infant)</SelectItem>
                    <SelectItem value="3-5">3-5 years (Child)</SelectItem>
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
            <h2 className="text-base font-semibold text-gray-800">Child Applications ({filteredApplications.length})</h2>
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
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Child Aadhaar</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Name</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Age/Gender</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Parent Name</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Type</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Date</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Status</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((application, index) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{index + 1}</td>
                      <td className="px-4 py-2 text-gray-700">{application.aadhaar}</td>
                      <td className="px-4 py-2 text-gray-700">{application.name}</td>
                      <td className="px-4 py-2 text-gray-700">
                        {application.age} years / {application.gender}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        <div>
                          <div>{application.parentName}</div>
                          <div className="text-xs text-gray-500">{application.parentAadhaar}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{application.type}</td>
                      <td className="px-4 py-2 text-gray-700">{application.date}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          application.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : application.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {application.status}
                        </span>
                      </td>
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
            <div className="flex items-center gap-2">
              <Baby className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{childApplications.length}</div>
                <div className="text-sm text-gray-600">Total Children</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-green-600">
              {childApplications.filter(a => a.age <= 2).length}
            </div>
            <div className="text-sm text-gray-600">Infants (0-2)</div>
          </div>
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-purple-600">
              {childApplications.filter(a => a.age >= 3 && a.age <= 5).length}
            </div>
            <div className="text-sm text-gray-600">Children (3-5)</div>
          </div>
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-yellow-600">
              {childApplications.filter(a => a.status === "In Progress").length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
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