import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { joballaAxios } from "@/lib/http/axios-instance";



let installed = false;

let logSeq = 0;



const LOGGED_PATH_FRAGMENTS = ["/worker/", "/employer/departments", "/files/verification-doc"];



type LoggedRequestConfig = InternalAxiosRequestConfig & { _workerLogId?: number };



function shouldLog(url: string | undefined): boolean {

  if (!url) return false;

  return LOGGED_PATH_FRAGMENTS.some((fragment) => url.includes(fragment));

}



function formatUrl(url: string | undefined): string {

  if (!url) return "";

  try {

    return url.startsWith("http") ? new URL(url).pathname + new URL(url).search : url;

  } catch {

    return url;

  }

}



export function installWorkerApiLogger() {

  if (installed || typeof window === "undefined") return;

  installed = true;



  joballaAxios.interceptors.request.use((config) => {

    if (!shouldLog(config.url)) return config;

    const id = ++logSeq;

    const logged = config as LoggedRequestConfig;

    logged._workerLogId = id;

    const method = (config.method ?? "get").toUpperCase();

    const url = formatUrl(config.url);

    console.groupCollapsed(`[worker api #${id}] ${method} ${url}`);

    console.log("→ request", {

      id,

      at: new Date().toISOString(),

      method,

      url,

      params: config.params ?? null,

      body: config.data ?? null,

    });

    return config;

  });



  joballaAxios.interceptors.response.use(

    (response: AxiosResponse) => {

      const config = response.config as LoggedRequestConfig;

      const url = config?.url;

      if (!shouldLog(url)) return response;

      const id = config._workerLogId ?? "?";

      console.log("← response", {

        id,

        at: new Date().toISOString(),

        method: (config.method ?? "get").toUpperCase(),

        url: formatUrl(url),

        status: response.status,

        data: response.data,

      });

      console.groupEnd();

      return response;

    },

    (error: AxiosError) => {

      const config = error.config as LoggedRequestConfig | undefined;

      if (config && shouldLog(config.url)) {

        const id = config._workerLogId ?? "?";

        console.log("← response (error)", {

          id,

          at: new Date().toISOString(),

          method: (config.method ?? "get").toUpperCase(),

          url: formatUrl(config.url),

          status: error.response?.status ?? 0,

          data: error.response?.data ?? null,

          message: error.message,

        });

        console.groupEnd();

      }

      return Promise.reject(error);

    },

  );

}

