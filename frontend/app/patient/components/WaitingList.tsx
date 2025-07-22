"use client";

import React, { useState } from "react";
import { joinWaitingList } from "@/api/waitingList";

interface WaitingListProps {
  doctorId: string;
  patientId: string;
}

const WaitingList: React.FC<WaitingListProps> = ({ doctorId, patientId }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleJoinWaitingList = async () => {
    try {
      setIsJoining(true);
      setMessage(null);
      const response = await joinWaitingList(doctorId, patientId);
      console.log("API Response:", response);
      setMessage(response.message);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setMessage("You are already on the waiting list for this doctor.");
      } else {
        setMessage(
          error.response?.data?.message || "Failed to join the waiting list."
        );
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-2">Join Waiting List</h2>
      <p className="text-gray-600 mb-4">
        If no slots are available, you can join the waiting list for this
        doctor.
      </p>
      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}
      <button
        onClick={handleJoinWaitingList}
        disabled={isJoining}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isJoining ? "Joining..." : "Join Waiting List"}
      </button>
    </div>
  );
};

export default WaitingList;
