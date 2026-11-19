#!/usr/bin/env node
// The Launchwright guard's Claude Code hook in this project (PreToolUse, wired in ../settings.json),
// for sessions that load a repo's hooks. It only passes Claude's tool call to the guard's logic in
// launchwright/guard/guard-lib.mjs and turns a refusal into a block: exit code 2, with the reason
// on standard error. Otherwise it exits 0 and prints nothing.
// It never answers "allow" and never changes a permission setting: it only ever blocks.
// Outside a Launchwright project (no launchwright/kit.json) the logic always answers null, so the
// hook does nothing. If the logic is missing, the hook fails, and onFailure "block" in
// ../settings.json blocks the call. A kit update replaces this file; agents never edit it.

import { readFileSync } from 'node:fs';
import { guardCall } from '../../launchwright/guard/guard-lib.mjs';

const SHELL = ['Bash', 'PowerShell', 'Monitor'];
const EDIT = ['Edit', 'Write', 'MultiEdit', 'NotebookEdit'];
const READ = ['Read', 'Grep'];

let input = null;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  input = null;
}
const ok = input && typeof input === 'object' && !Array.isArray(input);
const tool = ok ? input.tool_name : undefined;
const t = ok && input.tool_input && typeof input.tool_input === 'object' ? input.tool_input : {};
const edits = tool === 'MultiEdit' ? t.edits : tool === 'Edit' ? [{ old_string: t.old_string, new_string: t.new_string, replace_all: t.replace_all }] : undefined;

const reason = guardCall({
  kind: !ok ? 'unreadable' : SHELL.includes(tool) ? 'shell' : EDIT.includes(tool) ? 'edit' : READ.includes(tool) ? 'read' : String(tool).startsWith('mcp__') ? 'mcp' : 'other',
  command: t.command,
  requireCommand: tool !== 'Monitor',
  powershell: tool === 'PowerShell',
  filePath: t.file_path ?? t.notebook_path ?? t.path,
  content: tool === 'Write' ? t.content : undefined,
  edits,
  glob: t.glob,
  tool,
  cwd: ok && typeof input.cwd === 'string' ? input.cwd : process.cwd(),
  projectDir: process.env.CLAUDE_PROJECT_DIR,
});
if (reason) {
  process.stderr.write(`Blocked by the Launchwright guard: ${reason}\n`);
  process.exit(2);
}
process.exit(0);
