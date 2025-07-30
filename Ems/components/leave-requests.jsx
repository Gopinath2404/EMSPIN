"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // doc id currently updating

  useEffect(() => {
    // If your structure is employees/{employeeId}/leaves/{leaveId}
    // use collectionGroup. If it is /leaves at root, use collection(db, "leaves")
    const q = query(collection(db, "leaves"), orderBy("appliedAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({
          _path: d.ref.path, // keep the full path so we can update
          id: d.id,
          ...d.data(),
        }));
        console.log("[ADMIN DEBUG] All leave requests:", data);
        setLeaves(data);
        setLoading(false);
      },
      (err) => {
        console.error("LeaveRequests snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const setStatus = async (leave, status) => {
    try {
      setUpdating(leave.id);
      console.log("[ADMIN DEBUG] Updating leave:", leave.id, "Path:", leave._path, "Status:", status);
      // We kept full path so we can reconstruct the doc
      await updateDoc(doc(db, "leaves", leave.id), {
        status,
        reviewedAt: new Date(),
        reviewerName: "Admin", // Add reviewer name here, can be dynamic if auth available
      });
      console.log("[ADMIN DEBUG] Successfully updated leave status to:", status);
    } catch (e) {
      console.error("Failed to update leave status:", e);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading leave requests…</span>
          </div>
        ) : leaves.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leave requests yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.employeeName || leave.name || "—"}</TableCell>
                  <TableCell>{leave.type || "—"}</TableCell>
                  <TableCell>{leave.fromDate || "—"}</TableCell>
                  <TableCell>{leave.toDate || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate" title={leave.reason}>
                    {leave.reason || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        leave.status === "approved"
                          ? "default"
                          : leave.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {leave.status || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {leave.appliedAt?.toDate
                      ? leave.appliedAt.toDate().toLocaleString()
                      : leave.appliedAt || "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updating === leave.id}
                      onClick={() => setStatus(leave, "approved")}
                    >
                      {updating === leave.id ? "…" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={updating === leave.id}
                      onClick={() => setStatus(leave, "rejected")}
                    >
                      {updating === leave.id ? "…" : "Reject"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
