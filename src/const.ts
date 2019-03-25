export const ENDPOINT = {
  TOGGL_REPORT: "https://toggl.com/reports/api/v2/details",
};

export const TOGGL_API_TOKEN = PropertiesService.getScriptProperties().getProperty("TOGGL_API_TOKEN");
export const TOGGL_USER_AGENT = PropertiesService.getScriptProperties().getProperty("TOGGL_USER_AGENT");
export const TOGGL_WORKSPACE_ID = PropertiesService.getScriptProperties().getProperty("TOGGL_WORKSPACE_ID");

export const TOGGL_AVAILABLE_PARAMS = [
  "user_agent",
  "workspace_id",
  "since",
  "until",
  "billable",
  "client_ids",
  "project_ids",
];
