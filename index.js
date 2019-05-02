const https = require("https");
const querystring = require("querystring");

const API_URL = "https://app.hacknplan.com/api/v1";
const PROJECT_TRACKER_APP_VERSION = "153";
const DEFAULT_TIMEOUT = 2000;

class HackNPlanApp {
  constructor(options) {
    this.token = options.token || "";
    this.username = options.username || "";
    this.password = options.password || "";
    this.projectId = options.projectId || "";
    this.userData = {};
  }

  baseJsonHeaders() {
    return {
      "Content-Type": "application/json;charset=UTF-8",
      "X-AppVersion": PROJECT_TRACKER_APP_VERSION,
      Authorization: `Bearer ${this.token}`,
      Cookie: `token=${this.token};`
    };
  }

  checkResponse(url, res, expectedStatusCode) {
    let data = "";

    res.on("data", chunk => {
      data += chunk;
    });

    res.on("end", () => {
      if (res.statusCode !== expectedStatusCode) {
        throw new Error(
          `UNEXPECTED ERROR RESPONSE FROM HackNPlan: CODE ${res.statusCode} - ${
            res.statusMessage
          }: \nURL: ${url}\nDATA RECEIVED:\n${data}`
        );
      }
    });
  }

  getUserData(forceRefresh = false, timeout = DEFAULT_TIMEOUT) {
    const options = {
      method: "GET"
    };

    const url = `${API_URL}/users/me`;

    return this.doRequest(url, options, null, 200, timeout, true);
  }

  logIn(timeout = DEFAULT_TIMEOUT) {
    return new Promise((resolve, reject) => {
      const loginData = querystring.stringify({
        grant_type: "password",
        username: this.username,
        password: this.password
      });

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-AppVersion": PROJECT_TRACKER_APP_VERSION
        },
        timeout: timeout
      };

      const url = `${API_URL}/users/login`;

      const loginReq = https
        .request(url, options, res => {
          this.checkResponse(url, res, 200);
          let data = "";

          res.on("data", chunk => {
            data += chunk;
          });

          res.on("end", async () => {
            this.token = JSON.parse(data.toString()).access_token;
            await this.getUserData();
            resolve(this.token);
          });
        })
        .on("error", e => {
          console.error(e);
          reject(e);
        });

      loginReq.write(loginData);
      loginReq.end();
    });
  }

  getTaskData(taskNumber, timeout = DEFAULT_TIMEOUT) {
    const options = {
      method: "GET"
    };

    const url = `${API_URL}/projects/${this.projectId}/tasks/${taskNumber}`;

    return this.doRequest(url, options, null, 200, timeout, true);
  }

  moveTaskToStage(taskNumber, stage, timeout = DEFAULT_TIMEOUT) {
    const url = `${API_URL}/projects/${this.projectId}/tasks/${taskNumber}/globalposition`;

    const options = {
      method: "PUT"
    };

    const stageData = JSON.stringify({
      Order: 1,
      ProjectId: this.projectId,
      StageId: stage,
      TaskId: taskNumber
    });

    return this.doRequest(url, options, stageData, 204, timeout);
  }

  commentOnTask(taskNumber, comment, timeout = DEFAULT_TIMEOUT) {
    const url = `${API_URL}/projects/${this.projectId}/tasks/${taskNumber}/comments`;

    return this.doRequest(url, {}, JSON.stringify(comment), 200, timeout);
  }

  addTaskOwner(taskNumber, ownerId, timeout = DEFAULT_TIMEOUT) {
    const url = `${API_URL}/projects/${this.projectId}/tasks/${taskNumber}/users`;

    return this.doRequest(url, {}, ownerId, 204, timeout);
  }

  removeTaskOwner(taskNumber, ownerId, timeout = DEFAULT_TIMEOUT) {
    const options = {
      method: "DELETE"
    };

    const url = `${API_URL}/projects/${this.projectId}/tasks/${taskNumber}/users`;

    return this.doRequest(url, options, ownerId, 204, timeout);
  }

  logWork(taskNumber, amount, comment, timeout = DEFAULT_TIMEOUT) {
    const body = {
      Comment: comment,
      Value: amount
    };

    const url = `${API_URL}/projects/${this.projectId}/tasks/${taskNumber}/worklogs`;

    return this.doRequest(url, {}, JSON.stringify(body), 204, timeout);
  }

  getTags(timeout = DEFAULT_TIMEOUT) {
    const options = {
      method: "GET"
    };

    const url = `${API_URL}/projects/${this.projectId}/tags`;

    return this.doRequest(url, options, null, 200, timeout, true);
  }

  createTag(name, icon, color, displayOnlyOnWorkItemCards, timeout = DEFAULT_TIMEOUT) {
    const url = `${API_URL}/projects/${this.projectId}/tags`;

    const body = JSON.stringify({
      Color: color,
      DisplayIconOnly: displayOnlyOnWorkItemCards,
      Icon: icon,
      Name: name
    });

    return this.doRequest(url, {}, body, 200, timeout, true);
  }

  removeTag(tagId, timeout = DEFAULT_TIMEOUT) {
    const url = `${API_URL}/projects/${this.projectId}/tags/${tagId}`;

    const options = {
      method: "DELETE"
    };

    return this.doRequest(url, options, body, 204, timeout);
  }

  addTagToTask(taskNumber, tagId, timeout = DEFAULT_TIMEOUT) {
    const url = `${API_URL}/projects/${this.projectId}/tasks/${taskNumber}/tags`;

    return this.doRequest(url, {}, tagId, 204, timeout);
  }

  removeTagFromTask(taskNumber, tagId, timeout = DEFAULT_TIMEOUT) {
    const url = `${API_URL}/projects/${this.projectId}/tasks/${taskNumber}/tags/${tagId}`;

    const options = {
      method: "DELETE"
    };

    return this.doRequest(url, options, tagId, 204, timeout);
  }

  doRequest(url, options = {}, body, expectedCode = 200, timeout = DEFAULT_TIMEOUT, parseJson = false) {
    return new Promise(async (resolve, reject) => {
      if (!this.token) {
        await this.logIn();
      }

      let baseOptions = {
        method: "POST",
        headers: this.baseJsonHeaders(),
        timeout: timeout
      };

      let treatedOptions = Object.assign({}, baseOptions, options);
      treatedOptions.headers = Object.assign({}, baseOptions.headers, options.headers || {});

      let req = https
        .request(url, treatedOptions, res => {
          this.checkResponse(url, res, expectedCode);
          res.setEncoding("utf8");
          let data = "";
          res.on("data", chunk => {
            data += chunk;
          });
          res.on("end", () => {
            resolve(parseJson ? JSON.parse(data) : data);
          });
        })
        .on("error", e => {
          console.error(e);
          reject(e);
        });

      if (body) {
        req.write(body + "");
      }
      req.end();
    });
  }
}

module.exports = {
  HackNPlanApp,
  STAGE_PLANNED: 1,
  STAGE_IN_PROGRESS: 2,
  STAGE_TESTING: 3,
  STAGE_COMPLETED: 4
};
