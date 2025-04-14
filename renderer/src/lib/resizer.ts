// RESIZER
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/lib/resizer.ts

import React from "react";

export function initResize(
  e: React.MouseEvent | React.TouchEvent,
  setWidth: (w: number) => void,
  MIN_WIDTH: number,
  MAX_WIDTH: number,
  startElId: string
) {
  e.preventDefault();
  e.stopPropagation();

  const startX = "touches" in e ? e.touches[0].clientX : e.clientX;

  const feedPanelEl = document.getElementById(startElId);
  const startWidth = feedPanelEl ? feedPanelEl.offsetWidth : 320;

  function onMouseMove(ev: MouseEvent | TouchEvent) {
    ev.preventDefault();

    let clientX: number;
    if ("touches" in ev) {
      clientX = ev.touches[0].clientX;
    } else {
      clientX = (ev as MouseEvent).clientX;
    }

    // Because we have a right sidebar, we do 'delta = startX - clientX'
    // so that dragging left yields a positive delta => bigger width
    const delta = startX - clientX;
    let newWidth = startWidth + delta;

    // CLAMP
    if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
    if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

    setWidth(newWidth);

    // Prevent text selection or scrolling
    document.body.style.userSelect = "none";
    document.body.style.overflow = "hidden";
  }

  function onMouseUp() {
    // remove event listeners
    document.removeEventListener("mousemove", onMouseMove as any);
    document.removeEventListener("touchmove", onMouseMove as any, { passive: false });
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("touchend", onMouseUp);

    // Restore scrolling
    document.body.style.userSelect = "";
    document.body.style.overflow = "";
  }

  document.addEventListener("mousemove", onMouseMove as any);
  document.addEventListener("touchmove", onMouseMove as any, { passive: false });
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("touchend", onMouseUp);
}