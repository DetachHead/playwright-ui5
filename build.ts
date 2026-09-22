import { type Plugin, build } from 'esbuild'

const name = 'ui5'

/**
 * the ui5 typescript API is designed to work with esm import syntax, for example:
 * ```ts
 * import UI5Element from 'sap/ui/core/Element'
 * ```
 * however this doesn't work at runtime. in a normal ui5 application this isn't an issue because it gets compiled
 * into something that works at runtime, but since we aren't creating a ui5 application and therefore arent using
 * the ui5 tooling, we need to create a custom esbuild plugin to do it.
 */
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
