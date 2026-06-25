import { type Plugin, build } from 'esbuild'

const name = 'ui5'

const ui5Plugin = (): Plugin => ({
    name,
    setup: (pluginBuild) => {
        pluginBuild.onResolve({ filter: /^sap\//u }, ({ path }) => ({
            path,
            namespace: name,
        }))
        pluginBuild.onLoad({ filter: /.*/u, namespace: name }, ({ path }) => ({
            contents: `export default sap.ui.require(${JSON.stringify(path)});`,
            loader: 'js',
        }))
    },
})

;(async () => {
    await build({
        plugins: [ui5Plugin()],
        entryPoints: ['src/browser/css.ts', 'src/browser/xpath.ts'],
        bundle: true,
        define: { global: 'window' },
        format: 'cjs',
        outdir: 'dist/browser',
    })
})()
