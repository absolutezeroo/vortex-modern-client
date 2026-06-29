import {HeliumLoadingScreen} from './HeliumLoadingScreen';
import {HeliumApp} from './App';

// Show loading screen immediately
const loadingScreen = new HeliumLoadingScreen();

const app = new HeliumApp(loadingScreen);

app.init().catch(console.error);
