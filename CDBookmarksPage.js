import { test, expect } from '@playwright/test';
const classes = require('multiple-extend');
const Bookmarks = require('./Components/Bookmarks');

const Sort = {
  Oldest: 'Oldest First',
  Newest: 'Newest First',
  AZ: 'Title A-Z',
  ZA: 'Title Z-A',
};

class CDBookmarksPage extends classes(Bookmarks) {
  constructor(page, context) {
    super(page, context);
  }
}
export default CDBookmarksPage;
