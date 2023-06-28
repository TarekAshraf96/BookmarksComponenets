const classes = require('multiple-extend');
const Environment = require('../../Data/Environment.json');
const envURL = Environment.CDURL;
const Sort = {
  Oldest: 'Oldest First',
  Newest: 'Newest First',
  AZ: 'Title A-Z',
  ZA: 'Title Z-A',
};

class Bookmarks {
    constructor(page, context) {
    // locators
    this.page = page;
    this.context = context;
    this.bookmarksDiv = page.locator('(//div[contains(@class,"dozen-bookmarks-component")])');
    this.emptyBookmarksMsg = page.locator('//div[contains(@class,"dozen-bookmarks-component")]//*[contains(@class,"dozen-bookmarks-empty-msg")]');
    this.addBookmarkEmptyButton = page.locator('//*[@id="add-bookmark-btn-empty"]');
    this.addBookmarkButton = page.locator('//*[@id="add-bookmark-btn"]');
    this.folderInput = page.locator('//input[@name="IsFolder"and@value="true"]');
    this.linkRadioButton = page.locator('//input[@name="IsFolder"and@value="false"]');
    this.titleInput = page.locator('//*[@id="Title"]');
    this.linkInput = page.locator('//*[@id="Link"]');
    this.locationDropDownMenu = page.locator('//div[@class="choices__inner"]');
    this.submitButton = page.locator('//*[@id="form-submit-btn"]');
    this.listOfMainFolderNames = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/div[1]/span');
    this.listOfMainFoldersThreeDotsButton = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/div[@class="dozen-list-menu-wrapper"]/button');
    this.listOfMainFolderDeleteButton = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/div[@class="dozen-list-menu-wrapper"]/ul/li/span[@class="delete-bookmark"]');
    this.listOfMainFolderEditButton = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/div[@class="dozen-list-menu-wrapper"]/ul/li/span[@class="edit-bookmark"]');
    this.listOfMainFolderSortButton = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/div[@class="dozen-list-menu-wrapper"]/ul/li/span[@class="sort-bookmark"]');
    this.confirmDelete = page.locator('//*[@class="dozen-confirm-btns"]/button[contains(text(),"Delete")]');
    this.titleValidationMsg = page.locator('//span[@x-text="formValidation.title.message"]');
    this.linkValidationMsg = page.locator('//span[@x-text="formValidation.link.message"]');
    this.sortDropDownButton = page.locator('//button[@class="dozen-sort-menu_toogle"]');
    this.oldestMainSortOption = page.locator('//ul[@class="dozen-sort_menu_list-inner"]/li/span[contains(text(),"Oldest First")]');
    this.newestMainSortOption = page.locator('//ul[@class="dozen-sort_menu_list-inner"]/li/span[contains(text(),"Newest First")]');
    this.titleAZMainSortOption = page.locator('//ul[@class="dozen-sort_menu_list-inner"]/li/span[contains(text(),"Title A-Z")]');
    this.titleAZMainSortOption = page.locator('//ul[@class="dozen-sort_menu_list-inner"]/li/span[contains(text(),"Title Z-A")]');
    this.listOfItemNamesInFirstFolder = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li[1]/ul/li//span[contains(@class,"jqtree-title")]');
    this.searchInput = page.locator('//*[@id="search-term"]');
    this.mainFolderSubs = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/ul');
    this.FirstSubFolderThreeDots = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/ul/li[1]/div[2]');
    this.FirstSubFoldSubEdit = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/ul/li[1]/div[2]/ul/li[1]/span');
    this.BookmarksTree = page.locator('//*[@id="dozen-bookmarks-tree"]');
    this.SecondarymainFolderSubs = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/ul');
    this.RootFolder = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li[1]/div[1]/span');
    this.SecondMainFolderNames = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li[2]/div[1]/span');
    this.SecondMainFolderThreeDots = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li[2]/div[2]/button');
    this.SecondMainFolderEditButton = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li[2]/div[2]/ul/li[1]/span');
    this.ThirdSubFolderLocation = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/ul/li/ul/li[2]/div[1]/span');
    this.ThirdSubfolderDisplay = page.locator('//div[@class="choices__list"]/div[text()="——— Folder 3"]');
    }

    async isNoBookmarksAdded() {
      await this.page.waitForLoadState('networkidle');
      return await this.emptyBookmarksMsg.isVisible();
    }
  
    async searchFor(text) {
      await this.searchInput.fill(text);
      await this.page.waitForLoadState('networkidle');
    }
  
    async dragDrop(from, to) {
      const originElement = await this.page.locator(`//span[text()="${from}"]`);
      const destinationElement = await this.page.locator(`//span[text()="${to}"]`);
  
      await originElement.hover();
      await this.page.waitForTimeout(500);
      await this.page.mouse.down();
      await this.page.waitForTimeout(500);
      const box = await destinationElement.boundingBox();
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.waitForTimeout(500);
      // await destinationElement.hover();
      await this.page.mouse.up();
      await this.page.waitForTimeout(500);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
    }
  
