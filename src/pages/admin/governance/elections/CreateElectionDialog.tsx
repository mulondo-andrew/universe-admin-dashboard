import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  NativeSelect
} from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import { useAdminService } from "../../../../services/admin.service";
import { useApiClient } from "../../../../lib/api-client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../lib/utils";

export function CreateElectionDialog({ onElectionCreated }: { onElectionCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const api = useApiClient();
  const adminService = useAdminService(api);

  const [metadata, setMetadata] = useState<any>({
    electionTypes: [],
    organizationTypes: [],
  });

  const [formData, setForm] = useState({
    title: "",
    description: "",
    electionType: "",
    organizationType: "UNIVERSITY",
    organizationId: "",
    votingStartDate: "",
    votingEndDate: "",
    coverImage: "",
    isAnonymous: true,
    requiresVerification: true,
    branchId: "",
    allowMultipleChoices: false,
    maxChoices: 1,
  });

  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      // Fetch all required configuration data from backend
      setLoading(true);
      Promise.all([
        adminService.getBranches().catch(e => ({ data: [] })),
        adminService.getMetadata().catch(e => ({ data: null }))
      ]).then(([branchesRes, metaRes]) => {
        // Handle different response shapes from backend
        const branchData = branchesRes.data || (branchesRes as any).branches || branchesRes || [];
        const metaData = metaRes.data || metaRes || null;
        
        console.log("[CreateElection] Branches fetched:", branchData);
        console.log("[CreateElection] Metadata fetched:", metaData);

        setBranches(Array.isArray(branchData) ? branchData : []);
        
        const safeMeta = {
          electionTypes: Array.isArray(metaData?.electionTypes) ? metaData.electionTypes : [],
          organizationTypes: Array.isArray(metaData?.organizationTypes) ? metaData.organizationTypes : [],
        };
        setMetadata(safeMeta);
        
        // Set defaults if not set
        if (!formData.electionType && safeMeta.electionTypes.length > 0) {
          setForm(prev => ({ ...prev, electionType: safeMeta.electionTypes[0] }));
        }
      }).catch(err => {
        console.error("Failed to fetch form metadata", err);
        toast.error("Failed to load form configuration");
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [open]);

  const searchUsers = async (val: string) => {
    setSearchTerm(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await adminService.getUsers({ q: val, limit: 5 });
      // Handle various backend response shapes for user list
      const users = res.data || (res as any).users || (res as any).items || (Array.isArray(res) ? res : []);
      setSearchResults(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearching(false);
    }
  };

  const addCandidate = (user: any) => {
    if (candidates.find(c => c.userId === user.id)) {
      toast.error("User already added as candidate");
      return;
    }
    setCandidates([...candidates, { 
      userId: user.id, 
      name: user.name, 
      avatar: user.avatar,
      candidateType: "PERSON",
      manifesto: "",
      displayOrder: candidates.length
    }]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const removeCandidate = (id: string) => {
    setCandidates(candidates.filter(c => c.userId !== id));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.votingStartDate || !formData.votingEndDate || !formData.electionType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await adminService.createElection({
        ...formData,
        candidates: candidates.map((c, i) => ({
          userId: c.userId,
          candidateType: c.candidateType,
          manifesto: c.manifesto,
          displayOrder: i
        }))
      });
      toast.success("Election created successfully!");
      setOpen(false);
      resetForm();
      onElectionCreated();
    } catch (err: any) {
      toast.error(`Creation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setCandidates([]);
    setForm({
      title: "",
      description: "",
      electionType: metadata.electionTypes?.[0] || "",
      organizationType: "UNIVERSITY",
      organizationId: "",
      votingStartDate: "",
      votingEndDate: "",
      coverImage: "",
      isAnonymous: true,
      requiresVerification: true,
      branchId: "",
      allowMultipleChoices: false,
      maxChoices: 1,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-md shadow-primary/20 h-11 px-6">
          <span className="material-symbols-rounded mr-2 text-[20px]">add</span> Create Election
        </Button>
      </DialogTrigger>
      {/* M3 Style: Large rounded corners, centered, scrollable if needed */}
      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden rounded-[28px] border-none shadow-2xl max-h-[92vh] flex flex-col">
        <DialogHeader className="p-8 bg-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight">New Election</DialogTitle>
              <DialogDescription className="text-slate-400 font-medium">
                Step {step} of 2: {step === 1 ? "Configuration" : "Candidates"}
              </DialogDescription>
            </div>
            {/* M3 Style Stepper Dots */}
            <div className="flex gap-2">
              {[1, 2].map(i => (
                <div key={i} className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300",
                  step === i ? "bg-primary w-6" : "bg-slate-700"
                )} />
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area to prevent overflow */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-8 pb-4">
            {step === 1 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-sm font-bold text-slate-700 ml-1">Election Title *</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Student Council President 2026" 
                    value={formData.title}
                    onChange={e => setForm({...formData, title: e.target.value})}
                    className="rounded-2xl border-slate-200 h-12 focus:ring-primary/20"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Election Category *</Label>
                    <NativeSelect 
                      value={formData.electionType} 
                      onValueChange={(v: string) => setForm({...formData, electionType: v})}
                      className="rounded-2xl h-12"
                    >
                      {metadata.electionTypes.map((type: string) => (
                        <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Campus Branch</Label>
                    <NativeSelect 
                      value={formData.branchId} 
                      onValueChange={(v: string) => setForm({...formData, branchId: v})}
                      className="rounded-2xl h-12"
                    >
                      <option value="">All Branches</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Organization Type</Label>
                    <NativeSelect 
                      value={formData.organizationType} 
                      onValueChange={(v: string) => setForm({...formData, organizationType: v})}
                      className="rounded-2xl h-12"
                    >
                      {metadata.organizationTypes.map((type: string) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Org ID (Optional)</Label>
                    <Input 
                      placeholder="e.g. club_id or dept_id" 
                      value={formData.organizationId}
                      onChange={e => setForm({...formData, organizationId: e.target.value})}
                      className="rounded-2xl border-slate-200 h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Start Date *</Label>
                    <Input 
                      type="datetime-local" 
                      className="rounded-2xl border-slate-200 h-12"
                      value={formData.votingStartDate}
                      onChange={e => setForm({...formData, votingStartDate: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">End Date *</Label>
                    <Input 
                      type="datetime-local" 
                      className="rounded-2xl border-slate-200 h-12"
                      value={formData.votingEndDate}
                      onChange={e => setForm({...formData, votingEndDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="desc" className="text-sm font-bold text-slate-700 ml-1">Description</Label>
                  <Textarea 
                    id="desc" 
                    placeholder="Provide details about the election objectives and rules..." 
                    className="min-h-[100px] rounded-2xl border-slate-200 p-4"
                    value={formData.description}
                    onChange={e => setForm({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[20px] border border-slate-100 transition-colors hover:bg-slate-100/50">
                    <div className="space-y-0.5">
                      <Label className="font-bold flex items-center">
                        <span className="material-symbols-rounded text-primary mr-2 text-[18px]">lock</span>
                        Anonymous Voting
                      </Label>
                      <p className="text-[11px] text-slate-500 font-medium">Voter identities are encrypted and hidden from results</p>
                    </div>
                    <Switch 
                      checked={formData.isAnonymous} 
                      onCheckedChange={v => setForm({...formData, isAnonymous: v})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[20px] border border-slate-100 transition-colors hover:bg-slate-100/50">
                    <div className="space-y-0.5">
                      <Label className="font-bold flex items-center">
                        <span className="material-symbols-rounded text-primary mr-2 text-[18px]">verified</span>
                        Strict Verification
                      </Label>
                      <p className="text-[11px] text-slate-500 font-medium">Require Digital ID verification before casting votes</p>
                    </div>
                    <Switch 
                      checked={formData.requiresVerification} 
                      onCheckedChange={v => setForm({...formData, requiresVerification: v})}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <Label className="text-sm font-bold text-slate-700 mb-3 block ml-1 uppercase tracking-wider">Add Contestants</Label>
                  <div className="relative group">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">person_search</span>
                    <Input 
                      placeholder="Search students by name, email or ID..." 
                      className="pl-12 rounded-2xl border-slate-200 h-14 shadow-sm focus:ring-primary/10 transition-all"
                      value={searchTerm}
                      onChange={e => searchUsers(e.target.value)}
                    />
                    {searching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                      </div>
                    )}
                  </div>
                  
                  {searchResults.length > 0 && (
                    <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-2xl border-slate-100 rounded-[24px] overflow-hidden bg-white/95 backdrop-blur-xl">
                      <div className="p-2 space-y-1">
                        {searchResults.map(user => (
                          <div 
                            key={user.id} 
                            className="flex items-center gap-4 p-3 hover:bg-primary/5 rounded-[18px] cursor-pointer transition-all group/item"
                            onClick={() => addCandidate(user)}
                          >
                            <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">{(user?.name || "U").charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900">{user?.name || "Unknown User"}</p>
                              <p className="text-[11px] text-slate-500 font-medium">{user?.email}</p>
                              </div>                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                               <span className="material-symbols-rounded text-primary">add_circle</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-sm font-bold text-slate-700">Contestant List</Label>
                    <Badge variant="secondary" className="rounded-full px-3 py-0.5 bg-primary/10 text-primary font-bold">{candidates.length}</Badge>
                  </div>
                  
                  <div className="space-y-3 min-h-[100px]">
                    {candidates.map((c, idx) => (
                      <Card key={c.userId} className="p-5 border-slate-100 rounded-[24px] bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 rounded-2xl border-2 border-slate-50 shadow-sm">
                            <AvatarImage src={c.avatar} />
                            <AvatarFallback className="rounded-2xl">{c.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-900 text-base">{c.name}</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                onClick={() => removeCandidate(c.userId)}
                              >
                                <span className="material-symbols-rounded text-[20px]">delete</span>
                              </Button>
                            </div>
                            <div className="relative">
                              <Textarea 
                                placeholder="Write a compelling manifesto for this candidate..." 
                                className="text-sm min-h-[80px] bg-slate-50 border-none rounded-2xl p-4 focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all"
                                value={c.manifesto}
                                onChange={e => {
                                  const newC = [...candidates];
                                  newC[idx].manifesto = e.target.value;
                                  setCandidates(newC);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {candidates.length === 0 && (
                      <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50">
                        <span className="material-symbols-rounded text-slate-300 text-4xl mb-2">groups</span>
                        <p className="text-slate-400 text-sm font-medium italic">No candidates added to this contest yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
          <div className="flex w-full justify-between items-center gap-4">
            {step === 2 && (
              <Button 
                variant="ghost" 
                onClick={() => setStep(1)} 
                className="rounded-full px-6 font-bold text-slate-600 hover:bg-slate-200"
              >
                <span className="material-symbols-rounded mr-2">arrow_back</span> Back
              </Button>
            )}
            <div className="flex-1" />
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="rounded-full px-8 border-slate-200 font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Button>
            {step === 1 ? (
              <Button 
                onClick={() => setStep(2)} 
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-10 h-12 font-bold shadow-lg shadow-slate-900/20"
              >
                Continue <span className="material-symbols-rounded ml-2 text-[20px]">arrow_forward</span>
              </Button>
            ) : (
              <Button 
                disabled={loading || candidates.length === 0} 
                onClick={handleSubmit} 
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-12 font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full mr-2" />
                    Launching...
                  </span>
                ) : (
                  <>Launch Election</>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
