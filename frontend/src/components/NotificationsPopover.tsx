import { useState, useEffect, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import { useNotificationsStore } from "../store/notifications-store";
import { Link } from "react-router-dom";

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationsStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition rounded-xl hover:bg-white/5"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#0A0A0A]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-brand hover:text-cyan transition flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-white/5 relative group transition-colors ${notification.read ? 'opacity-60 hover:opacity-100' : 'bg-white/[0.02]'}`}
                >
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand" />
                  )}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{notification.message}</p>
                      {notification.link && (
                        <Link 
                          to={notification.link} 
                          className="text-xs text-cyan hover:underline inline-block mt-1"
                          onClick={() => {
                            if (!notification.read) markAsRead(notification.id);
                            setIsOpen(false);
                          }}
                        >
                          View details &rarr;
                        </Link>
                      )}
                    </div>
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-slate-500 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
