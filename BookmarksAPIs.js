const { request,expect } = require('@playwright/test');

const Environment = require('../Data/Environment.json');

const envURL = Environment.CDURL;

class BookmarksAPIs {

  static async getAllRootBookmarks(storageState) {
    const requestContext = await request.newContext({ storageState });
    const response = await requestContext.get(`${envURL}api/dozen/1.0/bookmarks/getBookmarks`, {
      params: {
        node:null,
        sortType:1,
        sortCriteria:1
      },
    });
    //await expect(response).toBeOK();
    const responseBodyJson = JSON.stringify(await response.json());
    if (JSON.parse(responseBodyJson) == null) { return { Bookmarks: [] }; }
    return JSON.parse(responseBodyJson);
  }

  static async getAllFolders(storageState) {
    const requestContext = await request.newContext({ storageState });
    const response = await requestContext.get(`${envURL}api/dozen/1.0/bookmarks/getUserFolders`, {
      params: {
        sortType:1,
        sortCriteria:1
      },
    });
    await expect(response).toBeOK();
    const responseBodyJson = JSON.stringify(await response.json());
    if (JSON.parse(responseBodyJson) == null) { return { Folders: [] }; }
    return JSON.parse(responseBodyJson);
  }

  static async deleteBookmark(storageState, bookmarkId) {
    const requestContext = await request.newContext({ storageState });
    const response = await requestContext.patch(`${envURL}api/dozen/1.0/bookmarks/updatebookmarks`,{data:{Delete:[{Id:bookmarkId}]}});
    await expect(response).toBeOK();
    const responseBodyJson = JSON.stringify(await response.json());
    expect(responseBodyJson).toContain('Succeeded\":true');
  }

  static async addBookmark(storageState,isFolder,title,link,parentName) {
    const requestContext = await request.newContext({ storageState });

    const payload = {
      data: {
        IsFolder: isFolder,
        Title: title,
      },
    };
    if (link) {
      payload.data.Link = link;
    }
    if (parentName) {
      const allFolders = await this.getAllFolders(storageState);
      const parentObj = allFolders.find(obj=> obj.Title === parentName);
      payload.data.ParentId = parentObj.Id;
    }

    const response = await requestContext.post(`${envURL}api/dozen/1.0/bookmarks/addBookmark`,payload);
    await expect(response).toBeOK();
    const body = await response.text();
    
  }

  
}
module.exports = BookmarksAPIs;
