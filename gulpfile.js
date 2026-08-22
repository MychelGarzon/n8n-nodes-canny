const path = require('path');
const { src, dest, task, series } = require('gulp');

function buildIcons() {
    return src('nodes/**/*.{png,svg}').pipe(dest('dist/nodes'));
}

task('build:icons', series(buildIcons));