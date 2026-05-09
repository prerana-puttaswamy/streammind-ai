"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

type Event = {
  id: number;
  event_type: string;
  status: string;
  source: string;
  message: string;
};

type Analytics = {
  total_events: number;
  success_events: number;
  failed_events: number;
  failure_rate: number;
  anomaly_detected: boolean;
  event_type_counts: Record<string, number>;
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  async function fetchData() {
    const [eventsRes, analyticsRes] = await Promise.all([
      fetch("https://streammind-backend.onrender.com/events"),
      fetch("https://streammind-backend.onrender.com/analytics"),
    ]);

    setEvents(await eventsRes.json());
    setAnalytics(await analyticsRes.json());
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchData();

    const ws = new WebSocket("wss://streammind-backend.onrender.com/ws/events");

    ws.onmessage = (event) => {
      const newEvent: Event = JSON.parse(event.data);

      setEvents((prev) => [newEvent, ...prev]);

      setAnalytics((prev) => {
        if (!prev) return prev;

        const total = prev.total_events + 1;
        const failed =
          newEvent.status === "failed"
            ? prev.failed_events + 1
            : prev.failed_events;

        const success =
          newEvent.status === "success"
            ? prev.success_events + 1
            : prev.success_events;

        const failureRate = Number(((failed / total) * 100).toFixed(2));

        return {
          ...prev,
          total_events: total,
          failed_events: failed,
          success_events: success,
          failure_rate: failureRate,
          anomaly_detected: failureRate >= 30,
          event_type_counts: {
            ...prev.event_type_counts,
            [newEvent.event_type]:
              (prev.event_type_counts[newEvent.event_type] || 0) + 1,
          },
        };
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  if (!analytics) {
    return <main style={{ padding: 40 }}>Loading StreamMind...</main>;
  }

  const eventTypeData = Object.entries(analytics.event_type_counts).map(
    ([name, value]) => ({ name, value })
  );

  const pieData = [
    { name: "Success", value: analytics.success_events },
    { name: "Failed", value: analytics.failed_events },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617, #0f172a)",
        color: "white",
        display: "flex",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <aside
        style={{
          width: 260,
          padding: 28,
          background: "rgba(15, 23, 42, 0.95)",
          borderRight: "1px solid rgba(148,163,184,0.2)",
        }}
      >
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>StreamMind AI</h1>
        <p style={{ color: "#94a3b8", marginBottom: 40 }}>
          Event Intelligence
        </p>

        {["Dashboard", "Events", "Anomalies", "Workers", "Analytics"].map(
          (item) => (
            <div
              key={item}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                marginBottom: 10,
                background:
                  item === "Dashboard"
                    ? "linear-gradient(90deg, #2563eb, #7c3aed)"
                    : "transparent",
                color: item === "Dashboard" ? "white" : "#cbd5e1",
              }}
            >
              {item}
            </div>
          )
        )}

        <button
          onClick={logout}
          style={{
            marginTop: 30,
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "1px solid rgba(248,113,113,0.35)",
            background: "rgba(239,68,68,0.15)",
            color: "#fecaca",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Logout
        </button>
      </aside>

      <section style={{ flex: 1, padding: 36 }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: "#38bdf8", fontWeight: 700 }}>
            REAL-TIME EVENT MONITORING
          </p>
          <h2 style={{ fontSize: 42, margin: "8px 0" }}>
            Distributed Event Processing Dashboard
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 18 }}>
            Monitor async events, Redis queues, Celery workers, failures, and
            anomaly signals.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <MetricCard title="Total Events" value={analytics.total_events} />
          <MetricCard title="Successful" value={analytics.success_events} />
          <MetricCard title="Failures" value={analytics.failed_events} danger />
          <MetricCard
            title="Failure Rate"
            value={`${analytics.failure_rate}%`}
            danger={analytics.failure_rate >= 30}
          />
        </div>

        {analytics.anomaly_detected && (
          <div
            style={{
              padding: 18,
              borderRadius: 16,
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(248, 113, 113, 0.35)",
              color: "#fecaca",
              marginBottom: 28,
            }}
          >
            🚨 <strong>Anomaly Detected:</strong> Failure rate is currently{" "}
            {analytics.failure_rate}%. Immediate investigation recommended.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 24,
            marginBottom: 28,
          }}
        >
          <Panel title="Event Type Distribution">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={eventTypeData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Success vs Failure">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={90}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <Panel title="Recent Event Stream">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#94a3b8", textAlign: "left" }}>
                <th style={th}>ID</th>
                <th style={th}>Type</th>
                <th style={th}>Status</th>
                <th style={th}>Source</th>
                <th style={th}>Message</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  style={{ borderTop: "1px solid rgba(148,163,184,0.15)" }}
                >
                  <td style={td}>{event.id}</td>
                  <td style={td}>{event.event_type}</td>
                  <td style={td}>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontWeight: 700,
                        fontSize: 13,
                        background:
                          event.status === "failed"
                            ? "rgba(239,68,68,0.2)"
                            : "rgba(34,197,94,0.2)",
                        color:
                          event.status === "failed" ? "#fca5a5" : "#86efac",
                      }}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td style={td}>{event.source}</td>
                  <td style={td}>{event.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: number | string;
  danger?: boolean;
}) {
  return (
    <div
      style={{
        padding: 22,
        borderRadius: 20,
        background: danger
          ? "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(127,29,29,0.35))"
          : "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(14,165,233,0.15))",
        border: danger
          ? "1px solid rgba(248,113,113,0.35)"
          : "1px solid rgba(56,189,248,0.3)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
      }}
    >
      <p style={{ color: "#cbd5e1", marginBottom: 12 }}>{title}</p>
      <h3 style={{ fontSize: 34, margin: 0 }}>{value}</h3>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.75)",
        border: "1px solid rgba(148,163,184,0.18)",
        borderRadius: 22,
        padding: 24,
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 20 }}>{title}</h3>
      {children}
    </div>
  );
}

const th = {
  padding: "14px 12px",
  fontSize: 14,
};

const td = {
  padding: "16px 12px",
  color: "#e5e7eb",
};