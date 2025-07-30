"use client"

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase"; // Adjust path if needed
import dayjs from "dayjs";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Clock, TrendingUp, AlertTriangle, Target } from "lucide-react";

export function WorkHoursSummary({ employeeId }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalHours: 0,
    targetHours: 0,
    averageDaily: 0,
    daysWorked: 0,
    daysUnderHours: 0,
    overtimeHours: 0,
  });

  useEffect(() => {
    if (!employeeId) return;

    try {
      // Try to query by userId first (which is what the attendance records use)
      const q = query(
        collection(db, "attendance"),
        where("userId", "==", employeeId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data());

        const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const weekMap = {
          Monday: { hours: 0, target: 8, status: "off" },
          Tuesday: { hours: 0, target: 8, status: "off" },
          Wednesday: { hours: 0, target: 8, status: "off" },
          Thursday: { hours: 0, target: 8, status: "off" },
          Friday: { hours: 0, target: 8, status: "off" },
          Saturday: { hours: 0, target: 0, status: "off" },
          Sunday: { hours: 0, target: 0, status: "off" },
        };

        let totalHours = 0;
        let dayCounts = 0;
        let underHours = 0;
        let overtime = 0;

        data.forEach((record) => {
          const checkIn = record.checkIn?.toDate?.();
          const checkOut = record.checkOut?.toDate?.();
          const now = new Date();

          if (!checkIn) return;

          const dayName = weekDays[dayjs(checkIn).day()];
          let duration = 0;

          if (checkIn && checkOut) {
            duration = (checkOut - checkIn) / 1000 / 3600;
          } else if (checkIn && !checkOut) {
            duration = (now - checkIn) / 1000 / 3600;
          }

          const target = weekMap[dayName]?.target ?? 8;
          weekMap[dayName].hours += duration;
          weekMap[dayName].status =
            duration === 0
              ? "off"
              : duration < target
              ? "under"
              : duration > target
              ? "over"
              : "complete";

          totalHours += duration;
          if (duration > 0) {
            dayCounts++;
            if (duration < target) underHours++;
            if (duration > target) overtime += duration - target;
          }
        });

        const weeklyArray = Object.entries(weekMap).map(([day, val]) => ({
          day,
          ...val,
        }));

        setWeeklyData(weeklyArray);
        setMonthlyStats({
          totalHours: totalHours.toFixed(2),
          targetHours: dayCounts * 8,
          averageDaily: dayCounts ? (totalHours / dayCounts).toFixed(1) : 0,
          daysWorked: dayCounts,
          daysUnderHours: underHours,
          overtimeHours: overtime.toFixed(1),
        });
      }, (error) => {
        console.error("Error fetching work hours data:", error);
        // Set default data on error
        setWeeklyData([]);
        setMonthlyStats({
          totalHours: "0.00",
          targetHours: 0,
          averageDaily: 0,
          daysWorked: 0,
          daysUnderHours: 0,
          overtimeHours: 0,
        });
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up work hours listener:", error);
      // Set default data on error
      setWeeklyData([]);
      setMonthlyStats({
        totalHours: "0.00",
        targetHours: 0,
        averageDaily: 0,
        daysWorked: 0,
        daysUnderHours: 0,
        overtimeHours: 0,
      });
    }
  }, [employeeId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "complete":
        return "text-green-600";
      case "under":
        return "text-yellow-600";
      case "over":
        return "text-blue-600";
      case "off":
        return "text-gray-400";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "complete":
        return "✓";
      case "under":
        return "⚠";
      case "over":
        return "↗";
      case "off":
        return "-";
      default:
        return "";
    }
  };

  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.hours, 0);
  const weeklyTarget = weeklyData.reduce((sum, day) => sum + day.target, 0);
  const completionRate = weeklyTarget > 0 ? (weeklyTotal / weeklyTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-700">
          <strong>✅ Work Hours Tab is Working!</strong> Employee ID: {employeeId || "Not provided"}
        </p>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{monthlyStats.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{completionRate.toFixed(1)}% of target</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Daily</p>
                <p className="text-2xl font-bold">{monthlyStats.averageDaily}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Days Worked</p>
                <p className="text-2xl font-bold">{monthlyStats.daysWorked}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Hours</p>
                <p className="text-2xl font-bold text-yellow-600">{monthlyStats.daysUnderHours}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Hours</CardTitle>
          <CardDescription>Daily work hours breakdown with target comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-20 text-sm font-medium">{day.day}</div>
                  <span className="text-lg">{getStatusIcon(day.status)}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getStatusColor(day.status)}`}>
                      {day.hours.toFixed(2)}h
                    </div>
                    {day.target > 0 && (
                      <div className="text-sm text-muted-foreground">Target: {day.target}h</div>
                    )}
                  </div>
                  {day.target > 0 && (
                    <div className="w-24">
                      <Progress value={(day.hours / day.target) * 100} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Weekly Total:</span>
              <div className="text-right">
                <div className="text-xl font-bold">{weeklyTotal.toFixed(2)}h</div>
                <div className="text-sm text-muted-foreground">Target: {weeklyTarget}h</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No data message */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-600 mb-2">Work Hours Summary</h4>
            <p className="text-sm text-gray-500">
              This tab is now working! Real-time data will be added once we confirm the basic functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}