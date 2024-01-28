import sendEmail from "../utils/mail";
import * as userController from "./users";
import * as reportController from "./reports";
import { Check, CheckDocument } from "../models/urlCheck";
import axios, { InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse } from "axios";
import https from "https";


const axiosInstance = axios.create();

// Request Interceptor
axiosInstance.interceptors.request.use(
    (axiosRequestConfig: InternalAxiosRequestConfig) => {
        axiosRequestConfig.headers["start"] = Date.now();
        return axiosRequestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (axiosResponseConfig: AxiosResponse) => {
    const start = axiosResponseConfig.config.headers["start"];
    axiosResponseConfig.config.headers["end"] = Date.now();

    axiosResponseConfig.config.headers["duration"] = Date.now() - start;
    return axiosResponseConfig;
  },
  (error) => {
    error.config.headers["end"] = Date.now();

    error.config.headers["duration"] =
      error.config.headers["end"] - error.config.headers["start"];
    return Promise.reject(error);
  }
);


async function updateReportOnSuccess(userID: string, checkID: string, success: AxiosResponse) {
    console.log("Success >>>");

    const { userReport } = await reportController.getReport(checkID, userID);
    const oldReport = userReport[0];

    const newReport = {
        status: "available",
        availability: Math.round((oldReport.uptime) / ((oldReport.downtime) + (oldReport.uptime) + 1) * 100),
        // availability: Math.round((oldReport?.uptime) ?? 0 / ((oldReport?.downtime?? 0) + (oldReport?.uptime ?? 0) + 1) * 100)),
        uptime: oldReport.uptime + parseInt(success.config.headers["duration"]),
        responseTime: parseInt(success.config.headers["duration"]),
        history: oldReport.history
    };

    newReport.history.push({
        status: "available",
        // availability: Math.round((oldReport.uptime / (oldReport.downtime + oldReport.uptime + 1) * 100)),
        availability: Math.round((oldReport.uptime / (oldReport.downtime + oldReport.uptime + 1) * 100)),
        timestamp: new Date,
    });
    await reportController.updateReport(newReport, checkID, userID);
}

async function updateReportOnFail(userID: string, checkID: string, fail: any) {
    console.log("FAIL >>>");
    const { userReport } = await reportController.getReport(checkID, userID);
    const oldReport = userReport[0];
    const check = await Check.findById(checkID) as CheckDocument; 
    const threshold  = check?.threshold

    const newReport = {
        status: fail.response ? "error" : "unavailable",
        downtime: oldReport.downtime + parseInt(fail.config.headers["duration"]),
        outages: fail.response ? ((oldReport.outages) + 1) : oldReport.outages,
        responseTime: parseInt(fail.config.headers["duration"]),
        history: oldReport.history
    } ;

    newReport.history.push({
        status: fail.response ? "error" : "unavailable",
        availability: Math.round((oldReport.uptime / (oldReport.downtime + oldReport.uptime + 1) * 100)),
        timestamp: new Date
    });

    if ((newReport.outages) % threshold === 0) {
        // Notify User by mail
        const user = await userController.userExists(userID);
        const message = `Dear ${user.username},\n Your Service with url: ${fail.config.url} Failed`;
        await sendEmail(user.email, "Failed Service", message);
    }

    await reportController.updateReport(newReport, checkID, userID);
}

async function testURL(urlCheck: CheckDocument) {
    const options: AxiosRequestConfig = {
        headers: { ...urlCheck.httpHeaders },
        method: `get`,
        timeout: urlCheck.timeout,
        httpsAgent: new https.Agent({
            rejectUnauthorized: urlCheck.ignoreSSL
        })
    };

    let url = urlCheck.port ?
        `${urlCheck.protocol}//${urlCheck.url}:${urlCheck.port}` :
        `${urlCheck.protocol}//${urlCheck.url}`;

    if (urlCheck.path) {
        url += urlCheck.path;
    }

    if (urlCheck.authentication) {
        options.auth = {
            username: urlCheck.authentication.username,
            password: urlCheck.authentication.password
        };
    }

    console.log("Checking .. ", url);

    try {
        const resp = await axiosInstance.get(url, options);
        // Update Report with Successful entry
        console.log(resp.config.headers["duration"]);
        await updateReportOnSuccess(urlCheck.userID, urlCheck._id, resp);
    } catch (error) {
        // Update Report with Failure Entry
        console.log(error.config.headers["duration"]);
        await updateReportOnFail(urlCheck.userID, urlCheck._id, error);
    }
}

export { testURL };
