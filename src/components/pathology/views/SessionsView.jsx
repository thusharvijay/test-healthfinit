import { useState, useEffect } from "react";
import { Clock, User, Monitor, MapPin } from "lucide-react";
import { apiService } from "../services/api";

export function SessionsView({ userRole }) {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, active, ended

  useEffect(() => {
    loadSessions();
    if (userRole === "Admin") {
      loadStats();
    }
  }, [filter, userRole]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      let data;
      
      if (userRole === "Admin") {
        // Admin sees all lab sessions
        data = await apiService.getUserSessions(
          filter !== "all" ? filter : null
        );
      } else {
        // Technician sees only their sessions
        data = await apiService.getMySessions();
      }
      
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiService.getSessionStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) {
        return <span className="text-gray-500 dark:text-gray-400 italic">Ongoing</span>;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
    };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {userRole === "Admin" ? "User Sessions" : "My Sessions"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {userRole === "Admin" 
              ? "Monitor all user activity in your lab" 
              : "View your login history and active sessions"}
          </p>
        </div>
        <button
          onClick={loadSessions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards (Admin Only) */}
      {userRole === "Admin" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sessions Today
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.total_sessions_today}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Sessions
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {stats.active_sessions}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Users
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {stats.total_users_active}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg Duration
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.average_session_duration 
                ? formatDuration(Math.round(stats.average_session_duration))
                : "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* Filters (Admin Only) */}
      {userRole === "Admin" && (
        <div className="flex space-x-2">
          {["all", "active", "ended"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No sessions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                    {userRole === "Admin" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                        </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Session Start
                    </th>
                    {/* ADD THIS COLUMN */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Session End
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IP Address
                    </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {userRole === "Admin" && (
                        <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <User size={16} className="text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {session.user_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                {session.user_email}
                                </div>
                                {/* ADD ROLE DISPLAY */}
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                {session.user_role}
                                </div>
                            </div>
                            </div>
                        </td>
                        )}
                        <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            session.session_status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : session.session_status === "ended"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                            {session.session_status.charAt(0).toUpperCase() + session.session_status.slice(1)}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {formatDateTime(session.session_start)}
                        </td>
                        {/* SESSION END COLUMN - FIXED */}
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {session.session_end 
                            ? formatDateTime(session.session_end)
                            : <span className="text-green-600 dark:text-green-400 font-medium">—</span>
                        }
                        </td>

                        {/* DURATION COLUMN - FIXED */}
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {session.session_duration_minutes 
                            ? formatDuration(session.session_duration_minutes)
                            : <span className="text-green-600 dark:text-green-400 font-medium">Ongoing</span>
                        }
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 font-mono">
                            <MapPin size={14} />
                            <span>{session.ip_address || "Unknown"}</span>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}