import {
  TOGGL_API_TOKEN,
  ENDPOINT,
  TOGGL_USER_AGENT,
  TOGGL_WORKSPACE_ID,
  TOGGL_AVAILABLE_PARAMS,
  SLACK_INCOMING_WEBHOOK,
} from "./const";

global.doPost = e => {
  const userId = e.parameter.user_id;
  const isStopped = stopTimer(fetchCurrentTimerId());
  sendOtsukareReply(userId, isStopped);
};

const fetchCurrentTimerId = () => {
  const options = {
    headers: { Authorization: " Basic " + Utilities.base64Encode(TOGGL_API_TOKEN + ":api_token") },
  };
  const json = JSON.parse(UrlFetchApp.fetch(ENDPOINT.TOGGL_TIMER_CURRENT, options).getContentText());
  if (json.data === null) {
    return null;
  }

  return json.data.id;
};

const stopTimer = timer_id => {
  if (timer_id === null) {
    return false;
  }

  const res = JSON.parse(
    UrlFetchApp.fetch(ENDPOINT.TOGGL_TIMER_STOP(timer_id), {
      headers: { Authorization: " Basic " + Utilities.base64Encode(TOGGL_API_TOKEN + ":api_token") },
      method: "put",
      contentType: "application/json",
    }).getContentText()
  );

  return res.data !== null;
};

const sendOtsukareReply = (userId, isStopped) => {
  let text = `<@${userId}> 今日は${minutesToReadableFormat(
    fetchTodayWorktime()
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

const fetchTodayWorktime = () => {
  const options = {
    headers: { Authorization: " Basic " + Utilities.base64Encode(TOGGL_API_TOKEN + ":api_token") },
  };
  const params = {
    user_agent: TOGGL_USER_AGENT,
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
