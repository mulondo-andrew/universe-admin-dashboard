import React from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";

export default function ModerationQueuePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-heading">Moderation Queue</h2>
          <p className="text-slate-500 mt-1">Review reported content, users, and marketplace items.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-100 font-semibold shadow-sm">
            <span className="material-symbols-rounded mr-2 text-[18px] text-red-500">gpp_maybe</span>
            12 Pending Reports
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span>
          <Input
            placeholder="Search reports by keyword or username..."
            className="pl-10 bg-white border-slate-200 rounded-full shadow-sm focus-visible:ring-primary h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white rounded-full shadow-sm border-slate-200 hover:bg-slate-50">
            <span className="material-symbols-rounded mr-2 text-[18px] text-slate-500">filter_list</span> Filter
          </Button>
          <Button variant="outline" className="bg-white rounded-full shadow-sm border-slate-200 hover:bg-slate-50">
            <span className="material-symbols-rounded mr-2 text-[18px] text-slate-500">shield</span> Auto-Mod Rules
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {[
          { id: 1, type: "Comment", user: "jdoe99", reason: "Harassment", content: "You're an idiot if you think that's the right answer.", severity: "High", time: "10 mins ago", context: "in thread 'CS101 Midterm Discussion'" },
          { id: 2, type: "Marketplace", user: "seller_mike", reason: "Prohibited Item", content: "Selling old exam papers for CS101. DM me.", severity: "Critical", time: "1 hour ago", context: "in category 'Study Materials'" },
          { id: 3, type: "Post", user: "anon_user", reason: "Spam", content: "Check out my new crypto project! Guaranteed 100x returns! Link in bio.", severity: "Medium", time: "3 hours ago", context: "in 'General Campus Chat'" },
        ].map((report) => (
          <Card key={report.id} className={`premium-card border-none overflow-hidden relative rounded-3xl ${report.severity === 'Critical' ? 'ring-1 ring-red-500/20 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)]' : ''}`}>
            {report.severity === 'Critical' && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
            )}
            {report.severity === 'High' && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
            )}
            {report.severity === 'Medium' && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
            )}
            
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8 justify-between">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={`font-semibold px-3 py-1 rounded-full border-0 ${
                        report.severity === 'Critical' 
                          ? 'bg-red-100 text-red-700' 
                          : report.severity === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        report.severity === 'Critical' ? 'bg-red-500' : report.severity === 'High' ? 'bg-orange-500' : 'bg-amber-500'
                      }`} />
                      {report.severity} Priority
                    </Badge>
                    <span className="text-sm font-medium text-slate-600 flex items-center bg-slate-100 px-3 py-1 rounded-full">
                      <span className="material-symbols-rounded mr-1.5 text-[14px] text-slate-400">flag</span> {report.reason}
                    </span>
                    <span className="text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                      {report.time}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-inner border border-slate-200/50">
                        {report.user.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        <span className="text-primary cursor-pointer hover:underline font-semibold">@{report.user}</span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span className="text-slate-500">{report.type} {report.context}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-slate-800 text-sm leading-relaxed relative">
                      <span className="material-symbols-rounded absolute top-4 right-4 text-[16px] text-slate-300">chat</span>
                      "{report.content}"
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col gap-3 justify-end min-w-[160px] pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                  <Button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm w-full justify-start font-semibold rounded-full">
                    <span className="material-symbols-rounded mr-2 text-[18px]">check</span> Keep Content
                  </Button>
                  <Button variant="destructive" className="w-full justify-start font-semibold rounded-full shadow-sm shadow-red-500/20">
                    <span className="material-symbols-rounded mr-2 text-[18px]">close</span> Remove Content
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-slate-700 font-semibold rounded-full border-slate-200 shadow-sm hover:bg-slate-50">
                    <span className="material-symbols-rounded mr-2 text-[18px] text-amber-500">warning</span> Warn User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
