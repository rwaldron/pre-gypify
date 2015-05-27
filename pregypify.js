#!/usr/bin/env node

var fs = require('fs')

var gyp = require('gyp-reader');

gyp('./binding.gyp', function (err, data) {
	var targetName = data.targets[0].target_name;

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
	fs.writeFileSync('./binding.gyp', JSON.stringify(data, null, '  '));


	var pack = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
	if (!pack.binary) {
		pack.binary = {
		    "module_name": targetName,
		    "module_path": "out/" + process.config.target_defaults.default_configuration + "/",
		    "host": "example.com",
		};
	}

	pack.binary.package_name = "{module_name}-v{version}-{node_abi}-{platform}-{arch}-{configuration}.tar.gz";

	fs.writeFileSync('package.json', JSON.stringify(pack, null, '  '));
});