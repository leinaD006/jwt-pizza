import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";
import { check, fail, group, sleep } from "k6";
import http from "k6/http";

export const options = {
  cloud: {
    distribution: {
      "amazon:us:ashburn": {
        loadZone: "amazon:us:ashburn",
        percent: 100,
      },
    },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 5, duration: "30s" },
        { target: 15, duration: "1m" },
        { target: 10, duration: "30s" },
        { target: 0, duration: "30s" },
      ],
      gracefulRampDown: "30s",
      exec: "scenario_1",
    },
  },
};

export function scenario_1() {
  let response;
  const vars = {};

  group("Login and order - https://pizza.danielkingery.click/", function () {
    // Homepage
    response = http.get("https://pizza.danielkingery.click/", {
      headers: {
        Host: "pizza.danielkingery.click",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "If-Modified-Since": "Sat, 02 Nov 2024 03:12:53 GMT",
        "If-None-Match": '"e3b5e659909040627cf156a74b2d7a5c"',
        Priority: "u=0, i",
        TE: "trailers",
      },
    });
    sleep(19.4);

    // Login
    response = http.put(
      "https://pizza-service.danielkingery.click/api/auth",
      '{"email":"d@jwt.com","password":"diner"}',
      {
        headers: {
          Host: "pizza-service.danielkingery.click",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Content-Type": "application/json",
          Origin: "https://pizza.danielkingery.click",
          Connection: "keep-alive",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          Priority: "u=0",
          TE: "trailers",
        },
      }
    );
    if (
      !check(response, {
        "status equals 200": (response) => response.status.toString() === "200",
      })
    ) {
      console.log(response.body);
      fail("Login was *not* 200");
    }
    vars["token1"] = jsonpath.query(response.json(), "$.token")[0];

    sleep(3.2);

    // Get menu
    response = http.get(
      "https://pizza-service.danielkingery.click/api/order/menu",
      {
        headers: {
          Host: "pizza-service.danielkingery.click",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Content-Type": "application/json",
          Authorization: `Bearer ${vars["token1"]}`,
          Origin: "https://pizza.danielkingery.click",
          Connection: "keep-alive",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          Priority: "u=0",
          TE: "trailers",
        },
      }
    );

    // Get franchise
    response = http.get(
      "https://pizza-service.danielkingery.click/api/franchise",
      {
        headers: {
          Host: "pizza-service.danielkingery.click",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Content-Type": "application/json",
          Authorization: `Bearer ${vars["token1"]}`,
          Origin: "https://pizza.danielkingery.click",
          Connection: "keep-alive",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          Priority: "u=4",
          TE: "trailers",
        },
      }
    );
    sleep(5);

    // Purchase pizza
    response = http.post(
      "https://pizza-service.danielkingery.click/api/order",
      '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
      {
        headers: {
          Host: "pizza-service.danielkingery.click",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Content-Type": "application/json",
          Authorization: `Bearer ${vars["token1"]}`,
          Origin: "https://pizza.danielkingery.click",
          Connection: "keep-alive",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          Priority: "u=0",
          TE: "trailers",
        },
      }
    );
    if (
      !check(response, {
        "status equals 200": (response) => response.status.toString() === "200",
      })
    ) {
      console.log(response.body);
      fail("Purchase was *not* 200");
    }
    vars["jwt_token"] = jsonpath.query(response.json(), "$.jwt")[0];

    sleep(1.5);

    // Verify pizza
    response = http.post(
      "https://pizza-factory.cs329.click/api/order/verify",
      `{"jwt": "${vars["jwt_token"]}"}`,
      {
        headers: {
          Host: "pizza-factory.cs329.click",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Content-Type": "application/json",
          Authorization: `Bearer ${vars["token1"]}`,
          Origin: "https://pizza.danielkingery.click",
          Connection: "keep-alive",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "cross-site",
          Priority: "u=0",
          TE: "trailers",
        },
      }
    );
  });
}
