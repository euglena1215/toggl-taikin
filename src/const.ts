export const ENDPOINT = {
  TOGGL_REPORT: "https://toggl.com/reports/api/v2/details",
  TOGGL_TIMER_CURRENT: "https://www.toggl.com/api/v8/time_entries/current",
  TOGGL_TIMER_STOP: timer_id => `https://www.toggl.com/api/v8/time_entries/${timer_id}/stop`,
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

export const SLACK_INCOMING_WEBHOOK = PropertiesService.getScriptProperties().getProperty("SLACK_INCOMING_WEBHOOK");
