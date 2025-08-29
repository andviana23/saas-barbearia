// Transformer para mapear 'use server' removendo diretiva e expondo para cobertura
// Simplista: remove a primeira linha se for exatamente '"use server"' ou `'use server'`.

module.exports = {
  process(src) {
    if (/use server/.test(src.split('\n')[0])) {
      const lines = src.split(/\n/);
      if (/['\"]use server['\"]/.test(lines[0])) {
        lines[0] = '// stripped use server for coverage';
        src = lines.join('\n');
      }
    }
    return { code: src };
  },
};
