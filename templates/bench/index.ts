/*
 * Copyright (C) 2021  Aravinth Manivannan <realaravinth@batsense.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Bench, Submission, SubmissionProof } from "./types";
import ROUTES from "../api/v1/routes";
import genJsonPaylod from "../utils/genJsonPayload";
import isBlankString from "../utils/isBlankString";

export const index = () => {
  const FACTOR = 500000;

  const initSession = async () => {
    fetch(ROUTES.register);
  };

  const worker = new Worker("/bench.js");
  const res: Array<Bench> = [];
  const stats = document.getElementById("stats");
  const CAMPAIGN_ID = window.location.pathname.split("/")[3];
  let deviceName = "";

  const addResult = (perf: Bench) => {
    const row = document.createElement("tr");
    row.className = "data";
    const diff = document.createElement("td");
    diff.innerHTML = perf.difficulty.toString();
    const duration = document.createElement("td");
    duration.innerHTML = perf.duration.toString();

    row.appendChild(diff);
    row.appendChild(duration);

    stats.appendChild(row);

    res.push(perf);
  };

  const submitBench = async () => {
    const payload: Submission = {
      device_user_provided: deviceName,
      threads: window.navigator.hardwareConcurrency,
      device_software_recognised: window.navigator.userAgent,

      benches: res,
    };

    const resp = await fetch(
      ROUTES.submitBench(CAMPAIGN_ID),
      genJsonPaylod(payload)
    );
    if (resp.status == 200) {
      const data: SubmissionProof = await resp.json();
      const element = document.createElement("div");
      const token = document.createElement("b");
      token.innerText = "User Agent: ";
      const tokenText = document.createTextNode(`${data.token}`);

      const proof = document.createElement("b");
      proof.innerText = "Proof: ";
      const proofText = document.createTextNode(`${data.proof}`);

      element.appendChild(token);
      element.appendChild(tokenText);
      element.appendChild(document.createElement("br"));
      element.appendChild(proof);
      element.appendChild(proofText);
      document.getElementById("submission-proof").appendChild(element);
    }
  };

  const addDeviceInfo = () => {
    const INFO = {
      threads: window.navigator.hardwareConcurrency,
      oscup: window.navigator.userAgent,
    };

    console.log(res);
    console.log(INFO);

    const element = document.createElement("div");
    const ua = document.createElement("b");
    ua.innerText = "User Agent: ";
    const os = document.createTextNode(`${INFO.oscup}`);

    const threads = document.createElement("b");
    threads.innerText = "Hardware concurrency: ";
    const threadsText = document.createTextNode(`${INFO.threads}`);

    element.appendChild(ua);
    element.appendChild(os);
    element.appendChild(document.createElement("br"));
    element.appendChild(threads);
    element.appendChild(threadsText);

    document.getElementById("device-info").appendChild(element);
  };

  const finished = async () => {
    await submitBench();
    const s = document.getElementById("status");
    s.innerHTML = "Benchmark finished";
  };

  const run = async (e: Event) => {
    e.preventDefault();
    const deveceNameElement = <HTMLInputElement>document.getElementById("name");
    if (isBlankString(deveceNameElement.value, "Device Name", e)) {
      return;
    }

    deviceName = deveceNameElement.value;

    await initSession();

    document.getElementById("pre-bench").style.display = "none";
    document.getElementById("bench").style.display = "flex";

    const iterations = 9;

    const counterElement = document.getElementById("counter");
    counterElement.innerText = `${iterations} more to go`;

    worker.onmessage = async (event: MessageEvent) => {
      const data: Bench = event.data;
      addResult(data);
      if (res.length == iterations) {
        await finished();
        counterElement.innerText = "All Done!";
      } else {
        counterElement.innerText = `${iterations - res.length} more to go`;
      }
    };

    for (let i = 1; i <= iterations; i++) {
      const difficulty_factor = i * FACTOR;
      worker.postMessage(difficulty_factor);
    }

    addDeviceInfo();
  };

  document
    .getElementById("start")
    .addEventListener("click", async (e) => await run(e));
};