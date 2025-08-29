// Custom Jest transformer: remove diretiva 'use server' antes de delegar ao ts-jest.
// Compatível com ts-jest >=29 (usa export default). Simples wrap sem cache extra.

const tsJestTransformer = require('ts-jest').default.createTransformer({
  tsconfig: 'tsconfig.json',
});

module.exports = {
  process(src, filename, jestConfig, transformOptions) {
    let code = src;
    if (/\.tsx?$/i.test(filename)) {
      code = code.replace(/^(['\"])use server\1;?\r?\n?/, '');
    }
    return tsJestTransformer.process(code, filename, jestConfig, transformOptions);
  },
};
