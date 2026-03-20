import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useApiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

export default function NetworkPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const api = useApiClient();
  const { user: currentUser } = useUser();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let endpoint = '/users';
      const params: any = { q: searchQuery, limit: 20 };

      // Backend searchUsersUseCase handles 'following' and 'followers' if we pass appropriate query
      // For now, let's use the search endpoint. 
      // Note: If the backend has specific endpoints for followers/following list, we should use those.
      // Based on user.routes.ts:
      // router.get('/:userId/followers', userController.getFollowers);
      // router.get('/:userId/following', userController.getFollowing);
      
      if (activeTab === "following" && currentUser) {
        const res = await api.get(`/users/${currentUser.id}/following`);
        setUsers((res as any).data || (res as any).items || []);
        return;
      } else if (activeTab === "followers" && currentUser) {
        const res = await api.get(`/users/${currentUser.id}/followers`);
        setUsers((res as any).data || (res as any).items || []);
        return;
      }

      const response = await api.get(endpoint, { params });
      setUsers((response as any).data || (response as any).users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, currentUser]);

  const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await api.delete(`/users/${userId}/follow`);
        toast.success("Unfollowed user");
      } else {
        await api.post(`/users/${userId}/follow`);
        toast.success("Followed user");
      }
      // Refresh list
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Network</h1>
          <p className="text-muted-foreground mt-1">Connect with students, faculty, and alumni.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
            <Input 
              placeholder="Search people..." 
              className="pl-10 rounded-full bg-muted/50 border-transparent focus-visible:bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-full shrink-0">
            <span className="material-symbols-rounded text-[20px]">filter_list</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 space-x-6 mb-6">
          <TabsTrigger 
            value="all" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-medium"
          >
            Discover
          </TabsTrigger>
          <TabsTrigger 
            value="following" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-medium"
          >
            Following
          </TabsTrigger>
          <TabsTrigger 
            value="followers" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-medium"
          >
            Followers
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading users...</div>
          ) : users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(user => (
                <Card key={user.id} className="premium-card overflow-hidden group">
                  <div className="h-16 bg-gradient-to-r from-primary/10 to-transparent"></div>
                  <CardContent className="relative pt-0 pb-6 px-6">
                    <div className="flex justify-between items-start -mt-8 mb-4">
                      <div className="w-16 h-16 rounded-full border-4 border-background bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow-sm overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          (user.name || user.firstName || "U").charAt(0)
                        )}
                      </div>
                      {currentUser?.id !== user.id && (
                        <Button 
                          variant={user.isFollowing ? "secondary" : "default"} 
                          size="sm" 
                          className="rounded-full mt-10"
                          onClick={() => handleFollowToggle(user.id, user.isFollowing)}
                        >
                          {user.isFollowing ? "Following" : "Follow"}
                        </Button>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors cursor-pointer">
                        {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.department?.name || user.department || "N/A"}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs font-normal uppercase">{user.role}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-rounded text-3xl text-muted-foreground">search_off</span>
              </div>
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search query or filters.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
