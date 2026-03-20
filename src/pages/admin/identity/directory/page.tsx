import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApiClient } from "../../../../lib/api-client";
import { useAdminService } from "../../../../services/admin.service";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

export default function UserDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  const navigate = useNavigate();
  const api = useApiClient();
  const adminService = useAdminService(api);

  const fetchUsers = async () => {
    setLoading(true);
    console.log("[UserDirectoryPage] Starting fetchUsers...");
    console.log("[UserDirectoryPage] Search term:", searchTerm);
    console.log("[UserDirectoryPage] Pagination:", pagination);

    try {
      const response = await adminService.getUsers({
        q: searchTerm,
        page: pagination.page,
        limit: pagination.limit
      });
      
      console.log("[UserDirectoryPage] Raw response from adminService:", response);
      
      // Handle different response structures
      const userData = response.data || (response as any).users || (response as any).items || [];
      console.log("[UserDirectoryPage] Extracted userData:", userData);
      
      setUsers(userData);
      
      const meta = (response as any).meta || (response as any).pagination;
      if (meta) {
        console.log("[UserDirectoryPage] Extracted metadata:", meta);
        setPagination(prev => ({ ...prev, total: meta.total }));
      }
    } catch (err: any) {
      console.error("[UserDirectoryPage] Failed to fetch users:", err);
      console.error("[UserDirectoryPage] Error details:", {
        message: err.message,
        status: err.status,
        data: err.data
      });
    } finally {
      setLoading(false);
    }
  };

  const directTestFetch = async () => {
    console.log("[UserDirectoryPage] Direct Test Fetch started...");
    try {
      // Bypass the adminService to see if raw API is accessible
      const rawResponse = await api.get('/admin/users');
      console.log("[UserDirectoryPage] Direct Test SUCCESS:", rawResponse);
      alert("Direct API Test Successful! Check console for data.");
    } catch (err: any) {
      console.error("[UserDirectoryPage] Direct Test FAILED:", err);
      alert(`Direct API Test Failed: ${err.message}`);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, pagination.page]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-heading">User Directory</h2>
          <p className="text-slate-500 mt-1">Manage all university accounts, roles, and access levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={directTestFetch} className="bg-amber-50 rounded-full border-amber-200 text-amber-700 hover:bg-amber-100">
            <span className="material-symbols-rounded mr-2 text-[18px]">bug_report</span> Test API
          </Button>
          <Button variant="outline" className="bg-white rounded-full shadow-sm border-slate-200 hover:bg-slate-50">
            <span className="material-symbols-rounded mr-2 text-[18px] text-slate-500">download</span> Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md shadow-primary/20">
            <span className="material-symbols-rounded mr-2 text-[18px]">person_add</span> Add User
          </Button>
        </div>
      </div>

      <div className="premium-card bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span>
            <Input
              placeholder="Search by name or email..."
              className="pl-12 bg-white border-slate-200 rounded-full shadow-sm focus-visible:ring-primary h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto bg-white rounded-full shadow-sm border-slate-200 hover:bg-slate-50">
              <span className="material-symbols-rounded mr-2 text-[18px] text-slate-500">filter_list</span> Filters
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading && users.length === 0 ? (
            <div className="p-20 text-center text-slate-500">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
               Loading user directory...
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100/80">
                  <TableHead className="font-semibold text-slate-600 h-12">User</TableHead>
                  <TableHead className="font-semibold text-slate-600 h-12">Role</TableHead>
                  <TableHead className="font-semibold text-slate-600 h-12">Department</TableHead>
                  <TableHead className="font-semibold text-slate-600 h-12">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600 h-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                      <span className="material-symbols-rounded text-4xl mb-2 opacity-20">search_off</span>
                      <p>No users found in the directory</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-slate-50/80 border-slate-100/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/identity/directory/${user.id}`)}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shadow-inner border border-primary/20 overflow-hidden">
                            {user.avatar || user.imageUrl ? (
                              <img src={user.avatar || user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              (user.name || user.firstName || "U").charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                              {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username}
                            </div>
                            <div className="text-sm text-slate-500 font-medium">{user.email || `@${user.username}`}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`font-medium px-3 py-1 rounded-full uppercase text-[10px] ${
                            user.role?.toUpperCase() === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-700' 
                              : user.role?.toUpperCase() === 'FACULTY'
                              ? 'bg-blue-100 text-blue-700'
                              : user.role?.toUpperCase() === 'STAFF'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {user.department?.name || user.department || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.isActive !== false ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                          <span className={`text-sm font-medium ${user.isActive !== false ? 'text-emerald-700' : 'text-red-700'}`}>
                            {user.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        {user.lastActive && (
                          <div className="text-xs text-slate-400 mt-1">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                              <span className="material-symbols-rounded text-[20px] text-slate-500">more_horiz</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-lg p-2">
                            <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => navigate(`/admin/identity/directory/${user.id}`)}>
                               <span className="material-symbols-rounded mr-2 text-[18px]">visibility</span> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl cursor-pointer"><span className="material-symbols-rounded mr-2 text-[18px]">shield</span> Change Role</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 rounded-xl cursor-pointer">
                              <span className="material-symbols-rounded mr-2 text-[18px]">person_remove</span> Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