    async dragDropRoot(from) {
      const originElement = await this.page.locator(`//span[text()="${from}"]`);
      const destinationElement = await this.page.locator('//*[@id="dozen-bookmarks-tree"]');
  
      await originElement.hover();
      await this.page.waitForTimeout(500);
      await this.page.mouse.down();
      await this.page.waitForTimeout(500);
      const box = await destinationElement.boundingBox();
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 30);
      await this.page.waitForTimeout(500);
      // await destinationElement.hover();
      await this.page.mouse.up();
      await this.page.waitForTimeout(500);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
    }
  
    async clickAddNewBookmark() {
      if (await this.isNoBookmarksAdded()) {
        await this.addBookmarkEmptyButton.click();
      } else {
        await this.addBookmarkButton.click();
      }
    }
  
    async chooseBookmarkType(isFolder) {
      if (isFolder) {
        await this.folderInput.click();
      } else {
        await this.linkRadioButton.click();
      }
    }
  
    async FolderUILocation() {
      await Promise.all([
        this.page.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getUserFolder`)),
        this.clickAddNewBookmark()
      ]);
      await this.folderInput.click();
      await this.locationDropDownMenu.click();
    }
  
    async LinkUILocation() {
      await Promise.all([
        this.page.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getUserFolder`)),
        this.linkRadioButton.click()
      ]);
      await this.locationDropDownMenu.click();
    }
  
    async typeTitle(title) {
      await this.titleInput.fill(title);
    }
  
    async typeLink(link) {
      await this.linkInput.fill(link);
    }
  
    async chooseLocation(location) {
      await this.locationDropDownMenu.click();
      await this.page.waitForTimeout(500);
      await this.page.locator(`//div[@class="choices__list"]/div[text()="${location}"]`).click();
    }
  
    async chooseSubItemLocation(location) {
      await this.locationDropDownMenu.click();
      await this.page.waitForTimeout(500);
      await this.page.locator('//div[@class="choices__list"]/div[text()="' + '—— ' + `${location}"]`).click();
    }
  
    async clickOnArrowFolder(name) {
      await this.page.locator(`//*[@id="dozen-bookmarks-tree"]/ul/li/div[1]/span[text()="${name}"]//ancestor::li/div[1]/a`).click();
      await this.page.waitForTimeout(1000);
    }
  
    async clickOnArrowSubFolder(name) {
      await this.page.locator(`//*[@id="dozen-bookmarks-tree"]/ul/li/ul/li/div[1]/span[text()="${name}"]/..`).click();
      await this.page.waitForTimeout(1000);
    }
  
    async linkIsVisibleAndCorrect(folderName, linkName, linkUrl) {
      const linkIsVisible = await this.page.locator(`//*[@id="dozen-bookmarks-tree"]/ul/li/div[1]/span[text()="${folderName}"]//ancestor::li/ul/li[@data-type="link"]/a/span[text()="${linkName}"]`).isVisible();
      const linkUrlIsCorrect = (await this.page.locator(`//*[@id="dozen-bookmarks-tree"]/ul/li/div[1]/span[text()="${folderName}"]//ancestor::li/ul/li[@data-type="link"]/a/span[text()="${linkName}"]/..`).getAttribute('href')) == linkUrl;
      return linkIsVisible && linkUrlIsCorrect;
    }
  
    async createNewItem(options) {
      await Promise.all([
        this.page.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getUserFolder`)),
        this.clickAddNewBookmark()
      ]);
      await this.chooseBookmarkType(options.isFolder);
      await this.typeTitle(options.name);
      if (typeof options.link !== 'undefined') {
        await this.typeLink(options.link);
      }
      if (typeof options.location !== 'undefined') {
        await this.chooseLocation(options.location);
      }
      await Promise.all([
        this.page.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`)),
        this.submitButton.click()
      ]);
      await this.page.waitForLoadState('networkidle');
    }
  
    async editItemNameByIndex(index, options) {
      await this.listOfMainFoldersThreeDotsButton.nth(index).click();
      await this.listOfMainFolderEditButton.nth(index).click();
      await this.typeTitle(options.name);
      await Promise.all([
        this.page.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/updatebookmarks`)),
        this.submitButton.click()
      ]);
      await this.page.waitForLoadState('networkidle');
    }
  
    async editItemLocation(index, options) {
      await this.SecondMainFolderThreeDots.nth(index).click();
      await this.SecondMainFolderEditButton.nth(index).click();
      await this.chooseSubItemLocation(options.location);
      // await this.typeTitle(options.name);
      await Promise.all([
        this.page.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/updatebookmarks`)),
        this.submitButton.click()
      ]);
      await this.page.waitForLoadState('networkidle');
    }
  
    async editSubItemNameByIndex(index, options) {
      await this.FirstSubFolderThreeDots.nth(index).click();
      await this.FirstSubFoldSubEdit.nth(index).click();
      await this.typeTitle(options.name);
      await Promise.all([
        this.page.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/updatebookmarks`)),
        this.submitButton.click()
      ]);
      await this.page.waitForLoadState('networkidle');
    }
  
    async sortMainBy(sort) {
      await this.sortDropDownButton.click();
      await this.page.locator(`//ul[@class="dozen-sort_menu_list-inner"]/li/span[contains(text(),"${sort}")]`).click();
    }
  
    async sortFirstFolderBy(sort) {
      await this.listOfMainFoldersThreeDotsButton.first().click();
      await this.listOfMainFolderSortButton.first().click();
      await this.page.locator(`//*[@id="dozen-bookmarks-tree"]/ul/li/div[@class="dozen-list-menu-wrapper"]/ul/li/span[@class="sort-bookmark"]/../ul/li/span[contains(text(),"${sort}")]`).click();
      await this.page.waitForLoadState('networkidle');
    }
  
    async deleteFirstItem() {    
      await this.listOfMainFoldersThreeDotsButton.first().click();
      await this.listOfMainFolderDeleteButton.first().click();
      await Promise.all([
        this.confirmDelete.click(),
        this.page.waitForResponse(response => response.url().startsWith(`${envURL}api/dozen/1.0/bookmarks/updatebookmarks`))
      ]);
    }
    
    
  }
  module.exports = Bookmarks;
  