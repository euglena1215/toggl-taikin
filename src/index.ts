import { ENDPOINT, TOGGL_WORKSPACE_ID, TOGGL_AVAILABLE_PARAMS, SLACK_INCOMING_WEBHOOK, SHEET_ID } from "./const";

const spreadsheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("シート1");

global.main = () => {
  Logger.log(transformSheetToJson(spreadsheet.getDataRange().getValues()));
};

const transformSheetToJson = values => {
  const columnNames = values[0];
  Logger.log(columnNames);
  Logger.log(values);
  return values.slice(1).map(val => {
    let obj = {};
    val.forEach((v, index) => {
      obj[columnNames[index]] = v;
    });
    return obj;
  });
};

global.doPost = e => {
  const userId = e.parameter.user_id;
  const userAttributes = fetchUserAttributes(userId);
  const isStopped = stopTimer(fetchCurrentTimerId(userAttributes.togglApiToken), userAttributes.togglApiToken);
  sendOtsukareReply(userId, userAttributes.togglApiToken, userAttributes.togglUserAgent, isStopped);
};

const fetchUserAttributes = slackUserId => {
  const userAttributes = transformSheetToJson(spreadsheet.getDataRange().getValues()).filter(
    val => val.slackUserId === slackUserId
  )[0];

  if (userAttributes === undefined) {
    return {};
  }

  return userAttributes;
};

const fetchCurrentTimerId = apiToken => {
  const options = {
    headers: { Authorization: " Basic " + Utilities.base64Encode(apiToken + ":api_token") },
  };
  const json = JSON.parse(UrlFetchApp.fetch(ENDPOINT.TOGGL_TIMER_CURRENT, options).getContentText());
  if (json.data === null) {
    return null;
  }

  return json.data.id;
};

const stopTimer = (timerId, apiToken) => {
  if (timerId === null) {
    return false;
  }

  const res = JSON.parse(
    UrlFetchApp.fetch(ENDPOINT.TOGGL_TIMER_STOP(timerId), {
      headers: { Authorization: " Basic " + Utilities.base64Encode(apiToken + ":api_token") },
      method: "put",
      contentType: "application/json",
    }).getContentText()
  );

  return res.data !== null;
};

const sendOtsukareReply = (userId, apiToken, userAgent, isStopped) => {
  let text = `<@${userId}> 今日は${minutesToReadableFormat(
    fetchTodayWorktime(apiToken, userAgent)
  )}も働いたんか。ようやったな。おつかれさん。`;

  if (isStopped) {
    text += "\nあとタイマー付いとったから止めといたで。";
  }
  UrlFetchApp.fetch(SLACK_INCOMING_WEBHOOK, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      text: text,
      username: "おつカレーBOT",
      icon_emoji: ":otsukare:",
    }),
  });
};

const fetchTodayWorktime = (apiToken, userAgent) => {
  const options = {
    headers: { Authorization: " Basic " + Utilities.base64Encode(apiToken + ":api_token") },
  };
  const params = {
    user_agent: userAgent,
    workspace_id: TOGGL_WORKSPACE_ID,
    since: getTodayFormatString(),
    until: getTodayFormatString(),
  };
  const json = JSON.parse(UrlFetchApp.fetch(joinUrlAndParams(ENDPOINT.TOGGL_REPORT, params), options).getContentText());

  // milliseconds to minutes
  return json.total_grand / 1000 / 60;
};

const minutesToReadableFormat = minutes => {
  let hours = 0;
  if (Math.floor(minutes / 60) > 0) {
    hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
  }

  return `${hours}時間${minutes}分`;
};

const joinUrlAndParams = (url, params) => {
  return `${url}?${objToQueryParameter(params)}`;
};

const objToQueryParameter = obj => {
  return TOGGL_AVAILABLE_PARAMS.map(key => [key, obj[key]])
    .filter(pair => pair[1] !== undefined)
    .map(pair => pair.join("="))
    .join("&");
};

const getTodayFormatString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};
