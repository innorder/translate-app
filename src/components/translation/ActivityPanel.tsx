import React from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Clock, Filter, RefreshCw, User } from "lucide-react";

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: "create" | "update" | "delete" | "import" | "export";
}

interface ActivityPanelProps {
  activities?: ActivityItem[];
  onFilterChange?: (filter: string) => void;
  onRefresh?: () => void;
}

const ActivityPanel = ({
  activities = [
    {
      id: "1",
      user: "John Doe",
      action: "created",
      target: "welcome.greeting",
      timestamp: "10 minutes ago",
      type: "create",
    },
    {
      id: "2",
      user: "Jane Smith",
      action: "updated",
      target: "common.buttons.save",
      timestamp: "25 minutes ago",
      type: "update",
    },
    {
      id: "3",
      user: "Alex Johnson",
      action: "deleted",
      target: "errors.notFound",
      timestamp: "1 hour ago",
      type: "delete",
    },
    {
      id: "4",
      user: "Sarah Williams",
      action: "imported",
      target: "navigation.json",
      timestamp: "2 hours ago",
      type: "import",
    },
    {
      id: "5",
      user: "Mike Brown",
      action: "exported",
      target: "all translations",
      timestamp: "3 hours ago",
      type: "export",
    },
  ],
  onFilterChange = () => {},
  onRefresh = () => {},
}: ActivityPanelProps) => {
  const getActivityTypeColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "import":
        return "bg-purple-100 text-purple-800";
      case "export":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-card border rounded-md shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange("all")}
          >
            <Filter className="h-3 w-3 mr-1" />
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange("create")}
          >
            Create
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange("update")}
          >
            Update
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-0">
        <div className="p-2 space-y-2">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="p-3 bg-card rounded-md hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{activity.user}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm">
                    <span className="font-medium">{activity.action}</span>{" "}
                    {activity.target}
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    className={`${getActivityTypeColor(activity.type)} border-none dark:bg-opacity-20`}
                    variant="outline"
                  >
                    {activity.type}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No recent activity to display
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <Button variant="link" className="w-full text-xs text-muted-foreground">
          View all activity
        </Button>
      </div>
    </div>
  );
};

export default ActivityPanel;
