import { Card, TextInput, Badge, Avatar, Button } from "flowbite-react";

export default function RightSidebar() {
  return (
    <aside className="hidden xl:block fixed right-0 top-4 w-96 h-[calc(100vh-1rem)] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 pb-4 z-10">
          <div className="relative">
            <TextInput
              type="text"
              placeholder="Search Workstream"
              className="w-full"
            />
          </div>
        </div>

        {/* What's happening */}

        {/* Who to follow */}
        <Card>
          <h3 className="text-xl font-bold dark:text-white mb-4">
            Leaderboard
          </h3>

          {/* User 1 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                img="https://i.pravatar.cc/150?img=1"
                rounded
                size="md"
              />
              <div>
                <p className="text-sm font-semibold dark:text-white">
                  Calvin Drag
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @Cyb3rDr34mer
                </p>
              </div>
            </div>
            <Button color="dark" size="sm" pill>
              Follow
            </Button>
          </div>

          {/* User 2 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                img="https://i.pravatar.cc/150?img=5"
                rounded
                size="md"
              />
              <div>
                <p className="text-sm font-semibold dark:text-white">
                  Ivy Root
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @ivy_root_29
                </p>
              </div>
            </div>
            <Button color="dark" size="sm" pill>
              Follow
            </Button>
          </div>

          {/* User 3 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                img="https://i.pravatar.cc/150?img=5"
                rounded
                size="md"
              />
              <div>
                <p className="text-sm font-semibold dark:text-white">
                  Ivy Root
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @ivy_root_29
                </p>
              </div>
            </div>
            <Button color="dark" size="sm" pill>
              Follow
            </Button>
          </div>
        </Card>
      </div>
    </aside>
  );
}
