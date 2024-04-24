import { execSync } from 'child_process'
import isCI from 'is-ci'

export default () => {
    if (!isCI) {
        // prevent tests running on outdated code when running locally, since node src reads compiled browser code
        execSync('npm run build')
    }
}
