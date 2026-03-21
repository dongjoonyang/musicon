import { ExpoConfig, ConfigContext } from 'expo/config';
import appJson from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const expoConfig = appJson.expo as ExpoConfig;

  return {
    ...expoConfig,
    android: {
      ...expoConfig.android,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    },
  };
};
