module.exports = function( grunt ){

	grunt.initConfig({

		"concat": {
			"dist": {
				"dest": "build/GeoJSONParser.js",
				"src": [
					"src/start.js",
					"src/GeoJSON-Helpers.js",
					"src/GeoJSON.js",
					"src/GeoJSON-Feature.js",
					"src/end.js"
				]
			},
			"options": {
				"seperator": ";"
			}
		},

		"pkg": grunt.file.readJSON("package.json"),

		"uglify": {
			"build": {
				"src": "build/GeoJSONParser.js",
				"dest": "build/GeoJSONParser.min.js"
			}
		},

		"watch": {
			"scripts": {
				"files": "src/**",
				"options": {
					"interrupt": true
				},
				"tasks": ["default"]
			}
		}

	});

	//Load in tasks
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");

	//Set up tasks
	grunt.registerTask( "default", ["concat"] );
	grunt.registerTask( "build", ["concat","uglify"] );

};