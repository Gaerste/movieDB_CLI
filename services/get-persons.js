import { createRequire } from "module";
const require = createRequire(import.meta.url);
const https = require("node:https");
const dotenv = require("dotenv");
import {
  spinnerHandlerOnSuccess,
  spinnerHandlerOnError,
} from "../utils/spinners/spinnersHandler.js";
import { render } from "./../render/renderPopularPersons.js";
import { getRequestOptions } from "./getRequestOptions.js";
import { savePersonFile } from "./fsPersonMethods.js";

//Env configuration
dotenv.config();

export function getPersons(path, commandOptions, spinner) {
  const requestOptions = getRequestOptions(`popularPersons`, commandOptions.page);
  let responseData = "";
  const { popular, page, save, local } = commandOptions;

  const req = https.request(requestOptions, (res) => {
    res.on("data", (chunk) => {
      responseData += chunk;
    });

    res.on("end", () => {
      // save local
      if (save) {
        savePersonFile(
          `/persons/PopularPersons/popularPersons-page${commandOptions.page}.json`,
          JSON.parse(responseData), spinner
        );
      } else if (local) {
        console.log("Get info from file");
      } else {
        const popularPersonData = JSON.parse(responseData);
        render(popularPersonData);
        spinnerHandlerOnSuccess(spinner, "Popular Persons data loaded");
      }
    });
  });

  req.on("error", (err) => {
    console.error(err);
    spinnerHandlerOnError(spinner, err.message);
  });

  req.end();
}
