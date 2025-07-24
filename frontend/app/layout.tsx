"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import SignIn from "@/components/signIn";
import SignUp from "@/components/signUp";
import { NotificationProvider } from "@/hooks/useNotifications";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Set default title if no specific title is set
    if (!document.title || document.title === "Create Next App") {
      document.title = "MedSchedule - Medical Appointment System";
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="MedSchedule - Book medical appointments with ease. Find doctors, schedule visits, and manage your healthcare efficiently."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
