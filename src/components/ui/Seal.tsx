"use client";

import React from "react";

const SealSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 34 24" fill="none" aria-hidden="true">
    <path d="M3 2h11l7 10-7 10H3v-5.4h7.1l3.3-4.6-3.3-4.6H3z" />
    <path d="M21 6.5 25.6 12 21 17.5M26 6.5 30.6 12 26 17.5" stroke="currentColor" strokeWidth={2.6} />
  </svg>
);

export const Seal = SealSVG;