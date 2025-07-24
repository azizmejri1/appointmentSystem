"use client";
import Navbar from "@/components/navbar";
import SearchSection from "@/components/searchSection";
import SignIn from "@/components/signIn";
import SignUp from "@/components/signUp";
import { Search } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    document.title = "MedSchedule - Find & Book Medical Appointments";
  }, []);

  return (
    <div>
      <Navbar setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
      {showSignIn && (
        <SignIn setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
      )}

      {showSignUp && (
        <SignUp setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
      )}
      <div className="flex justify-center align-center">
        <SearchSection />
      </div>
    </div>
  );
}
