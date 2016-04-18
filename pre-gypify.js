#!/usr/bin/env node

var fs = require("fs");
var opts = require("nomnom").parse();
var gyp = require("gyp-reader");

function hasDependency(pjson, moduleName) {
  if (typeof pjson.dependencies !== "undefined") {
    return !!pjson.dependencies[moduleName];
  }

  if (typeof pjson.devDependencies !== "undefined") {
    return !!pjson.devDependencies[moduleName];
  }

  return false;
}

var packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

if (typeof packageJson.binary !== "undefined" &&
    hasDependency(packageJson, "node-pre-gyp")) {


  // console.log(message);

  // The "binary" key is defined and the package.json includes
  // a dependency listing for node-pre-gyp, so it can be
  // assumed that the target module is providing its own
  // node-pre-gyp configuration and does not need the help
  // or interference of this tool.
  // process.exit(0);
}

gyp("./binding.gyp", function (err, data) {
  // setImmediate(function () {
    var targetName = data.targets.filter(function (target) {
      return !target.type;
    })[0].target_name;


    console.log("pre-gypify, targetName: ", targetName);

    if (!data.targets.some(function (target) {
      return target.target_name == "action_after_build"
    })) {
      console.error("adding action_after_build...");
      (data.targets || []).push({
        "target_name": "action_after_build",
        "type": "none",
        "dependencies": [ "<(module_name)" ],
        "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/<(module_name).node" ],
          "destination": "<(module_path)"
        }
        ]
      });
      console.error("writing binding.gyp...");
      console.log(JSON.stringify(data, null, '  '));
      fs.writeFileSync("./binding.gyp", JSON.stringify(data, null, '  '));
    }

console.log("process.config.target_defaults.default_configuration?", process.config.target_defaults.default_configuration);


    if (!packageJson.binary) {
      packageJson.binary = {};
    }

    Object.assign(packageJson.binary, {
      module_name: targetName,
      module_path: `out/${process.config.target_defaults.default_configuration}/`,
      host: "example.com",
    });

    packageJson.binary.package_name = opts.package_name || "{module_name}-v{version}.tar.gz";

    console.error("writing package.json...");
    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, "  "));
    console.error("kk");
  // });
});
