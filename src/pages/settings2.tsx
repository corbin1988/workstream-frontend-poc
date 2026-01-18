import { useState, useMemo } from "react";
import { Label, TextInput, Button, Select, ToggleSwitch, Badge, Checkbox, Table } from "flowbite-react";

interface Project {
  key: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

interface Assignee {
  id: string;
  displayName: string;
}

interface StatusMapping {
  jiraStatus: string;
  feedCategory: string;
}

interface TeamMapping {
  jiraValue: string;
  teamKey: string;
  teamName: string;
}

interface Issue {
  projectKey: string;
  issueKey: string;
  title: string;
  description: string;
  status: string;
  assignee?: Assignee;
  epicKey?: string;
  links: { type: string; key: string }[];
  updatedAt: string;
  createdAt: string;
  dueDate?: string;
  priority?: string;
  components: string[];
  labels: string[];
  customFields: Record<string, any>;
  statusHistory: { status: string; timestamp: string }[];
  comments: string[];
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
    assignee: { id: "user1", displayName: "Alice Johnson" },
    epicKey: "PROJ-100",
    links: [{ type: "blocks", key: "PROJ-124" }],
    updatedAt: "2026-01-17T10:30:00Z",
    createdAt: "2026-01-15T09:00:00Z",
    dueDate: "2026-01-25T23:59:59Z",
    priority: "High",
    components: ["Authentication", "Frontend"],
    labels: ["security", "oauth"],
    customFields: { customfield_12345: "Custom description field" },
    statusHistory: [
      { status: "To Do", timestamp: "2026-01-15T09:00:00Z" },
      { status: "In Progress", timestamp: "2026-01-16T10:15:00Z" }
    ],
    comments: ["Initial analysis completed", "OAuth provider selected"]
  },
  {
    projectKey: "WEB",
    issueKey: "WEB-456",
    title: "Update dashboard UI",
    description: "Redesign the main dashboard for better UX",
    status: "To Do",
    assignee: { id: "user2", displayName: "Bob Smith" },
    links: [{ type: "parent", key: "WEB-400" }],
    updatedAt: "2026-01-18T08:15:00Z",
    createdAt: "2026-01-10T14:30:00Z",
    priority: "Medium",
    components: ["UI/UX"],
    labels: ["dashboard", "redesign"],
    customFields: { teamField: "Design Team" },
    statusHistory: [
      { status: "To Do", timestamp: "2026-01-10T14:30:00Z" }
    ],
    comments: ["Waiting for design mockups"]
  },
  {
    projectKey: "PROJ",
    issueKey: "PROJ-789",
    title: "Fix payment processing bug",
    description: "Resolve issue with credit card validation",
    status: "Blocked",
    assignee: { id: "user3", displayName: "Carol Davis" },
    links: [],
    updatedAt: "2026-01-16T16:45:00Z",
    createdAt: "2026-01-12T11:20:00Z",
    dueDate: "2026-01-22T23:59:59Z",
    priority: "Critical",
    components: ["Payment"],
    labels: ["bug", "critical"],
    customFields: {},
    statusHistory: [
      { status: "To Do", timestamp: "2026-01-12T11:20:00Z" },
      { status: "In Progress", timestamp: "2026-01-14T09:30:00Z" },
      { status: "Blocked", timestamp: "2026-01-16T16:45:00Z" }
    ],
    comments: ["Blocked by payment provider API issue"]
  },
  {
    projectKey: "API",
    issueKey: "API-101",
    title: "Database migration",
    description: "Migrate from PostgreSQL 12 to 14",
    status: "Done",
    assignee: { id: "user4", displayName: "David Wilson" },
    links: [{ type: "is blocked by", key: "API-102" }],
    updatedAt: "2026-01-15T17:30:00Z",
    createdAt: "2026-01-08T10:00:00Z",
    priority: "High",
    components: ["Database"],
    labels: ["migration", "postgres"],
    customFields: { teamField: "Backend Team" },
    statusHistory: [
      { status: "To Do", timestamp: "2026-01-08T10:00:00Z" },
      { status: "In Progress", timestamp: "2026-01-10T08:00:00Z" },
      { status: "Done", timestamp: "2026-01-15T17:30:00Z" }
    ],
    comments: ["Migration completed successfully", "Performance improved by 40%"]
  },
  {
    projectKey: "MOB",
    issueKey: "MOB-202",
    title: "Push notification service",
    description: "Implement Firebase push notifications",
    status: "In Review",
    links: [],
    updatedAt: "2026-01-14T12:00:00Z",
    createdAt: "2026-01-05T15:45:00Z",
    components: ["Mobile", "Notifications"],
    labels: ["firebase", "mobile"],
    customFields: {},
    statusHistory: [
      { status: "To Do", timestamp: "2026-01-05T15:45:00Z" },
      { status: "In Progress", timestamp: "2026-01-08T09:15:00Z" },
      { status: "In Review", timestamp: "2026-01-14T12:00:00Z" }
    ],
    comments: ["Ready for testing on staging environment"]
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
  const [previewOnlyPilotUsers, setPreviewOnlyPilotUsers] = useState(true);

  // Field Mapping
  const [descriptionSource, setDescriptionSource] = useState("jira:description");
  const [descriptionCustomField, setDescriptionCustomField] = useState("");
  const [assigneeIdentitySource, setAssigneeIdentitySource] = useState("jira:displayName");
  const [intentTimestampSource, setIntentTimestampSource] = useState("jira:created");
  const [intentTimestampStatus, setIntentTimestampStatus] = useState("In Progress");
  const [intentTimestampCustomField, setIntentTimestampCustomField] = useState("");
  const [prioritySource, setPrioritySource] = useState("jira:priority");
  const [priorityCustomField, setPriorityCustomField] = useState("");
  const [dueDateSource, setDueDateSource] = useState("jira:duedate");
  const [dueDateCustomField, setDueDateCustomField] = useState("");
  const [commentsSource, setCommentsSource] = useState("jira:comments");

  // Team Mapping
  const [teamSource, setTeamSource] = useState("project");
  const [teamCustomField, setTeamCustomField] = useState("");
  const [teamMappings, setTeamMappings] = useState<TeamMapping[]>([
    { jiraValue: "PROJ", teamKey: "core", teamName: "Core Team" },
    { jiraValue: "WEB", teamKey: "frontend", teamName: "Frontend Team" },
    { jiraValue: "API", teamKey: "backend", teamName: "Backend Team" },
    { jiraValue: "MOB", teamKey: "mobile", teamName: "Mobile Team" },
  ]);

  // Active Work Criteria
  const [activeStatusCategories, setActiveStatusCategories] = useState<string[]>(["Not Started", "In Progress", "Blocked"]);
  const [requireAssignee, setRequireAssignee] = useState(true);
  const [recencyThresholdDays, setRecencyThresholdDays] = useState(7);
  const [includeResolvedDays, setIncludeResolvedDays] = useState(3);

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
  const [blocksOutwardTypes, setBlocksOutwardTypes] = useState<string[]>(["blocks"]);
  const [blocksInwardTypes, setBlocksInwardTypes] = useState<string[]>(["is blocked by"]);
  const [parentOutwardTypes, setParentOutwardTypes] = useState<string[]>(["parent"]);
  const [parentInwardTypes, setParentInwardTypes] = useState<string[]>(["is child of"]);

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

  const addTeamMapping = () => {
    setTeamMappings([...teamMappings, { jiraValue: "", teamKey: "", teamName: "" }]);
  };

  const removeTeamMapping = (index: number) => {
    setTeamMappings(teamMappings.filter((_, i) => i !== index));
  };

  const updateTeamMapping = (index: number, field: keyof TeamMapping, value: string) => {
    setTeamMappings(prev => 
      prev.map((mapping, i) => 
        i === index ? { ...mapping, [field]: value } : mapping
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

  // Helper functions for field mapping
  const getDescriptionValue = (issue: Issue): string => {
    switch (descriptionSource) {
      case "jira:customField":
        return issue.customFields[descriptionCustomField] || "";
      case "none":
        return "";
      default:
        return issue.description;
    }
  };

  const getAssigneeId = (issue: Issue): string => {
    if (!issue.assignee) return "";
    return assigneeIdentitySource === "jira:accountId" ? issue.assignee.id : issue.assignee.displayName;
  };

  const getIntentTimestamp = (issue: Issue): string => {
    switch (intentTimestampSource) {
      case "jira:created":
        return issue.createdAt;
      case "jira:updated":
        return issue.updatedAt;
      case "jira:statusEntered":
        const statusEntry = issue.statusHistory.find(h => h.status === intentTimestampStatus);
        return statusEntry?.timestamp || issue.createdAt;
      case "jira:customField":
        return issue.customFields[intentTimestampCustomField] || issue.createdAt;
      default:
        return issue.createdAt;
    }
  };

  const getPriorityValue = (issue: Issue): string => {
    switch (prioritySource) {
      case "jira:customField":
        return issue.customFields[priorityCustomField] || "";
      case "none":
        return "";
      default:
        return issue.priority || "";
    }
  };

  const getDueDateValue = (issue: Issue): string => {
    switch (dueDateSource) {
      case "jira:customField":
        return issue.customFields[dueDateCustomField] || "";
      case "none":
        return "";
      default:
        return issue.dueDate || "";
    }
  };

  const getTeamInfo = (issue: Issue): { key: string; name: string } | null => {
    if (teamSource === "none") return null;

    let jiraValue = "";
    switch (teamSource) {
      case "project":
        jiraValue = issue.projectKey;
        break;
      case "component":
        jiraValue = issue.components[0] || "";
        break;
      case "label":
        jiraValue = issue.labels[0] || "";
        break;
      case "customField":
        jiraValue = issue.customFields[teamCustomField] || "";
        break;
    }

    const teamMapping = teamMappings.find(tm => tm.jiraValue === jiraValue);
    return teamMapping ? { key: teamMapping.teamKey, name: teamMapping.teamName } : null;
  };

  const isIssueStale = (issue: Issue): boolean => {
    const updatedDate = new Date(issue.updatedAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > recencyThresholdDays;
  };

  const shouldIncludeIssue = (issue: Issue): boolean => {
    const statusMapping = statusMappings.find(m => m.jiraStatus === issue.status);
    const feedCategory = statusMapping?.feedCategory || "In Progress";
    
    // Check active status categories
    let includeByStatus = activeStatusCategories.includes(feedCategory);
    
    // Check resolved items within threshold
    if (!includeByStatus && feedCategory === "Done") {
      const updatedDate = new Date(issue.updatedAt);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
      includeByStatus = diffDays <= includeResolvedDays;
    }
    
    if (!includeByStatus) return false;
    
    // Check assignee requirement
    if (requireAssignee && !issue.assignee) return false;
    
    return true;
  };

  // Validation
  const isValid = useMemo(() => {
    const allStatusesMapped = statusMappings.every(mapping => mapping.feedCategory);
    const timeValid = reviewWindowStart < reviewWindowEnd;
    const stalenessValid = stalenessThresholdDays >= 1 && stalenessThresholdDays <= 30;
    const reviewDaysSelected = Object.values(weekdays).some(day => day);
    
    // Check custom field validations
    const descriptionFieldValid = descriptionSource !== "jira:customField" || descriptionCustomField.trim() !== "";
    const intentFieldValid = intentTimestampSource !== "jira:customField" || intentTimestampCustomField.trim() !== "";
    const priorityFieldValid = prioritySource !== "jira:customField" || priorityCustomField.trim() !== "";
    const dueDateFieldValid = dueDateSource !== "jira:customField" || dueDateCustomField.trim() !== "";
    const teamFieldValid = teamSource !== "customField" || teamCustomField.trim() !== "";
    
    return connected && 
           selectedProjects.length > 0 && 
           pilotUsers.length > 0 && 
           reviewDaysSelected &&
           allStatusesMapped && 
           timeValid && 
           stalenessValid &&
           descriptionFieldValid &&
           intentFieldValid &&
           priorityFieldValid &&
           dueDateFieldValid &&
           teamFieldValid;
  }, [connected, selectedProjects, pilotUsers, statusMappings, reviewWindowStart, reviewWindowEnd, 
      stalenessThresholdDays, weekdays, descriptionSource, descriptionCustomField, 
      intentTimestampSource, intentTimestampCustomField, prioritySource, priorityCustomField, 
      dueDateSource, dueDateCustomField, teamSource, teamCustomField]);

  // Filtered issues for preview
  const filteredIssues = useMemo(() => {
    let filtered = mockIssues.filter(issue => {
      const projectMatch = selectedProjects.length === 0 || selectedProjects.includes(issue.projectKey);
      const assigneeMatch = !excludeUnassigned || issue.assignee;
      const pilotUserMatch = !previewOnlyPilotUsers || !issue.assignee || pilotUsers.includes(issue.assignee.id);
      const criteriaMatch = shouldIncludeIssue(issue);
      
      return projectMatch && assigneeMatch && pilotUserMatch && criteriaMatch;
    });

    return filtered;
  }, [selectedProjects, excludeUnassigned, previewOnlyPilotUsers, pilotUsers, activeStatusCategories, 
      requireAssignee, recencyThresholdDays, includeResolvedDays, statusMappings]);

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

                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={previewOnlyPilotUsers}
                    onChange={setPreviewOnlyPilotUsers}
                    label="Preview only pilot users"
                  />
                </div>
              </div>
            </section>

            {/* 3. Field Mapping (MVP) */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Field Mapping (MVP)
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="descriptionSource">Description source</Label>
                  <Select
                    id="descriptionSource"
                    value={descriptionSource}
                    onChange={(e) => setDescriptionSource(e.target.value)}
                  >
                    <option value="jira:description">jira:description</option>
                    <option value="jira:customField">jira:customField</option>
                    <option value="none">none</option>
                  </Select>
                  {descriptionSource === "jira:customField" && (
                    <TextInput
                      className="mt-2"
                      placeholder="e.g., customfield_12345"
                      value={descriptionCustomField}
                      onChange={(e) => setDescriptionCustomField(e.target.value)}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="assigneeIdentitySource">Assignee identity source</Label>
                  <Select
                    id="assigneeIdentitySource"
                    value={assigneeIdentitySource}
                    onChange={(e) => setAssigneeIdentitySource(e.target.value)}
                  >
                    <option value="jira:accountId">jira:accountId</option>
                    <option value="jira:displayName">jira:displayName</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="intentTimestampSource">Intent timestamp source</Label>
                  <Select
                    id="intentTimestampSource"
                    value={intentTimestampSource}
                    onChange={(e) => setIntentTimestampSource(e.target.value)}
                  >
                    <option value="jira:created">jira:created</option>
                    <option value="jira:updated">jira:updated</option>
                    <option value="jira:statusEntered">jira:statusEntered</option>
                    <option value="jira:customField">jira:customField</option>
                  </Select>
                  {intentTimestampSource === "jira:statusEntered" && (
                    <Select
                      className="mt-2"
                      value={intentTimestampStatus}
                      onChange={(e) => setIntentTimestampStatus(e.target.value)}
                    >
                      {discoveredStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                  )}
                  {intentTimestampSource === "jira:customField" && (
                    <TextInput
                      className="mt-2"
                      placeholder="e.g., customfield_12345"
                      value={intentTimestampCustomField}
                      onChange={(e) => setIntentTimestampCustomField(e.target.value)}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="prioritySource">Priority source</Label>
                  <Select
                    id="prioritySource"
                    value={prioritySource}
                    onChange={(e) => setPrioritySource(e.target.value)}
                  >
                    <option value="jira:priority">jira:priority</option>
                    <option value="jira:customField">jira:customField</option>
                    <option value="none">none</option>
                  </Select>
                  {prioritySource === "jira:customField" && (
                    <TextInput
                      className="mt-2"
                      placeholder="e.g., customfield_12345"
                      value={priorityCustomField}
                      onChange={(e) => setPriorityCustomField(e.target.value)}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="dueDateSource">Due date source</Label>
                  <Select
                    id="dueDateSource"
                    value={dueDateSource}
                    onChange={(e) => setDueDateSource(e.target.value)}
                  >
                    <option value="jira:duedate">jira:duedate</option>
                    <option value="jira:customField">jira:customField</option>
                    <option value="none">none</option>
                  </Select>
                  {dueDateSource === "jira:customField" && (
                    <TextInput
                      className="mt-2"
                      placeholder="e.g., customfield_12345"
                      value={dueDateCustomField}
                      onChange={(e) => setDueDateCustomField(e.target.value)}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="commentsSource">Comments source</Label>
                  <Select
                    id="commentsSource"
                    value={commentsSource}
                    onChange={(e) => setCommentsSource(e.target.value)}
                  >
                    <option value="jira:comments">jira:comments</option>
                    <option value="none">none</option>
                  </Select>
                </div>
              </div>
            </section>

            {/* 4. Team Mapping (MVP) */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Team Mapping (MVP)
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamSource">Team source</Label>
                  <Select
                    id="teamSource"
                    value={teamSource}
                    onChange={(e) => setTeamSource(e.target.value)}
                  >
                    <option value="project">project</option>
                    <option value="component">component</option>
                    <option value="label">label</option>
                    <option value="customField">customField</option>
                    <option value="none">none</option>
                  </Select>
                  {teamSource === "customField" && (
                    <TextInput
                      className="mt-2"
                      placeholder="e.g., customfield_12345"
                      value={teamCustomField}
                      onChange={(e) => setTeamCustomField(e.target.value)}
                    />
                  )}
                </div>

                {teamSource !== "none" && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Team Mappings</Label>
                      <Button size="sm" onClick={addTeamMapping}>Add Mapping</Button>
                    </div>
                    <div className="space-y-2">
                      {teamMappings.map((mapping, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <TextInput
                            placeholder="Jira Value"
                            value={mapping.jiraValue}
                            onChange={(e) => updateTeamMapping(index, "jiraValue", e.target.value)}
                            className="flex-1"
                          />
                          <TextInput
                            placeholder="Team Key"
                            value={mapping.teamKey}
                            onChange={(e) => updateTeamMapping(index, "teamKey", e.target.value)}
                            className="flex-1"
                          />
                          <TextInput
                            placeholder="Team Name"
                            value={mapping.teamName}
                            onChange={(e) => updateTeamMapping(index, "teamName", e.target.value)}
                            className="flex-1"
                          />
                          <Button size="sm" color="failure" onClick={() => removeTeamMapping(index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 5. Active Work Criteria (MVP) */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Active Work Criteria (MVP)
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>Active status categories</Label>
                  <div className="mt-2 space-y-2">
                    {["Not Started", "In Progress", "Blocked", "Done"].map((category) => (
                      <label key={category} className="flex items-center">
                        <Checkbox
                          checked={activeStatusCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setActiveStatusCategories([...activeStatusCategories, category]);
                            } else {
                              setActiveStatusCategories(activeStatusCategories.filter(c => c !== category));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={requireAssignee}
                    onChange={setRequireAssignee}
                    label="Require assignee"
                  />
                </div>

                <div>
                  <Label htmlFor="recencyThresholdDays">Jira recency threshold (days)</Label>
                  <TextInput
                    id="recencyThresholdDays"
                    type="number"
                    min={1}
                    max={365}
                    value={recencyThresholdDays}
                    onChange={(e) => setRecencyThresholdDays(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Label htmlFor="includeResolvedDays">Include resolved for last N days</Label>
                  <TextInput
                    id="includeResolvedDays"
                    type="number"
                    min={0}
                    max={30}
                    value={includeResolvedDays}
                    onChange={(e) => setIncludeResolvedDays(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </section>

            {/* 6. Status Mapping */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Status Mapping *
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

            {/* 7. Epic / Parent */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Epic / Parent
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

            {/* 8. Dependencies */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Dependencies
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>Blocks Outward Types</Label>
                  <div className="mt-2 space-y-2">
                    {["blocks", "causes"].map((linkType) => (
                      <label key={linkType} className="flex items-center">
                        <Checkbox
                          checked={blocksOutwardTypes.includes(linkType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBlocksOutwardTypes([...blocksOutwardTypes, linkType]);
                            } else {
                              setBlocksOutwardTypes(blocksOutwardTypes.filter(t => t !== linkType));
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
                  <Label>Blocks Inward Types</Label>
                  <div className="mt-2 space-y-2">
                    {["is blocked by", "is caused by"].map((linkType) => (
                      <label key={linkType} className="flex items-center">
                        <Checkbox
                          checked={blocksInwardTypes.includes(linkType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBlocksInwardTypes([...blocksInwardTypes, linkType]);
                            } else {
                              setBlocksInwardTypes(blocksInwardTypes.filter(t => t !== linkType));
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
                  <Label>Parent Outward Types</Label>
                  <div className="mt-2 space-y-2">
                    {["parent", "contains"].map((linkType) => (
                      <label key={linkType} className="flex items-center">
                        <Checkbox
                          checked={parentOutwardTypes.includes(linkType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setParentOutwardTypes([...parentOutwardTypes, linkType]);
                            } else {
                              setParentOutwardTypes(parentOutwardTypes.filter(t => t !== linkType));
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
                  <Label>Parent Inward Types</Label>
                  <div className="mt-2 space-y-2">
                    {["is child of", "is contained by"].map((linkType) => (
                      <label key={linkType} className="flex items-center">
                        <Checkbox
                          checked={parentInwardTypes.includes(linkType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setParentInwardTypes([...parentInwardTypes, linkType]);
                            } else {
                              setParentInwardTypes(parentInwardTypes.filter(t => t !== linkType));
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

            {/* 9. Work Review Rules */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Work Review Rules
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>Review Days *</Label>
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
                    const description = getDescriptionValue(issue);
                    const intentTimestamp = getIntentTimestamp(issue);
                    const priority = getPriorityValue(issue);
                    const dueDate = getDueDateValue(issue);
                    const teamInfo = getTeamInfo(issue);
                    const isStale = isIssueStale(issue);
                    
                    return (
                      <div key={issue.issueKey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {issue.issueKey}: {issue.title}
                            </h3>
                            {description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {description}
                              </p>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                              <div>intent_frozen_at: {new Date(intentTimestamp).toLocaleString()}</div>
                              {priority && prioritySource !== "none" && (
                                <div>Priority: {priority}</div>
                              )}
                              {dueDate && dueDateSource !== "none" && (
                                <div>Due: {new Date(dueDate).toLocaleDateString()}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
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
                            {isStale && (
                              <Badge color="warning" size="sm">STALE</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge color="purple">{issue.projectKey}</Badge>
                          {issue.assignee && (
                            <Badge color="indigo">
                              {assigneeIdentitySource === "jira:accountId" ? issue.assignee.id : issue.assignee.displayName}
                            </Badge>
                          )}
                          {teamInfo && (
                            <Badge color="green">{teamInfo.name}</Badge>
                          )}
                          {issue.epicKey && (
                            <Badge color="pink">Epic: {issue.epicKey}</Badge>
                          )}
                          {issue.links.map((link, idx) => {
                            const isBlocksOutward = blocksOutwardTypes.includes(link.type);
                            const isBlocksInward = blocksInwardTypes.includes(link.type);
                            const isParentOutward = parentOutwardTypes.includes(link.type);
                            const isParentInward = parentInwardTypes.includes(link.type);
                            
                            let linkLabel = link.type;
                            let linkColor = "gray";
                            
                            if (isBlocksOutward) {
                              linkLabel = `blocks → ${link.key}`;
                              linkColor = "failure";
                            } else if (isBlocksInward) {
                              linkLabel = `blocked by ← ${link.key}`;
                              linkColor = "failure";
                            } else if (isParentOutward) {
                              linkLabel = `parent → ${link.key}`;
                              linkColor = "warning";
                            } else if (isParentInward) {
                              linkLabel = `child of ← ${link.key}`;
                              linkColor = "warning";
                            } else {
                              linkLabel = `${link.type}: ${link.key}`;
                            }
                            
                            return (
                              <Badge key={idx} color={linkColor}>
                                {linkLabel}
                              </Badge>
                            );
                          })}
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
