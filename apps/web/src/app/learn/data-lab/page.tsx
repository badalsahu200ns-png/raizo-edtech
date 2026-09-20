"use client";

import React from "react";
import { DataLabSection } from "@/components/data-lab/DataLabSection";

export default function DataLabPage() {
  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <DataLabSection showReturnLink={true} />
    </div>
  );
}
