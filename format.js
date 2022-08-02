const fs = require("fs");
const exportToCsv = require("export-to-csv");

const ltrim = (str) => (!str ? str : str.replace(/^\s+/g, ""));
const mtrim = (str) => str.replace(/ +(?= )/g, "");
const rtrim = (str) => (!str ? str : str.replace(/\s+$/g, ""));
const trim = (str) => ltrim(mtrim(rtrim(str)));

const csvOptions = {
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
};

const format = (data, inputNames) => {
  const formattedInputNames = inputNames.map((name) => trim(name));
  const nameSkillDic = {};

  formattedInputNames.map(
    (name) =>
      (nameSkillDic[name] = {
        skills: [],
        impacts: {},
        counts: {},
        sums: {},
      })
  );


  for (let name in nameSkillDic) {
    data.map((object) => {
      if (name === trim(object.name) && object.impact > 0) {
        nameSkillDic[name].skills.push(object.challengeSkill);
        nameSkillDic[name].impacts[object.challengeSkill] =
          nameSkillDic[name].impacts[object.challengeSkill] + object.impact ||
          object.impact;
      }
    });
    nameSkillDic[name].counts = nameSkillDic[name].skills.reduce(
      (acc, curr) => ((acc[curr] = (acc[curr] || 0) + 1), acc),
      {}
    );
    for (let key in nameSkillDic[name].impacts) {
      nameSkillDic[name].sums[key] =
        (nameSkillDic[name].impacts[key] / nameSkillDic[name].counts[key]).toFixed(2)
    }
  }

  const output = [];

  for (let key in nameSkillDic) {
    output.push({
      name: key,
      communicationImpact: nameSkillDic[key].impacts["Communication"],
      criticalThinkingImpact: nameSkillDic[key].impacts["Critical Thinking"],
      creativityImpact: nameSkillDic[key].impacts["Creativity"],
      problemSolvingImpact: nameSkillDic[key].impacts["Problem Solving"],
      leadershipImpact: nameSkillDic[key].impacts["Leadership"],
      communicationQuestsImpactGreaterNull:
        nameSkillDic[key].counts["Communication"],
      criticalThinkingQuestsImpactGreaterNull:
        nameSkillDic[key].counts["Critical Thinking"],
      creativityQuestsImpactGreaterNull: nameSkillDic[key].counts["Creativity"],
      problemSolvingQuestsImpactGreaterNull:
        nameSkillDic[key].counts["Problem Solving"],
      leadershipQuestsImpactGreaterNull: nameSkillDic[key].counts["Leadership"],
      communicationScore: nameSkillDic[key].sums["Communication"],
      criticalThinkingScore: nameSkillDic[key].sums["Critical Thinking"],
      creativityScore: nameSkillDic[key].sums["Creativity"],
      problemSolvingScore: nameSkillDic[key].sums["Problem Solving"],
      leadershipScore: nameSkillDic[key].sums["Leadership"],
    });
  }

  const csvExporter = new exportToCsv.ExportToCsv(csvOptions);
  const csvData = csvExporter.generateCsv(output, true);
  fs.writeFileSync("data.csv", csvData);
};

exports.format = format;
