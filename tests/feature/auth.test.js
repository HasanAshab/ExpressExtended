const app = require("main/app").default;
const supertest = require("supertest");
const DB = require("illuminate/utils/DB").default;
const request = supertest(app);
const bcrypt = require("bcryptjs");
const Storage = require("illuminate/utils/Storage").default;
const Mail = require("illuminate/utils/Mail").default;
const User = require("app/models/User").default;
const events = require("events");

describe("Auth", () => {
  let user;
  let token;

  beforeAll(async () => {
    Mail.mock();
    Storage.mock();
  });
  
  beforeEach(async () => {
    await resetDatabase();
    Mail.mocked.reset();
    Storage.mocked.reset();
    user = await User.factory().create();
    token = user.createToken();
    await new Promise(process.nextTick)
  });

  it("should register a user", async () => {
    const dummyUser = User.factory().dummyData();
    const response = await request
      .post("/api/v1/auth/register")
      .field("name", dummyUser.name)
      .field("email", dummyUser.email)
      .field("password", dummyUser.password)
      .field("password_confirmation", dummyUser.password)
      .attach("logo", fakeFile("image.png"));
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty("token");
    const emitter = new events.EventEmitter();
    emitter.on("Registered", (user) => {
      expect(user.email).toEqual(dummyUser.email);
      done();
    });
  });

  it("should login a user", async () => {
    const response = await request
      .post("/api/v1/auth/login")
      .field("email", user.email)
      .field("password", "password");
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("token");
  });

  it("should verify email", async () => {
    const verificationToken = await user.sendVerificationEmail();
    const response = await request.get("/api/v1/auth/verify").query({
      id: user._id.toString(),
      token: verificationToken,
    });
    user = await User.findById(user._id);
    expect(response.statusCode).toBe(200);
    expect(user.emailVerified).toBe(true);
  });

  it("should resend verification email", async () => {
    const response = await request
      .post("/api/v1/auth/verify/resend")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    const { total, recipients } = Mail.mocked.data;
    expect(total).toBe(1);
    expect(recipients).toHaveProperty([user.email, "verification"]);
  });

  it("should get user details", async () => {
    const response = await request
      .get("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.email).toBe(user.email);
  });

  it("should update user details", async () => {
    const newUserData = {
      name: "changed",
      email: "changed@gmail.com",
    };
    const response = await request
      .put("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .field("name", newUserData.name)
      .field("email", newUserData.email)
      .attach("logo", fakeFile("image.png"));
    user = await User.findById(user._id);
    
  console.log(Storage.mocked.data)
    expect(response.statusCode).toBe(200);
    expect(user.name).toBe(newUserData.name);
    expect(user.email).toBe(newUserData.email);
    const { total, recipients } = Mail.mocked.data;
    expect(total).toBe(1);
    expect(recipients).toHaveProperty([user.email, "verification"]);
  });

  it("should change password", async () => {
    const passwords = {
      old: "password",
      new: "new-password",
    };
    const response = await request
      .put("/api/v1/auth/password/change")
      .set("Authorization", `Bearer ${token}`)
      .field("old_password", passwords.old)
      .field("password", passwords.new);

    user = await User.findById(user._id);
    const passwordMatch = await bcrypt.compare(passwords.new, user.password);
    expect(response.statusCode).toBe(200);
    expect(passwordMatch).toBe(true);
    const { total, recipients } = Mail.mocked.data;
    expect(total).toBe(1);
    expect(recipients).toHaveProperty([user.email, "passwordChanged"]);
  });

  it("forgoting password should sent reset email", async () => {
    const response = await request
      .post("/api/v1/auth/password/forgot")
      .field("email", user.email);
    expect(response.statusCode).toBe(200);
    const { total, recipients } = Mail.mocked.data;
    expect(total).toBe(1);
    expect(recipients).toHaveProperty([user.email, "forgotPassword"]);
  });

  it("should reset password", async () => {
    const resetToken = await user.sendResetPasswordEmail();
    Mail.mocked.reset();
    const newPassword = "new-password";
    const response = await request
      .put("/api/v1/auth/password/reset")
      .field("id", user._id.toString())
      .field("password", newPassword)
      .field("token", resetToken);

    user = await User.findById(user._id);
    const passwordMatch = await bcrypt.compare(newPassword, user.password);
    expect(response.statusCode).toBe(200);
    expect(passwordMatch).toBe(true);
    const { total, recipients } = Mail.mocked.data;
    expect(total).toBe(1);
    expect(recipients).toHaveProperty([user.email, "passwordChanged"]);
  });
});
