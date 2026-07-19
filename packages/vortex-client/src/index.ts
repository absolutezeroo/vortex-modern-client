import {Logger} from '@core/utils/Logger';
import {VortexLoadingScreen} from './VortexLoadingScreen';
import {VortexApp} from './App';

const log = Logger.getLogger('VortexApp');

// Show loading screen immediately
const loadingScreen = new VortexLoadingScreen();

const app = new VortexApp(loadingScreen);

app.init().catch((error) => log.error('Failed to initialize application:', error));
