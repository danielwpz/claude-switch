/**
 * Manage action
 * Main dispatcher for manage menu options
 */

import { Config } from '../config/schema.js';
import { showManageMenu } from '../menus/manage-menu.js';
import { listConfigurations } from './list.js';
import { editConfiguration } from './edit.js';
import { deleteConfiguration } from './delete.js';
import { debug } from '../utils/logger.js';

/**
 * Manage configurations - dispatcher
 */
export async function manageConfigurations(config: Config): Promise<void> {
  debug('Starting manage action');

  const action = await showManageMenu();

  switch (action) {
    case 'list':
      await listConfigurations(config);
      break;
    case 'edit':
      await editConfiguration(config);
      break;
    case 'delete':
      await deleteConfiguration(config);
      break;
    case null:
      debug('Manage cancelled');
      process.exit(0);
      break;
  }
}
