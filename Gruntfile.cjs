module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    // Build from source.
    shell: {
      clean: {
        command: "rimraf dist",
      },

      buildClient: {
        command: "vite build",
      },
      buildServer: {
        command:
          "tsc --project tsconfig.server.json && tsc-alias -p tsconfig.server.json",
      },
    },

    // Copy worker files (Backend attack methods and utilities)
    copy: {
      static_workers: {
        expand: true,
        cwd: "server/workers/",
        src: "*",
        dest: "dist/workers/",
      },
      static_utils: {
        expand: true,
        cwd: "server/utils/",
        src: "*",
        dest: "dist/utils/",
      },
    },

    // Run concurrent tasks
    concurrent: {
      build: ["shell:buildClient", "shell:buildServer"],
      copy_static: ["copy:static_workers", "copy:static_utils"],
    },
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-shell");
  grunt.loadNpmTasks("grunt-concurrent");

  // Run our tasks
  grunt.registerTask("build", [
    "shell:clean",
    "concurrent:build",
    "concurrent:copy_static",
  ]);

  grunt.registerTask("build_server", ["shell:buildServer"]);
  grunt.registerTask("build_client", ["shell:buildClient"]);
};
