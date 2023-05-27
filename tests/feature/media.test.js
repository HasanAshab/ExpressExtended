const app = require("main/app").default;
const supertest = require("supertest");
const DB = require("illuminate/utils/DB").default;
const request = supertest(app);
const Storage = require("illuminate/utils/Storage").default;
const Media = require("app/models/Media").default;

describe("Media", () => {
  
  beforeAll(async () => {
    Storage.mock();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it("should responds with a file", async () => {
    const media = await Media.factory().create();
    const response = await request
      .get(`/api/v1/media/${media._id}`)
      .set("Accept", "application/octet-stream");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/png");
    expect(Buffer.isBuffer(response.body)).toBe(true);
  });
});
