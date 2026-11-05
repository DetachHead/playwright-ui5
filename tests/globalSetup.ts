import { execSync } from "child_process";

import isCI from "is-ci";

export default () => {
  if (!isCI) {
    // prevent tests running on outdated code when running locally, since node src reads compiled browser code
    execSync("pnpm run build", {
      env: {
        ...process.env,
        // The shell emulator is required for the gg.cmd wrapper script called in the npm scripts to work on windows,
        // but it breaks on linux so in that case we need to use the real shell.
        pnpm_config_shell_emulator: (process.platform === "win32").toString(),
      },
    });
  }
};
