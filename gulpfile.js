const gulp = require('gulp');
const ts = require('gulp-typescript');
const nodemon = require("gulp-nodemon");
const ASSET_FILES = ['src/*.json', 'src/**/*.json'];

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

// put assets in dist folder for execution
gulp.task('assets', function() {
  return gulp.src(ASSET_FILES)
    .pipe(gulp.dest('dist'));
});

// transpile ts to js files
gulp.task('scripts', () => {
  const tsResult = tsProject.src()
    .pipe(tsProject());

  return tsResult.js
    .pipe(gulp.dest('dist'));
});

// watch if ts changes then re-compile
gulp.task('watch', ['scripts'], () => {
  gulp.watch('src/**/*.ts', ['scripts']);
});


gulp.task('default', ['assets', 'watch'], () => {
  /*
  var stream = nodemon({
      script: "dist/index.js",
      watch: "dist/",
      tasks: ["scripts"],
      env: { "DEBUG": "Application,Request,Response" },
      ignore: ['public/dist/']
  });

  return stream;
  */
});
