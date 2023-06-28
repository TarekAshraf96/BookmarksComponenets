const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const CDBookmarksPage = require('../../Pages/CDBookmarksPage').default;
const Environment = require('../../Data/Environment.json');
const bookmarksAPIs = require('../../Apis/BookmarksAPIs');

const Sort = {
  Oldest: 'Oldest First',
  Newest: 'Newest First',
  AZ: 'Title A-Z',
  ZA: 'Title Z-A',
};

let cdPage;
let cdContext;
let browser;
let CDState;
let bookmarksPage;
const envURL = Environment.CDURL;

test.describe('Bookmarks component CD Tests', () => {
  test.beforeAll(async () => {
    // getting CD state to pass to the new browsers
    CDState = JSON.parse(fs.readFileSync('CDstate.json'));
  });

  test.beforeEach(async () => {
    // start browsers with the correct states for CD
    test.setTimeout(90000);
    browser = await chromium.launch({ args: ['--start-maximized'] });
    cdContext = await browser.newContext({ viewport: { width: 1366, height: 768 }, storageState: CDState });
    const allRootBookmarks = await bookmarksAPIs.getAllRootBookmarks(CDState);
    for (let i = 0; i < allRootBookmarks.length; i += 1) {
        await bookmarksAPIs.deleteBookmark(CDState,allRootBookmarks[i].Id);      
    }
    cdPage = await cdContext.newPage();
    bookmarksPage = new CDBookmarksPage(cdPage, cdContext);
  });

  test('Validate Empty Bookmark', async () => {
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);
    await expect.soft(bookmarksPage.emptyBookmarksMsg).toContainText('No bookmarks to display');
    await expect.soft(bookmarksPage.addBookmarkEmptyButton).toBeVisible();
    expect(await bookmarksPage.bookmarksDiv.screenshot()).toMatchSnapshot('EmptyBookmarks.png');
  });

  test('Validate Adding Folder', async () => {
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);
    const folderName = `Folder ${Math.floor(Math.random() * 100)}`;
    await bookmarksPage.createNewItem({ isFolder: true, name: folderName });
    await expect(bookmarksPage.listOfMainFolderNames.last()).toContainText(folderName);
  });

  test('Validate Adding Link inside Folder', async () => {
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);
    const folderName = 'Folder 1';
    const linkName = `Link inside ${folderName}`;
    const linkUrl = 'https://playwright.dev/docs/api/class-locator#locator-is-visible';
    await bookmarksPage.createNewItem({ isFolder: true, name: folderName });
    await bookmarksPage.createNewItem({
      isFolder: false, name: linkName, link: linkUrl, location: folderName,
    });
    await bookmarksPage.clickOnArrowFolder(folderName);
    expect(await bookmarksPage.linkIsVisibleAndCorrect(folderName, linkName, linkUrl)).toBeTruthy();
    expect(await bookmarksPage.bookmarksDiv.screenshot()).toMatchSnapshot('FolderHasOneLinkBookmarks.png');
  });

  test('Validate Empty Title show validation', async () => {
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);
    const folderName = '';
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getUserFolder`)),
      bookmarksPage.clickAddNewBookmark()
    ]);
    await bookmarksPage.chooseBookmarkType(true);
    await bookmarksPage.typeTitle(folderName);
    await bookmarksPage.submitButton.click()
    await expect(bookmarksPage.titleValidationMsg).toBeVisible();
    await expect(bookmarksPage.titleValidationMsg).toContainText('Title is required');
  });

  test('Validate Empty Link show validation', async () => {
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);
    const linkName = 'Link';
    const linkURL = '';
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getUserFolder`)),
      bookmarksPage.clickAddNewBookmark()
    ]);
    await bookmarksPage.chooseBookmarkType(false);
    await bookmarksPage.typeTitle(linkName);
    await bookmarksPage.typeLink(linkURL);
    await bookmarksPage.submitButton.click()
    await expect(bookmarksPage.linkValidationMsg).toBeVisible();
    await expect(bookmarksPage.linkValidationMsg).toContainText('Link is required');
  });

  test('Validate Edit Folder Name', async () => {
    const folderName1 = 'oldName';
    const folderName2 = 'newName';
    await bookmarksAPIs.addBookmark(CDState,1,folderName1); 
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);
    await bookmarksPage.editItemNameByIndex(await bookmarksPage.listOfMainFolderNames.count() - 1, { name: folderName2 });
    await expect(bookmarksPage.listOfMainFolderNames.last()).toContainText(folderName2);
  });

  test('Validate Main Sort', async () => {
    const folderName1 = 'Retesting';
    const folderName2 = 'Apple';
    const folderName3 = 'search';
    const folderName4 = 'Zoo';

    await bookmarksAPIs.addBookmark(CDState,1,folderName1); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName2); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName3); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName4); 

    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);

    expect(await bookmarksPage.listOfMainFolderNames.allInnerTexts()).toStrictEqual([folderName1, folderName2, folderName3, folderName4]);
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      bookmarksPage.sortMainBy(Sort.Newest)
    ]);
    expect(await bookmarksPage.listOfMainFolderNames.allInnerTexts()).toStrictEqual([folderName4, folderName3, folderName2, folderName1]);
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      bookmarksPage.sortMainBy(Sort.AZ)
    ]);
    expect(await bookmarksPage.listOfMainFolderNames.allInnerTexts()).toStrictEqual([folderName2, folderName1, folderName3, folderName4]);
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      bookmarksPage.sortMainBy(Sort.ZA)
    ]);
    expect(await bookmarksPage.listOfMainFolderNames.allInnerTexts()).toStrictEqual([folderName4, folderName3, folderName1, folderName2]);
  });

  test('Validate Sort inside Folder', async () => {
    const folderName = 'Folder 1';
    const linkName1 = 'Yacht Link';
    const linkName2 = 'Google Link';
    const subFolder = `SubFolder 1 inside${folderName}`;
    const linkUrl = 'https://playwright.dev/docs/api/class-locator#locator-is-visible';

    await bookmarksAPIs.addBookmark(CDState,1,folderName); 
    await bookmarksAPIs.addBookmark(CDState,0,linkName1,linkUrl,folderName); 
    await bookmarksAPIs.addBookmark(CDState,0,linkName2,linkUrl,folderName); 
    await bookmarksAPIs.addBookmark(CDState,1,subFolder,"",folderName); 

    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);

    await bookmarksPage.clickOnArrowFolder(folderName);

    expect(await bookmarksPage.listOfItemNamesInFirstFolder.allInnerTexts()).toStrictEqual([linkName1, linkName2, subFolder]);
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      bookmarksPage.sortFirstFolderBy(Sort.Newest)
    ]);
    expect(await bookmarksPage.listOfItemNamesInFirstFolder.allInnerTexts()).toStrictEqual([subFolder, linkName2, linkName1]);
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      bookmarksPage.sortFirstFolderBy(Sort.AZ)
    ]);
    expect(await bookmarksPage.listOfItemNamesInFirstFolder.allInnerTexts()).toStrictEqual([linkName2, subFolder, linkName1]);
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      bookmarksPage.sortFirstFolderBy(Sort.ZA)
    ]);
    expect(await bookmarksPage.listOfItemNamesInFirstFolder.allInnerTexts()).toStrictEqual([linkName1, subFolder, linkName2]);
  });

  test('Validate Delete Link', async () => {
    const linkName = 'Link 1';
    const linkUrl = 'https://playwright.dev/docs/api/class-locator#locator-is-visible';
    await bookmarksAPIs.addBookmark(CDState,0,linkName,linkUrl); 
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);
    
    await bookmarksPage.deleteFirstItem();

    await expect(bookmarksPage.addBookmarkEmptyButton).toBeVisible();
  });

  test('Validate Delete Folder', async () => {
    const folderName = 'Folder 1';
    await bookmarksAPIs.addBookmark(CDState,1,folderName); 
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);
    await bookmarksPage.deleteFirstItem();
    await expect(bookmarksPage.addBookmarkEmptyButton).toBeVisible();
  });

  test('Validate Search', async () => {
    const folderName1 = 'Folder One';
    const folderName2 = 'Folder Two';
    const folderName3 = 'Folder Three';
    await bookmarksAPIs.addBookmark(CDState,1,folderName1); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName2); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName3); 
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);

    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getSearchResults`)),
      bookmarksPage.searchFor('Folder T')
    ]);

    expect(await bookmarksPage.listOfMainFolderNames.allInnerTexts()).toStrictEqual([folderName2, folderName3]);
  });

  test('Validate Drag and Drop', async () => {
    const folderName1 = 'Folder One';
    const folderName2 = 'Folder Two';
    const folderName3 = 'Folder Three';

    await bookmarksAPIs.addBookmark(CDState,1,folderName1); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName2); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName3); 
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);
    // await bookmarksPage.listOfMainFolderNames.nth(2).dragTo(bookmarksPage.listOfMainFolderNames.nth(1));
    await bookmarksPage.dragDrop(folderName2, folderName1);
    // expect(await bookmarksPage.listOfMainFolderNames.allInnerTexts()).toStrictEqual([folderName1,folderName2,folderName3]);
    expect(await bookmarksPage.listOfMainFolderNames.allInnerTexts()).toStrictEqual([folderName1, folderName3]);
  });

  test('Validate Item Position After Editing', async () => {
    const folderName1 = 'Folder One';
    const folderName2 = 'Folder Two';
    const folderName3 = 'Folder Three';
    const folderName4 = 'Folder Four';
    const NewFolderOneName = 'New Name';

    await bookmarksAPIs.addBookmark(CDState,1,folderName1); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName2); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName3); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName4);
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);

    await bookmarksPage.dragDrop(folderName2, folderName1);
    await bookmarksPage.dragDrop(folderName3, folderName1);
    await bookmarksPage.dragDrop(folderName4, folderName1);

    await bookmarksPage.editSubItemNameByIndex(await bookmarksPage.mainFolderSubs.count() - 1, { name: NewFolderOneName });
    await cdPage.reload();
    await bookmarksPage.clickOnArrowFolder(folderName1);
    await expect(bookmarksPage.mainFolderSubs.last()).toContainText(NewFolderOneName);
  });

  test('Validate Item Position on the Root After Editing', async () => {
    const folderName1 = 'Folder One';
    const folderName2 = 'Folder Two';
    const folderName3 = 'Folder Three';
    const folderName4 = 'Folder Four';
    const NewFolderName = 'New Name';

    await bookmarksAPIs.addBookmark(CDState,1,folderName1); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName2); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName3); 
    await bookmarksAPIs.addBookmark(CDState,1,folderName4);
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);

    await bookmarksPage.dragDrop(folderName2, folderName1);
    await bookmarksPage.dragDrop(folderName3, folderName1);
    await bookmarksPage.dragDrop(folderName4, folderName1);
    await bookmarksPage.dragDropRoot(folderName2);

    await bookmarksPage.editItemNameByIndex(await bookmarksPage.RootFolder.count() - 1, { name: NewFolderName });
    await cdPage.reload();
    await expect(bookmarksPage.RootFolder).toContainText('New Name');
  });

  test('Validate Relocating a Subfolder to an Older one', async () => {
    const folderOneName = 'Folder 1';
    const folderTwoName = 'Folder 2';
    const linkName = `Link inside ${folderTwoName}`;

    const folderThreeName = 'Folder 3';
    const folderFourName = 'Folder 4';
    const linkTwoName = `Link inside ${folderFourName}`;
    const linkUrl = 'https://playwright.dev/docs/api/class-locator#locator-is-visible';

    const NewName = 'New Name';

    await bookmarksAPIs.addBookmark(CDState,1,folderOneName); 
    await bookmarksAPIs.addBookmark(CDState,1,folderTwoName,"",folderOneName); 
    await bookmarksAPIs.addBookmark(CDState,0,linkName,linkUrl,folderTwoName); 
    await bookmarksAPIs.addBookmark(CDState,1,folderThreeName); 
    await bookmarksAPIs.addBookmark(CDState,1,folderFourName,"",folderThreeName); 
    await bookmarksAPIs.addBookmark(CDState,0,linkTwoName,linkUrl,folderFourName); 
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);

    await bookmarksPage.editItemNameByIndex(await bookmarksPage.listOfMainFolderNames.count() - 1, { name: NewName });
    await bookmarksPage.editItemLocation(await bookmarksPage.SecondMainFolderNames.count() - 1, { location: folderTwoName });
    await bookmarksPage.clickOnArrowFolder(folderOneName);
    await bookmarksPage.clickOnArrowSubFolder(folderTwoName);
    // let FolderSubLevel = await bookmarksPage.ThirdSubFolderLocation.level();
    // console.log(FolderSubLevel);
    await expect(bookmarksPage.ThirdSubFolderLocation).toBeVisible();
  });

  test('Check the Visibility of the 3rd Subfolder', async () => {
    const folderOneName = 'Folder 1';
    const folderTwoName = 'Folder 2';
    const folderThreeName = 'Folder 3';

    await bookmarksAPIs.addBookmark(CDState,1,folderOneName); 
    await bookmarksAPIs.addBookmark(CDState,1,folderTwoName,"",folderOneName); 
    await bookmarksAPIs.addBookmark(CDState,1,folderThreeName,"",folderTwoName); 
    await Promise.all([
      cdPage.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
      cdPage.goto(`${envURL}AutoData/Bookmarks Page`, { waitUntil: 'networkidle' })
    ]);

    await bookmarksPage.FolderUILocation();

    await expect(bookmarksPage.ThirdSubfolderDisplay).toHaveCount(0);

    await bookmarksPage.LinkUILocation();
    await expect(bookmarksPage.ThirdSubfolderDisplay).toBeVisible();
  });

  test.afterEach(async () => {
    await browser.close();
  });
});
