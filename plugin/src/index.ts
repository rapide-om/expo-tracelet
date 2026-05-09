import { type ConfigPlugin, createRunOncePlugin } from 'expo/config-plugins';

import { type ExpoTraceletPluginProps } from './types';
import { withTraceletAndroid } from './withTraceletAndroid';
import { withTraceletIos } from './withTraceletIos';

// `require` so we don't pull dist-typings into the build, and so we always
// read the version that's actually installed alongside the plugin.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg: { name: string; version: string } = require('../../package.json');

const withExpoTracelet: ConfigPlugin<ExpoTraceletPluginProps | void> = (config, props) => {
    config = withTraceletIos(config, props);
    config = withTraceletAndroid(config, props);
    return config;
};

// `createRunOncePlugin` ensures the plugin is applied at most once per
// prebuild, even if multiple dependencies happen to register it. The version
// guard also prevents two copies of the package at different versions from
// silently double-injecting permissions / Info.plist entries.
export default createRunOncePlugin(withExpoTracelet, pkg.name, pkg.version);

export type { ExpoTraceletPluginProps } from './types';
