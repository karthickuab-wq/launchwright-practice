// The app's own name, read from app.json so there is one place to change it.
import appJson from '../app.json';

export const appName: string = appJson.expo.name;
