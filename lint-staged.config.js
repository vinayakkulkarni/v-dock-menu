module.exports = {
  'src/**/*.scss': ['stylelint src/**/*.scss --fix', 'git add'],
  'src/**/*.vue': ['eslint src/**/*.vue --fix', 'git add'],
};
