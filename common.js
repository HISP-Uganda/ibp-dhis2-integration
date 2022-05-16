const axios = require("axios");
const dotenv = require("dotenv");
const result = dotenv.config();

if (result.error) {
  throw result.error;
}
module.exports.getDHIS2Url1 = (uri) => {
  if (uri !== "") {
    try {
      const url = new URL(uri);
      const dataURL = url.pathname.split("/");
      const apiIndex = dataURL.indexOf("api");

      if (apiIndex !== -1) {
        return url.href;
      } else {
        if (dataURL[dataURL.length - 1] === "") {
          return url.href + "api";
        } else {
          return url.href + "/api";
        }
      }
    } catch (e) {
      console.log(e.message);
    }
  }
  return null;
};

module.exports.createDHIS2Auth = () => {
  const username = process.env.DHIS2_USER;
  const password = process.env.DHIS2_PASS;
  return { username, password };
};

module.exports.getDHIS2Url = () => {
  const uri = process.env.DHIS2_URL;
  return this.getDHIS2Url1(uri);
};

module.exports.queryDHIS2 = async (path, params) => {
  try {
    const baseUrl = this.getDHIS2Url();
    if (baseUrl) {
      const urlx = `${baseUrl}/${path}`;
      const { data } = await axios.get(urlx, {
        auth: this.createDHIS2Auth(),
        params,
      });
      return data;
    }
  } catch (e) {
    console.log(e);
    console.log(e.message);
  }
};

module.exports.postDHIS2 = async (path, postData, params) => {
  try {
    const baseUrl = this.getDHIS2Url();
    if (baseUrl) {
      const urlx = `${baseUrl}/${path}`;
      const { data } = await axios.post(urlx, postData, {
        auth: this.createDHIS2Auth(),
        params,
      });
      return data;
    }
  } catch (e) {
    console.log(e.message);
  }
};

module.exports.queryTorus = async () => {
  const options = {
    headers: { "content-type": "application/json" },
  };
  const { data } = await axios.post(
    "http://demo-api.torusline.com/api/v1/auth/login",
    JSON.stringify({
      username: "surik",
      password: "Qwerty1@",
    }),
    options
  );
  return axios.create({
    baseURL:
      "http://demo-api.torusline.com/api/v1/integrations/ndp/project-details/",
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      "content-type": "application/json",
      Accept: "application/json",
    },
  });
};
