import { strict as assert } from 'node:assert';
import { hasPermission } from '../../src/auth/permissions';

assert.equal(hasPermission('ADMIN', 'analytics:view'), true);
assert.equal(hasPermission('REVIEWER', 'analytics:view'), false);
assert.equal(hasPermission('REVIEWER', 'documents:view'), true);
