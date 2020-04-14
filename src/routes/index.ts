import express from 'express';
import { createAgent } from 'notionapi-agent';
import _ from 'lodash';

const { transform } = require('markmap-lib/dist/transform.common');

const { NOTION_TOKEN } = process.env;

export const router = express.Router();

const notion = createAgent({
  token: NOTION_TOKEN
});

const dashIDLen = '0eeee000-cccc-bbbb-aaaa-123450000000'.length;
const noDashIDLen = '0eeee000ccccbbbbaaaa123450000000'.length;

function isValidDashID(str: string) {
  if (str.length !== dashIDLen) {
    return false;
  }

  if (str.indexOf('-') === -1) {
    return false;
  }

  return true;
}

function toDashID(str: string) {
  if (isValidDashID(str)) {
    return str;
  }

  const s = str.replace(/-/g, '');

  if (s.length !== noDashIDLen) {
    return str;
  }

  const res = str.substring(0, 8) + '-' + str.substring(8, 12) + '-' + str.substring(12, 16) + '-' + str.substring(16, 20) + '-' + str.substring(20);
  return res
}


router.get('/', async (_req, res) => {
  res.render('help');
});

router.get('/:blockid([0-9a-f]{32})', async (req, res) => {
  const blockId = toDashID(req.params.blockid);
  try {
    const result = await notion.loadPageChunk({
      pageId: blockId,
      limit: 10,
      cursor: { stack: [] },
      chunkNumber: 0,
      verticalColumns: false
    });
    const sourceBlock = result.recordMap.block[blockId];
    if (!sourceBlock) return res.send('invalid blockId ' + req.params.blockid);
    const text = (sourceBlock.value as any).properties.title[0][0];
    const text2 = text.replace(/\n/g, '\\n');
    console.log(text2);
    res.render('index', { graphDefinition: text2 });
  } catch (e) {
    return res.send(e.message);
  }
});

router.get('/mermaid/:blockid([0-9a-f]{32})', async (req, res) => {
  const blockId = toDashID(req.params.blockid);
  try {
    const result = await notion.loadPageChunk({
      pageId: blockId,
      limit: 10,
      cursor: { stack: [] },
      chunkNumber: 0,
      verticalColumns: false
    });
    const sourceBlock = result.recordMap.block[blockId];
    if (!sourceBlock) return res.send('invalid blockId ' + req.params.blockid);
    const text = (sourceBlock.value as any).properties.title[0][0];
    const text2 = text.replace(/\n/g, '\\n');
    console.log(text2);
    res.render('index', { graphDefinition: text2 });
  } catch (e) {
    return res.send(e.message);
  }
});

router.get('/markmap/:blockid([0-9a-f]{32})', async (req, res) => {
  const blockId = toDashID(req.params.blockid);
  try {
    const result = await notion.loadPageChunk({
      pageId: blockId,
      limit: 10,
      cursor: { stack: [] },
      chunkNumber: 0,
      verticalColumns: false
    });
    const sourceBlock = result.recordMap.block[blockId];
    if (!sourceBlock) return res.send('invalid blockId ' + req.params.blockid);
    const text = (sourceBlock.value as any).properties.title[0][0];
    res.render('markmap', { markmapped: JSON.stringify(transform(text)) });
  } catch (e) {
    return res.send(e.message);
  }
});
