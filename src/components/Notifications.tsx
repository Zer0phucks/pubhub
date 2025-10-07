import { useState } from "react";
import { Bell, Check, Trash2, Settings as SettingsIcon, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { PlatformIcon } from "./PlatformIcon";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "sonner@2.0.3";

type NotificationType = "all" | "unread" | "comments" | "mentions" | "engagement" | "system";

interface Notification {
  id: string;
  type: "comment" | "mention" | "like" | "share" | "follower" | "post" | "system";
  platform: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "comment",
    platform: "instagram",
    title: "New comment on your post",
    message: "@sarah_designs commented: 'This is amazing! Love your work! 🎨'",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "post",
    platform: "twitter",
    title: "Scheduled post published",
    message: "Your scheduled post 'Marketing Tips for 2025' was published successfully",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "like",
    platform: "linkedin",
    title: "Post engagement milestone",
    message: "Your LinkedIn post reached 1,000 likes!",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "4",
    type: "mention",
    platform: "twitter",
    title: "You were mentioned",
    message: "@marketing_pro mentioned you in a tweet about content creation",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "comment",
    platform: "youtube",
    title: "New comment on your video",
    message: "@john_doe: 'Great tutorial! Subscribed!'",
    time: "4 hours ago",
    read: true,
  },
  {
    id: "6",
    type: "follower",
    platform: "instagram",
    title: "New follower",
    message: "@creative_studio started following you",
    time: "5 hours ago",
    read: true,
  },
  {
    id: "7",
    type: "share",
    platform: "facebook",
    title: "Your post was shared",
    message: "Your post 'Content Calendar Tips' was shared 15 times",
    time: "6 hours ago",
    read: true,
  },
  {
    id: "8",
    type: "system",
    platform: "all",
    title: "Weekly performance report ready",
    message: "Your weekly analytics report is ready to view",
    time: "1 day ago",
    read: true,
  },
  {
    id: "9",
    type: "comment",
    platform: "tiktok",
    title: "New comment on your TikTok",
    message: "@trend_setter: 'Love this trend! 🔥'",
    time: "1 day ago",
    read: true,
  },
  {
    id: "10",
    type: "like",
    platform: "pinterest",
    title: "Your pin is trending",
    message: "Your pin 'Design Inspiration' received 500 saves today",
    time: "2 days ago",
    read: true,
  },
];

interface NotificationsProps {
  onOpenSettings?: () => void;
}

export function Notifications({ onOpenSettings }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filterType, setFilterType] = useState<NotificationType>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | "all" | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filterType === "all") return true;
    if (filterType === "unread") return !notification.read;
    if (filterType === "comments") return notification.type === "comment";
    if (filterType === "mentions") return notification.type === "mention";
    if (filterType === "engagement") return ["like", "share", "follower"].includes(notification.type);
    if (filterType === "system") return notification.type === "system" || notification.type === "post";
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteAllClick = () => {
    setDeleteTarget("all");
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget === "all") {
      setNotifications([]);
      toast.success("All notifications cleared");
    } else if (deleteTarget) {
      setNotifications(notifications.filter((n) => n.id !== deleteTarget));
      toast.success("Notification deleted");
    }
    setDeleteTarget(null);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
        return "💬";
      case "mention":
        return "🏷️";
      case "like":
        return "❤️";
      case "share":
        return "🔄";
      case "follower":
        return "👤";
      case "post":
        return "📝";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with all your platform activities
          </p>
        </div>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleDeleteAllClick}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
          {onOpenSettings && (
            <Button variant="outline" onClick={onOpenSettings}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filterType} onValueChange={(v) => setFilterType(v as NotificationType)}>
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-muted-foreground">No notifications</h3>
            <p className="text-muted-foreground mt-1">
              {filterType === "unread"
                ? "You're all caught up!"
                : "You don't have any notifications in this category"}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-all hover:shadow-md ${
                !notification.read ? "bg-accent/50 border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon & Platform */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  {notification.platform !== "all" && (
                    <PlatformIcon platform={notification.platform} className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className={!notification.read ? "" : "text-muted-foreground"}>
                        {notification.title}
                      </h4>
                      <p className="text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.time}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={deleteTarget === "all" ? "Clear all notifications?" : "Delete notification?"}
        description={
          deleteTarget === "all"
            ? "This will permanently delete all notifications. This action cannot be undone."
            : "This notification will be permanently deleted. This action cannot be undone."
        }
        confirmText="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
