"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AadhaarIcon } from "@/components/ui/AadhaarIcon"
import { FileText, Search, Download } from "lucide-react"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"

export default function ReportPage() {
  const [searchType, setSearchType] = useState("aadhaar")
  const [searchValue, setSearchValue] = useState("")

  const reports = [
    {
      id: 1,
      aadhaar: "XXXX-XXXX-1234",
      name: "Rohit Rayaan",
      type: "Demographic Update",
      date: "15-Jan-2024",
      status: "Completed",
      enrollmentId: "ENR123456789"
    },
    {
      id: 2,
      aadhaar: "XXXX-XXXX-5678",
      name: "Priya Sharma",
      type: "Photo Update",
      date: "20-Jan-2024",
      status: "In Progress",
      enrollmentId: "ENR987654321"
    }
  ]

  return (
    <AuthenticatedLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Search Section */}
        <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 border border-gray-300">
            <h2 className="text-base font-semibold text-gray-800">Search Records</h2>
          </div>
          <div className="bg-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">Search By</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="bg-white border-gray-400 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">Aadhaar Number</SelectItem>
                    <SelectItem value="enrollment">Enrollment ID</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="mobile">Mobile Number</SelectItem>
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
              <div className="flex items-end">
                <Button className="bg-blue-600 text-white px-6 flex items-center gap-2 w-full">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-800">Recent Reports</h2>
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
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map((report, index) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{index + 1}</td>
                      <td className="px-4 py-2 text-gray-700">{report.aadhaar}</td>
                      <td className="px-4 py-2 text-gray-700">{report.name}</td>
                      <td className="px-4 py-2 text-gray-700">{report.type}</td>
                      <td className="px-4 py-2 text-gray-700">{report.date}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{report.enrollmentId}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="bg-white border-gray-400 h-7 px-2 text-xs">
                            <FileText className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="bg-white border-gray-400 h-7 px-2 text-xs">
                            <Download className="w-3 h-3" />
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

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-sm text-gray-600">Total Enrollments</div>
          </div>
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-green-600">142</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-yellow-600">8</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-4 border border-gray-300">
            <div className="text-2xl font-bold text-red-600">6</div>
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
    </AuthenticatedLayout>
  )
}