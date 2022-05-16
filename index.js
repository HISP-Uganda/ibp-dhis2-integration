const { fromPairs, get } = require("lodash");
const cron = require("node-cron");
const { queryDHIS2, queryTorus, postDHIS2 } = require("./common");
const attributeMapping = require("./attribute-mapping.json");

const phases = {
  "Project Concept": "concept",

  "Project Profile": "profile",

  Prefeasibility: "prefeasibility",

  Feasibility: "feasibility",

  "Project Propsal": "proposal",

  Budgeting: "Budgeting",

  Implementation: "Implementation",

  "Ex-Post Evaluation": "Ex-Post Evaluation",
};

const process = async (code1, code2) => {
  try {
    const api = await queryTorus();
    const { data } = await api.get(code1);
    const { trackedEntityInstances } = await queryDHIS2(
      "trackedEntityInstances.json",
      {
        ouMode: "ALL",
        trackedEntityType: "YFOAuiimQNh",
        filter: `Ua2sjMzo6go:EQ:${code2}`,
      }
    );

    const torusLineAttributes = fromPairs(
      attributeMapping.map((a) => {
        if (a.id === "Oq0fqIhb9RQ") {
          return [a.id, get(data, a.displayName, 0) / 1_000_000_000];
        }

        if (a.id === "Fa3L6MarXZJ") {
          return [a.id, phases[get(data, a.displayName, "")] || ""];
        }
        return [a.id, get(data, a.displayName, "")];
      })
    );
    const instances = trackedEntityInstances.map((tei) => {
      let instanceAttributes = fromPairs(
        tei.attributes.map((a) => [a.attribute, a.value])
      );

      const mergedAttributes = {
        ...instanceAttributes,
        ...torusLineAttributes,
      };
      const attributes = Object.entries(mergedAttributes).map(
        ([attribute, value]) => {
          return {
            attribute,
            value,
          };
        }
      );
      return {
        ...tei,
        attributes,
      };
    });
    const response = await postDHIS2("trackedEntityInstances", {
      trackedEntityInstances: instances,
    });
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.log(error);
  }
};

cron.schedule("*/2 * * * *", async () => {
  // TODO query all mapped projects from ibp based on date last updated
  // TODO loop through all the projects getting their details and updating NDP accordingly
  await process("AGR3-00079", "AGR3-00054");
});
