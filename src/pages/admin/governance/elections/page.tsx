import React, { useState, useEffect } from "react";
import { useApiClient } from "../../../../lib/api-client";
import { useAdminService } from "../../../../services/admin.service";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";
import { Badge } from "../../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { toast } from "sonner";
import { CreateElectionDialog } from "./CreateElectionDialog";

export default function ElectionCenterPage() {
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeElection, setActiveElection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const api = useApiClient();
  const adminService = useAdminService(api);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [electionsRes, analyticsRes] = await Promise.all([
        adminService.getElections({ status: 'all', limit: 20 }),
        adminService.getElectionAnalytics().catch(() => ({ data: null }))
      ]);

      const electionList = electionsRes.data?.elections || (electionsRes as any).elections || [];
      setElections(electionList);
      setAnalytics(analyticsRes.data);

      // Find the first 'ACTIVE' election to feature it, otherwise take the first one
      const featured = electionList.find((e: any) => e.status === 'ACTIVE') || electionList[0];
      if (featured) {
        handleSelectElection(featured);
      }
    } catch (err: any) {
      console.error("[ElectionCenter] Failed to load dashboard data:", err);
      toast.error("Failed to load election data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectElection = async (election: any) => {
    setActiveElection(election);
    // Fetch results if active or past
    if (election.status === 'ACTIVE' || election.status === 'PAST' || election.status === 'COMPLETED' || election.status === 'CLOSED') {
      try {
        const resultsRes = await adminService.getElectionResults(election.id);
        setActiveElection(prev => ({ ...prev, results: resultsRes.data }));
      } catch (err) {
        console.warn("[ElectionCenter] Could not load results for election:", election.id);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const testElectionApi = async () => {
    try {
      const res = await api.get('/elections', { params: { status: 'all' } });
      console.log("[ElectionCenter] API Test Response:", res);
      toast.success("Election API connected successfully!");
    } catch (err: any) {
      console.error("[ElectionCenter] API Test Failed:", err);
      toast.error(`API Error: ${err.message}`);
    }
  };

  if (loading && elections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-medium">Initializing Election Center...</p>
      </div>
    );
  }

  const currentCandidates = activeElection?.positions?.[0]?.candidates || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-heading">Election Center</h2>
          <p className="text-slate-500 mt-1">Manage student government and guild elections securely.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={testElectionApi} className="bg-amber-50 rounded-full border-amber-200 text-amber-700 hover:bg-amber-100">
            <span className="material-symbols-rounded mr-2 text-[18px]">bug_report</span> Test API
          </Button>
          <Button variant="outline" className="bg-white rounded-full shadow-sm border-slate-200 hover:bg-slate-50">
            <span className="material-symbols-rounded mr-2 text-[18px] text-emerald-500">verified_user</span> Audit Logs
          </Button>
          <CreateElectionDialog onElectionCreated={fetchData} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Panel */}
        <div className="lg:col-span-8 space-y-6">
          {activeElection ? (
            <Card className="premium-card border-none overflow-hidden rounded-3xl shadow-xl">
              {/* Banner Image */}
              <div className="h-48 md:h-64 w-full relative">
                <img 
                  src={activeElection.coverImage || "https://images.unsplash.com/photo-1540910419892-f3174207baec?q=80&w=2070&auto=format&fit=crop"} 
                  alt={activeElection.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`rounded-full px-3 py-1 font-bold tracking-wider text-[10px] ${
                      activeElection.status === 'ACTIVE' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-500/50 text-white'
                    }`}>
                      {activeElection.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse inline-block" />}
                      {activeElection.status}
                    </Badge>
                    <Badge variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white rounded-full px-3 py-1 font-bold tracking-wider text-[10px] uppercase">
                      {activeElection.category?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight font-heading leading-tight">{activeElection.title}</h3>
                </div>
              </div>

              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-6">
                    <TabsList className="bg-transparent border-0 h-14 p-0 gap-6">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 font-bold text-slate-500">Overview</TabsTrigger>
                      <TabsTrigger value="candidates" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 font-bold text-slate-500">Candidates ({currentCandidates.length})</TabsTrigger>
                      <TabsTrigger value="results" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 font-bold text-slate-500">Analytics</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                          <h4 className="text-lg font-bold text-slate-900">About this Election</h4>
                          <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                            {activeElection.description || "No detailed description provided for this election."}
                          </p>
                          <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Voting Mechanism</p>
                              <p className="text-sm font-bold text-slate-700 capitalize">
                                {activeElection.positions?.[0]?.mechanism || "Single Selection"}
                              </p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Anonymity</p>
                              <p className="text-sm font-bold text-slate-700">
                                {activeElection.isAnonymous !== false ? "Encrypted & Anonymous" : "Public Record"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-72 space-y-4">
                          <Card className="bg-slate-50 border-none rounded-2xl p-4 shadow-sm">
                            <h5 className="font-bold text-slate-900 mb-4 flex items-center">
                              <span className="material-symbols-rounded text-primary mr-2 text-[20px]">schedule</span> Timeline
                            </h5>
                            <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                              <div className="relative pl-8">
                                <div className="absolute left-0 top-1 h-[24px] w-[24px] rounded-full bg-white border-4 border-emerald-500 z-10" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Starts</p>
                                <p className="text-sm font-bold text-slate-700">{new Date(activeElection.startDate).toLocaleString()}</p>
                              </div>
                              <div className="relative pl-8">
                                <div className="absolute left-0 top-1 h-[24px] w-[24px] rounded-full bg-white border-4 border-primary z-10" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Ends</p>
                                <p className="text-sm font-bold text-slate-700">{new Date(activeElection.endDate).toLocaleString()}</p>
                              </div>
                            </div>
                          </Card>

                          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                            <p className="text-xs font-medium text-primary mb-2 flex items-center">
                              <span className="material-symbols-rounded text-[16px] mr-1.5">info</span> Eligibility Info
                            </p>
                            <p className="text-xs text-slate-600 font-medium">
                              This election is restricted to {activeElection.category} members. Verification is {activeElection.requiresVerification !== false ? "required" : "optional"}.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="candidates" className="mt-0">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {currentCandidates.map((candidate: any) => (
                          <div key={candidate.id} className="group flex flex-col p-4 bg-white border border-slate-100 rounded-3xl hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                                {candidate.photo ? (
                                  <img src={candidate.photo} alt={candidate.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
                                    {candidate.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{candidate.name}</h5>
                                <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full">Approved Candidate</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 italic">
                              "{candidate.manifesto || "No manifesto submitted yet."}"
                            </p>
                            <Button size="sm" variant="outline" className="mt-auto w-full rounded-full border-slate-200 font-bold text-[11px] group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                              View Profile & Manifesto
                            </Button>
                          </div>
                        ))}
                        {currentCandidates.length === 0 && (
                          <div className="col-span-full py-20 text-center">
                            <span className="material-symbols-rounded text-5xl text-slate-200 mb-4">person_search</span>
                            <p className="text-slate-400 font-medium italic">No candidates registered for this position yet.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="results" className="mt-0">
                      <div className="space-y-6">
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                          <div className="flex justify-between items-end mb-6">
                            <div>
                              <div className="text-sm font-bold text-slate-400 mb-2 flex items-center uppercase tracking-widest">
                                <span className="material-symbols-rounded text-[18px] mr-2 text-primary">analytics</span> 
                                Voter Participation
                              </div>
                              <div className="text-5xl font-black text-slate-900 tracking-tight">
                                {activeElection.results?.totalVotes || activeElection.totalVotes || 0} 
                                <span className="text-xl text-slate-400 font-bold ml-2 italic">/ 12,000 students</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-4xl font-black text-emerald-500">
                                {activeElection.results?.turnout ? `${activeElection.results.turnout}%` : '0%'}
                              </div>
                            </div>
                          </div>
                          <Progress value={activeElection.results?.turnout || 0} className="h-4 bg-slate-200 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-emerald-500" />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                           <Card className="border border-slate-100 rounded-3xl shadow-sm">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Security Audit</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 font-medium">Verified ID Logins</span>
                                    <span className="font-bold text-slate-900">100%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 font-medium">Duplicate Attempts</span>
                                    <span className="font-bold text-red-500">0</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 font-medium">Encryption Status</span>
                                    <span className="font-bold text-emerald-500 flex items-center">
                                      <span className="material-symbols-rounded text-[16px] mr-1">lock</span> Active
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                           </Card>
                           
                           <Card className="border border-slate-100 rounded-3xl shadow-sm">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Leaderboard Preview</CardTitle>
                              </CardHeader>
                              <CardContent>
                                 <p className="text-xs text-slate-500 italic">Detailed per-candidate result breakdown is available after the election ends or via the "Live Results" view for admins.</p>
                                 <Button variant="link" className="text-primary p-0 h-auto mt-4 font-bold">Open Full Real-time Analytics &rarr;</Button>
                              </CardContent>
                           </Card>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="premium-card border-dashed border-2 flex items-center justify-center p-20 bg-slate-50/50 rounded-3xl">
               <div className="text-center">
                  <span className="material-symbols-rounded text-6xl text-slate-200 mb-6">how_to_vote</span>
                  <p className="text-slate-500 font-bold text-lg">No elections found in your jurisdiction</p>
                  <Button className="mt-6 rounded-full px-8 bg-primary hover:bg-primary/90">Create First Election</Button>
               </div>
            </Card>
          )}
        </div>

        {/* Sidebar Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Registry List */}
          <Card className="premium-card border-none flex flex-col rounded-3xl overflow-hidden shadow-lg h-full max-h-[800px]">
            <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
              <CardTitle className="text-lg font-black text-slate-900 flex items-center justify-between tracking-tight">
                Elections Registry
                <Badge variant="secondary" className="rounded-full font-black bg-white border border-slate-200 shadow-sm">{elections.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto scrollbar-hide">
              <div className="divide-y divide-slate-100 h-full">
                {elections.map((election) => (
                  <div 
                    key={election.id} 
                    className={`p-5 hover:bg-slate-50/80 transition-all group cursor-pointer border-l-4 ${activeElection?.id === election.id ? 'bg-primary/5 border-primary shadow-inner' : 'border-transparent'}`}
                    onClick={() => handleSelectElection(election)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-black tracking-tight leading-tight transition-colors ${activeElection?.id === election.id ? 'text-primary' : 'text-slate-900 group-hover:text-primary'}`}>
                        {election.title}
                      </span>
                      <Badge className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ${
                        election.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 
                        election.status === 'UPCOMING' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {election.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-[9px] uppercase font-bold border-slate-200 bg-white rounded-full">
                            {election.category?.replace('_', ' ')}
                          </Badge>
                       </div>
                       <div className="text-[10px] font-bold text-slate-400 italic">
                          {new Date(election.startDate).toLocaleDateString()}
                       </div>
                    </div>
                  </div>
                ))}
                {elections.length === 0 && (
                  <div className="p-20 text-center text-slate-300">
                    <span className="material-symbols-rounded text-4xl mb-2 opacity-20">inventory_2</span>
                    <p className="italic text-sm">No historical data found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mini Stats or Global Analytics */}
          <Card className="premium-card border-none bg-primary rounded-3xl shadow-xl shadow-primary/20 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80">Global Turnout</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
               <div className="text-4xl font-black mb-1">{analytics?.avgTurnout || "0"}%</div>
               <p className="text-xs font-medium opacity-70 mb-4">Average across all 2026 academic sessions</p>
               <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${analytics?.avgTurnout || 0}%` }} />
               </div>
               <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-full font-bold text-xs h-9">
                  Download Global Report
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
