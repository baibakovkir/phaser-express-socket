import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../generated/protocol.js', import.meta.url);
const source = readFileSync(file, 'utf8');
const expected = 'import * as $protobuf from "protobufjs/minimal";';
if (!source.includes(expected)) throw new Error('Unexpected protobufjs generated import');
writeFileSync(file, source.replace(expected, 'import $protobuf from "protobufjs/minimal.js";'));
