import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeVaultStatus } from '../lib/credential-vault.mjs';

test('mergeVaultStatus attaches hasVault and vaultSavedAt case-insensitively', () => {
  const accounts = [
    { email: 'Alice@Example.com', isActive: true },
    { email: 'bob@example.com', isActive: false }
  ];
  const vaultItems = [
    { email: 'alice@example.com', savedAt: 1700000000000, blobSize: 643 }
  ];
  const merged = mergeVaultStatus(accounts, vaultItems);
  assert.equal(merged[0].hasVault, true);
  assert.equal(merged[0].vaultSavedAt, 1700000000000);
  assert.equal(merged[1].hasVault, false);
  assert.equal(merged[1].vaultSavedAt, null);
});
