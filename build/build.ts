import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';
import { type BuildFormat } from './configs/vite.common';

const formats: BuildFormat[] = ['es', 'mjs', 'cjs', 'iife'];

async function executeBuild() {
  fs.rmSync('dist', { force: true, recursive: true });

  // Build types
  execFileSync(
    'vue-tsc',
    [
      '--declaration',
      '--emitDeclarationOnly',
      '--outDir',
      'dist/types',
      '-p',
      'tsconfig.build.json',
    ],
    { stdio: 'inherit' },
  );

  const declarationEntry = 'dist/types/index.d.ts';
  fs.writeFileSync(
    declarationEntry,
    fs
      .readFileSync(declarationEntry, 'utf8')
      .replace("import './styles/index.css';\n", ''),
  );

  const declarations = await rollup({
    input: declarationEntry,
    plugins: [dts()],
  });
  await declarations.write({
    file: 'dist/types/index.d.mts',
    format: 'es',
  });
  await declarations.close();
  const declarationSource = fs.readFileSync('dist/types/index.d.mts', 'utf8');
  fs.writeFileSync('dist/types/index.d.ts', declarationSource);
  fs.writeFileSync('dist/types/index.d.cts', declarationSource);

  // Build lib with formats
  for (const format of formats) {
    execFileSync(
      'vite',
      ['build', '--config', `./build/configs/vite.${format}.ts`],
      { stdio: 'inherit' },
    );
  }

  // Copy css to root
  fs.copyFileSync('dist/es/style.css', 'dist/style.css');
  fs.writeFileSync('dist/cjs/package.json', '{"type":"commonjs"}\n');
}

executeBuild();
