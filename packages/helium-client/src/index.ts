import {Logger} from '@core/utils/Logger';
import {HeliumLoadingScreen} from './HeliumLoadingScreen';
import {HeliumApp} from './App';

const log = Logger.getLogger('HeliumApp');

// Show loading screen immediately
const loadingScreen = new HeliumLoadingScreen();

const app = new HeliumApp(loadingScreen);

app.init().catch((error) => log.error('Failed to initialize application:', error));
