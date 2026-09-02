import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const portal = await readFile(
  new URL('../firmware/components/dv_portal/dv_portal.c', import.meta.url),
  'utf8',
);

test('Bambu settings are validated before changing the active source', () => {
  const validation = portal.indexOf('Choose a printer and enter its LAN access code');
  const sourceSave = portal.indexOf('dc_source_set(source)');
  assert.notEqual(validation, -1);
  assert.notEqual(sourceSave, -1);
  assert.ok(validation < sourceSave);
});

test('saving Bambu settings starts the client without a reboot', () => {
  assert.match(portal, /if \(source == DC_SRC_BAMBU\)[\s\S]*dc_bambu_start\(\)/);
  assert.match(portal, /Settings saved\. Connecting to Bambu now\./);
});

test('leaving Bambu stops its MQTT client without changing Klipper startup', () => {
  assert.match(portal, /else \{\s*dc_bambu_stop\(\);\s*\}/);
  assert.match(portal, /Settings saved\. Restart to start the Klipper source\./);
});
