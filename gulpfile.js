const gulp = require('gulp');
const ts = require('gulp-typescript');
const nodemon = require('gulp-nodemon');

var watchPattern = 'src/**/*.ts';
var dest = 'build/';

const tsProject = ts.createProject('tsconfig.json');

gulp.task('build', () => {
  const tsResult = tsProject.src()
  .pipe(tsProject());
  return tsResult.js.pipe(gulp.dest(dest));
});

gulp.task('watch', ['build'], () => {
  gulp.watch(watchPattern, ['build']);
});

gulp.task('start', ['build'], function() {
  let stream = nodemon({
    script: 'build/index.js',
    ext: 'ts',
    ignore: [
      'node_modules'
    ],
    task: 'build'
  }); 

  stream.on('restart', () => {
    console.log('Restarted.');
  });
  stream.on('crash', () => {
    console.error('Application has crashed!\n')
    stream.emit('restart', 10)  // restart the server in 10 seconds  });
  });
});

gulp.task('default', ['build']);
