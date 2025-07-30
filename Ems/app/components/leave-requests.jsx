"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, Check, X } from "lucide-react";

export function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Fetch leave requests in real time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "leaveRequests"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLeaveRequests(data);
    });
    return () => unsub();
  }, []);

  const handleApproval = async (id, status) => {
    try {
      await updateDoc(doc(db, "leaveRequests", id), { status });
    } catch (error) {
      console.error("Error updating leave status:", error);
    }
  };

  return (
    <div className="space-y-4">
      {leaveRequests.length === 0 ? (
        <p className="text-gray-500">No leave requests found.</p>
      ) : (
        leaveRequests.map((req) => (
          <Card key={req.id}>
            <CardHeader>
              <CardTitle className="text-lg">{req.employeeName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                <strong>Reason:</strong> {req.reason}
              </p>
              <p className="text-sm text-gray-500">Status: {req.status || "Pending"}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => handleApproval(req.id, "Approved")}
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleApproval(req.id, "Rejected")}
                >
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
