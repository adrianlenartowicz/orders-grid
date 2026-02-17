import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise'

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
