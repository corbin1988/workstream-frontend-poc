import { useState, useMemo } from "react";
import { Label, TextInput, Button, Select, ToggleSwitch, Badge, Checkbox } from "flowbite-react";

interface Project {
  key: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

interface StatusMapping {
  jiraStatus: string;
  feedCategory: string;
}

interface Issue {
  projectKey: string;
  issueKey: string;
  title: string;
  description: string;
  status: string;
  assignee?: string;
  epicKey?: string;
  links: { type: string; key: string }[];
}

// Mock data
const mockProjects: Project[] = [
  { key: "PROJ", name: "Main Project" },
  { key: "WEB", name: "Web Platform" },
  { key: "API", name: "API Services" },
  { key: "MOB", name: "Mobile App" },
];

const mockUsers: User[] = [
  { id: "user1", name: "Alice Johnson" },
  { id: "user2", name: "Bob Smith" },
  { id: "user3", name: "Carol Davis" },
  { id: "user4", name: "David Wilson" },
];

const discoveredStatuses = ["To Do", "In Progress", "In Review", "Blocked", "Done"];

const mockIssues: Issue[] = [
  {
    projectKey: "PROJ",
    issueKey: "PROJ-123",
    title: "Implement user authentication",
    description: "Add OAuth 2.0 authentication flow",
    status: "In Progress",
    assignee: "Alice Johnson",
    epicKey: "PROJ-100",
    links: [{ type: "blocks", key: "PROJ-124" }],
  },
  {
    projectKey: "WEB",
    issueKey: "WEB-456",
    title: "Update dashboard UI",
    description: "Redesign the main dashboard for better UX",
    status: "To Do",
    assignee: "Bob Smith",
    links: [{ type: "parent", key: "WEB-400" }],
  },
  {
    projectKey: "PROJ",
    issueKey: "PROJ-789",
    title: "Fix payment processing bug",
    description: "Resolve issue with credit card validation",
    status: "Blocked",
    assignee: "Carol Davis",
    links: [],
  },
  {
    projectKey: "API",
    issueKey: "API-101",
    title: "Database migration",
    description: "Migrate from PostgreSQL 12 to 14",
    status: "Done",
    assignee: "David Wilson",
    links: [{ type: "is blocked by", key: "API-102" }],
  },
  {
    projectKey: "MOB",
    issueKey: "MOB-202",
    title: "Push notification service",
    description: "Implement Firebase push notifications",
    status: "In Review",
    links: [],
  },
];

export default function Settings() {
  // Jira Connection
  const [connected, setConnected] = useState(false);
  const [jiraUrl, setJiraUrl] = useState("");

  // Scope
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [pilotUsers, setPilotUsers] = useState<string[]>([]);
  const [excludeUnassigned, setExcludeUnassigned] = useState(false);

  // Status Mapping
  const [statusMappings, setStatusMappings] = useState<StatusMapping[]>(
    discoveredStatuses.map(status => ({
      jiraStatus: status,
      feedCategory: status === "To Do" ? "Not Started" : 
                   status === "In Progress" ? "In Progress" : 
                   status === "Blocked" ? "Blocked" : 
                   status === "Done" ? "Done" : "In Progress"
    }))
  );

  // Epic / Parent
  const [epicStrategy, setEpicStrategy] = useState("Epic Link");

  // Dependencies
  const [blocksLinkTypes, setBlocksLinkTypes] = useState<string[]>(["blocks"]);
  const [parentLinkTypes, setParentLinkTypes] = useState<string[]>(["parent"]);

  // Work Review Rules
  const [weekdays, setWeekdays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [reviewWindowStart, setReviewWindowStart] = useState("09:00");
  const [reviewWindowEnd, setReviewWindowEnd] = useState("11:00");
  const [stalenessThresholdDays, setStalenessThresholdDays] = useState(2);
  const [silenceMeansConfirmed, setSilenceMeansConfirmed] = useState(true);

  const handleConnect = () => {
    setConnected(true);
    setJiraUrl("https://company.atlassian.net");
  };

  const handleReconnect = () => {
    setConnected(false);
    setTimeout(() => {
      setConnected(true);
      setJiraUrl("https://company.atlassian.net");
    }, 1000);
  };

  const handleTestPermissions = () => {
    alert("✅ Permissions test successful! Can read projects and issues.");
  };

  const updateStatusMapping = (jiraStatus: string, feedCategory: string) => {
    setStatusMappings(prev => 
      prev.map(mapping => 
        mapping.jiraStatus === jiraStatus 
          ? { ...mapping, feedCategory } 
          : mapping
      )
    );
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...");
    alert("Draft saved successfully!");
  };

  const handleSaveActivate = () => {
    console.log("Saving and activating...");
    alert("Configuration saved and activated!");
  };

  // Validation
  const isValid = useMemo(() => {
    const allStatusesMapped = statusMappings.every(mapping => mapping.feedCategory);
    const timeValid = reviewWindowStart < reviewWindowEnd;
    const stalenessValid = stalenessThresholdDays >= 1 && stalenessThresholdDays <= 30;
    
    return connected && 
           selectedProjects.length > 0 && 
           pilotUsers.length > 0 && 
           allStatusesMapped && 
           timeValid && 
           stalenessValid;
  }, [connected, selectedProjects, pilotUsers, statusMappings, reviewWindowStart, reviewWindowEnd, stalenessThresholdDays]);

  // Filtered issues for preview
  const filteredIssues = useMemo(() => {
    return mockIssues.filter(issue => {
      const projectMatch = selectedProjects.length === 0 || selectedProjects.includes(issue.projectKey);
      const assigneeMatch = !excludeUnassigned || issue.assignee;
      return projectMatch && assigneeMatch;
    });
  }, [selectedProjects, excludeUnassigned]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Jira Setup (MVP)
          </h1>
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveDraft}
              disabled={!connected}
              color="gray"
            >
              Save Draft
            </Button>
            <Button 
              onClick={handleSaveActivate}
              disabled={!isValid}
            >
              Save & Activate
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* 1. Jira Connection */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Jira Connection
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge color={connected ? "success" : "gray"}>
                    {connected ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
                
                <div>
                  <Label htmlFor="jiraUrl">Jira Instance URL</Label>
                  <TextInput
                    id="jiraUrl"
                    type="url"
                    value={jiraUrl}
                    readOnly
                    placeholder="Not connected"
                  />
                </div>
                
                <div className="flex gap-2">
                  {!connected ? (
                    <Button onClick={handleConnect}>Connect</Button>
                  ) : (
                    <Button onClick={handleReconnect} color="gray">Reconnect</Button>
                  )}
                  <Button 
                    onClick={handleTestPermissions}
                    disabled={!connected}
                    color="gray"
                  >
                    Test Permissions
                  </Button>
                </div>
              </div>
            </section>

            {/* 2. Scope */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Scope
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>Selected Projects *</Label>
                  <div className="mt-2 space-y-2">
                    {mockProjects.map((project) => (
                      <label key={project.key} className="flex items-center">
                        <Checkbox
                          checked={selectedProjects.includes(project.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjects([...selectedProjects, project.key]);
                            } else {
                              setSelectedProjects(selectedProjects.filter(p => p !== project.key));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                          {project.key} - {project.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Pilot Users *</Label>
                  <div className="mt-2 space-y-2">
                    {mockUsers.map((user) => (
                      <label key={user.id} className="flex items-center">
                        <Checkbox
                          checked={pilotUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPilotUsers([...pilotUsers, user.id]);
                            } else {
                              setPilotUsers(pilotUsers.filter(u => u !== user.id));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                          {user.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={excludeUnassigned}
                    onChange={setExcludeUnassigned}
                    label="Exclude Unassigned Issues"
                  />
                </div>
              </div>
            </section>

            {/* 3. Status Mapping */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Status Mapping *
              </h2>
              <div className="space-y-3">
                {statusMappings.map((mapping) => (
                  <div key={mapping.jiraStatus} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      {mapping.jiraStatus}
                    </span>
                    <Select
                      value={mapping.feedCategory}
                      onChange={(e) => updateStatusMapping(mapping.jiraStatus, e.target.value)}
                      className="w-40"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Done">Done</option>
                    </Select>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Epic / Parent */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Epic / Parent
              </h2>
              <div>
                <Label htmlFor="epicStrategy">Epic Strategy</Label>
                <Select
                  id="epicStrategy"
                  value={epicStrategy}
                  onChange={(e) => setEpicStrategy(e.target.value)}
                >
                  <option value="Epic Link">Epic Link</option>
                  <option value="Parent">Parent</option>
                  <option value="Issue Type Epic">Issue Type Epic</option>
                </Select>
              </div>
            </section>

            {/* 5. Dependencies */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Dependencies
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>Blocks Link Types</Label>
                  <div className="mt-2 space-y-2">
                    {["blocks", "is blocked by"].map((linkType) => (
                      <label key={linkType} className="flex items-center">
                        <Checkbox
                          checked={blocksLinkTypes.includes(linkType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBlocksLinkTypes([...blocksLinkTypes, linkType]);
                            } else {
                              setBlocksLinkTypes(blocksLinkTypes.filter(t => t !== linkType));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                          {linkType}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Parent Link Types</Label>
                  <div className="mt-2 space-y-2">
                    {["parent", "is child of"].map((linkType) => (
                      <label key={linkType} className="flex items-center">
                        <Checkbox
                          checked={parentLinkTypes.includes(linkType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setParentLinkTypes([...parentLinkTypes, linkType]);
                            } else {
                              setParentLinkTypes(parentLinkTypes.filter(t => t !== linkType));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                          {linkType}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Work Review Rules */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Work Review Rules
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>Review Days</Label>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {Object.entries(weekdays).map(([day, checked]) => (
                      <label key={day} className="flex items-center">
                        <Checkbox
                          checked={checked}
                          onChange={(e) => setWeekdays({...weekdays, [day]: e.target.checked})}
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-300 capitalize">
                          {day.slice(0, 3)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reviewWindowStart">Review Window Start</Label>
                    <TextInput
                      id="reviewWindowStart"
                      type="time"
                      value={reviewWindowStart}
                      onChange={(e) => setReviewWindowStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewWindowEnd">Review Window End</Label>
                    <TextInput
                      id="reviewWindowEnd"
                      type="time"
                      value={reviewWindowEnd}
                      onChange={(e) => setReviewWindowEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stalenessThresholdDays">Staleness Threshold Days (1-30)</Label>
                  <TextInput
                    id="stalenessThresholdDays"
                    type="number"
                    min={1}
                    max={30}
                    value={stalenessThresholdDays}
                    onChange={(e) => setStalenessThresholdDays(parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={silenceMeansConfirmed}
                    onChange={setSilenceMeansConfirmed}
                    label="Silence Means Confirmed"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Live Preview */}
          <div className="space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Live Preview
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredIssues.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No issues match current filters
                  </p>
                ) : (
                  filteredIssues.map((issue) => {
                    const statusMapping = statusMappings.find(m => m.jiraStatus === issue.status);
                    const feedCategory = statusMapping?.feedCategory || "In Progress";
                    
                    return (
                      <div key={issue.issueKey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {issue.issueKey}: {issue.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {issue.description}
                            </p>
                          </div>
                          <Badge 
                            color={
                              feedCategory === "Not Started" ? "gray" :
                              feedCategory === "In Progress" ? "blue" :
                              feedCategory === "Blocked" ? "failure" :
                              "success"
                            }
                          >
                            {feedCategory}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge color="purple">{issue.projectKey}</Badge>
                          {issue.assignee && (
                            <Badge color="indigo">{issue.assignee}</Badge>
                          )}
                          {issue.epicKey && (
                            <Badge color="pink">Epic: {issue.epicKey}</Badge>
                          )}
                          {issue.links.map((link, idx) => (
                            <Badge 
                              key={idx} 
                              color={
                                blocksLinkTypes.includes(link.type) ? "failure" :
                                parentLinkTypes.includes(link.type) ? "warning" :
                                "gray"
                              }
                            >
                              {blocksLinkTypes.includes(link.type) ? "blocks" :
                               parentLinkTypes.includes(link.type) ? "parent" :
                               link.type}: {link.key}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 text-xs text-gray-500 dark:text-gray-400">
                          📝 Code activity not connected
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// Opt out of the main layout
Settings.useLayout = false;
