import type { Plugin } from 'vite';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import archiver from 'archiver';

interface IMISPathOptions {
    projectName: string
}

export function cloudPathRewrite({ projectName } : IMISPathOptions): Plugin {
    return {
    name: 'imis-path-rewrite',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html) {
      const prefix = `~/iPartSource/${projectName}.zip`;

      html = html.replace(
        /src="(\/[^"]+)"/g,
        `src="${prefix}$1"`
      );

      html = html.replace(
        /href="(\/[^"]+)"/g,
        `href="${prefix}$1"`
      );

      return html;
    },
    async closeBundle() {
      const outDir = resolve(process.cwd(), 'dist');
      const zipPath = resolve(outDir, `${projectName}.zip`);

      console.log(`\nZipping dist/ → ${projectName}.zip`);

      await new Promise<void>((resolve, reject) => {
        const output = createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
          console.log(`Created ${projectName}.zip (${archive.pointer()} bytes)`);
          resolve();
        });

        archive.on('error', reject);
        archive.pipe(output);

        // Add all files in dist/ except the zip itself
        archive.glob('**/*', {
          cwd: outDir,
          ignore: [`${projectName}.zip`],
        });

        archive.finalize();
      });
    },
  };
}