'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ApplicantProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50/50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xl font-bold">
              AA
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">a a</h1>
              <p className="text-sm text-neutral-500">a@aas.com</p>
              <span className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                Submitted
              </span>
            </div>
          </div>
          <Button variant="outline" className="sm:self-center gap-2 rounded-xl text-xs font-semibold h-10 px-4">
            <FileText className="h-4 w-4" /> View Resume
          </Button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Personal & Contact Information Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-neutral-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-neutral-50 py-4">
                <CardTitle className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-neutral-600">First Name</Label>
                  <Input id="firstName" defaultValue="a" className="rounded-xl border-neutral-200 focus-visible:ring-neutral-950 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="middleName" className="text-xs font-semibold text-neutral-600">Middle Name</Label>
                  <Input id="middleName" placeholder="—" className="rounded-xl border-neutral-200 focus-visible:ring-neutral-950 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-neutral-600">Last Name</Label>
                  <Input id="lastName" defaultValue="a" className="rounded-xl border-neutral-200 focus-visible:ring-neutral-950 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="birthDate" className="text-xs font-semibold text-neutral-600">Date of Birth</Label>
                  <Input id="birthDate" type="date" className="rounded-xl border-neutral-200 focus-visible:ring-neutral-950 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-xs font-semibold text-neutral-600">Age</Label>
                  <Input id="age" type="number" placeholder="—" className="rounded-xl border-neutral-200 focus-visible:ring-neutral-950 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="religion" className="text-xs font-semibold text-neutral-600">Religion</Label>
                  <Input id="religion" placeholder="—" className="rounded-xl border-neutral-200 focus-visible:ring-neutral-950 text-sm" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-neutral-50 py-4">
                <CardTitle className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-neutral-600">Email Address</Label>
                    <Input id="email" defaultValue="a@aas.com" disabled className="rounded-xl bg-neutral-50 border-neutral-200 text-sm text-neutral-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-neutral-600">Phone Number</Label>
                    <Input id="phone" placeholder="—" className="rounded-xl border-neutral-200 focus-visible:ring-neutral-950 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="mobile" className="text-xs font-semibold text-neutral-600">Mobile Number</Label>
                    <Input id="mobile" placeholder="—" className="rounded-xl border-neutral-200 focus-visible:ring-neutral-950 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-semibold text-neutral-600">Complete Address</Label>
                    <Input id="address" placeholder="—" className="rounded-xl border-neutral-200 focus-visible:ring-neutral-950 text-sm" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="rounded-xl text-xs font-bold px-6 bg-neutral-950 hover:bg-neutral-800 text-white h-10">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Status Summary & Live Drag-and-Drop Document Uploader */}
          <div className="space-y-6">
            
            {/* Status Timeline History Mirror */}
            <Card className="rounded-2xl border-neutral-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-neutral-50 py-4">
                <CardTitle className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Application Lifecycle</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative border-l border-neutral-200 pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">Interview</span>
                      <span className="text-[10px] text-neutral-400 font-medium">Jul 13, 2026</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Seeded applicant interview status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Upload Center (POST /api/v1/applicant/documents) */}
            <Card className="rounded-2xl border-neutral-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-neutral-50 py-4">
                <CardTitle className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Required Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                {/* Interactive Drag Drop Zone */}
                <Label htmlFor="doc-upload" className="group block cursor-pointer border border-dashed border-neutral-200 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50 p-6 rounded-xl transition-all text-center">
                  <input id="doc-upload" type="file" className="hidden" multiple />
                  <Upload className="mx-auto h-5 w-5 text-neutral-400 group-hover:text-neutral-600 transition-colors mb-2" />
                  <p className="text-xs font-semibold text-neutral-800">Click to upload files or drag and drop</p>
                  <p className="text-[10px] text-neutral-400 mt-1">PDF, PNG, or JPG up to 10MB</p>
                </Label>

                {/* Uploaded File List Tracking UI */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-white">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-neutral-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-neutral-800 truncate">Transcript_of_Records.pdf</p>
                        <p className="text-[10px] text-neutral-400">2.4 MB</p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}